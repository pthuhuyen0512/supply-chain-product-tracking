"""Read-only Ganache JSON-RPC export. Uses only the Python standard library."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


def units(value, decimals=18):
    whole, fraction = divmod(value, 10 ** decimals)
    return f"{whole}.{fraction:0{decimals}d}"


def integer(value):
    return int(value, 16) if value is not None else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rpc', default='http://127.0.0.1:7545')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    started = datetime.now(timezone.utc)
    output = args.output or Path(__file__).parent / ('ganache_' + started.strftime('%Y%m%dT%H%M%SZ'))
    output.mkdir(parents=True, exist_ok=False)

    def rpc(method, params=None):
        request = Request(args.rpc, data=json.dumps({
            'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params or []
        }).encode(), headers={'Content-Type': 'application/json'})
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
        if 'error' in result:
            raise RuntimeError(f'{method}: {result["error"]}')
        return result['result']

    chain_id = integer(rpc('eth_chainId'))
    network_id = rpc('net_version')
    latest = integer(rpc('eth_blockNumber'))
    blocks = [rpc('eth_getBlockByNumber', [hex(n), True]) for n in range(latest + 1)]
    assert all(b and integer(b['number']) == n for n, b in enumerate(blocks)), 'Missing block'
    records = []
    hashes = set()
    for n, block in enumerate(blocks):
        if n:
            assert block['parentHash'] == blocks[n - 1]['hash'], 'Broken block chain'
        block_gas = 0
        for tx in block['transactions']:
            receipt = rpc('eth_getTransactionReceipt', [tx['hash']])
            assert receipt and receipt['transactionHash'] == tx['hash'], 'Missing receipt'
            assert receipt['blockHash'] == block['hash'] == tx['blockHash'], 'Snapshot changed'
            assert tx['hash'] not in hashes, 'Duplicate transaction'
            hashes.add(tx['hash'])
            gas_used = integer(receipt['gasUsed'])
            price_hex = receipt.get('effectiveGasPrice')
            price_source = 'receipt.effectiveGasPrice'
            if price_hex is None:
                if integer(tx.get('type')) == 2:
                    price_hex = hex(min(integer(tx['maxFeePerGas']),
                                        integer(block['baseFeePerGas']) + integer(tx['maxPriorityFeePerGas'])))
                    price_source = 'min(maxFeePerGas, block.baseFeePerGas + maxPriorityFeePerGas)'
                else:
                    price_hex = tx['gasPrice']
                    price_source = 'transaction.gasPrice'
            price = integer(price_hex)
            fee = gas_used * price
            value = integer(tx['value'])
            block_gas += gas_used
            status = integer(receipt.get('status'))
            records.append({
                'transaction_hash': tx['hash'],
                'block_number': n,
                'block_hash': block['hash'],
                'transaction_index': integer(tx['transactionIndex']),
                'timestamp_unix': integer(block['timestamp']),
                'timestamp_utc': datetime.fromtimestamp(integer(block['timestamp']), timezone.utc).isoformat(),
                'chain_id': chain_id,
                'network_id': network_id,
                'from_address': tx['from'],
                'to_address': tx['to'],
                'created_contract_address': receipt.get('contractAddress'),
                'transaction_type': integer(tx.get('type')),
                'nonce': integer(tx['nonce']),
                'status': 'success' if status == 1 else 'failed' if status == 0 else 'unknown',
                'value_wei': str(value),
                'value_eth': units(value),
                'gas_limit': integer(tx['gas']),
                'gas_used': gas_used,
                'gas_price_wei': str(price),
                'gas_price_gwei': units(price, 9),
                'gas_price_source': price_source,
                'transaction_gas_price_wei': str(integer(tx['gasPrice'])) if tx.get('gasPrice') else None,
                'max_fee_per_gas_wei': str(integer(tx['maxFeePerGas'])) if tx.get('maxFeePerGas') else None,
                'max_priority_fee_per_gas_wei': str(integer(tx['maxPriorityFeePerGas'])) if tx.get('maxPriorityFeePerGas') else None,
                'block_base_fee_per_gas_wei': str(integer(block['baseFeePerGas'])) if block.get('baseFeePerGas') else None,
                'actual_fee_wei': str(fee),
                'actual_fee_eth': units(fee),
                'sender_cost_including_value_wei': str(fee + (value if status == 1 else 0)),
                'sender_cost_including_value_eth': units(fee + (value if status == 1 else 0)),
                'input_data': tx['input'],
                'function_selector': tx['input'][:10] if tx['to'] and len(tx['input']) >= 10 else None,
                'logs': receipt.get('logs', []),
                'raw_transaction': tx,
                'raw_receipt': receipt,
            })
        assert block_gas == integer(block['gasUsed']), f'Gas mismatch in block {n}'

    # Recheck the captured head to detect resets/reorganizations during extraction.
    assert rpc('eth_getBlockByNumber', [hex(latest), False])['hash'] == blocks[-1]['hash'], 'Head changed'
    head_at_end = integer(rpc('eth_blockNumber'))
    pending_block = rpc('eth_getBlockByNumber', ['pending', True])
    pending = [tx for tx in (pending_block or {}).get('transactions', []) if tx['hash'] not in hashes]
    total_fee = sum(int(r['actual_fee_wei']) for r in records)
    summary = {
        'schema_version': 1,
        'export_started_at_utc': started.isoformat(),
        'export_finished_at_utc': datetime.now(timezone.utc).isoformat(),
        'rpc_url': args.rpc,
        'chain_id': chain_id,
        'network_id': network_id,
        'genesis_hash': blocks[0]['hash'],
        'snapshot_head_hash': blocks[-1]['hash'],
        'first_block': 0,
        'last_block': latest,
        'head_at_end': head_at_end,
        'block_count': len(blocks),
        'transaction_count': len(records),
        'successful_transaction_count': sum(r['status'] == 'success' for r in records),
        'failed_transaction_count': sum(r['status'] == 'failed' for r in records),
        'pending_transaction_count': len(pending),
        'total_gas_used': sum(r['gas_used'] for r in records),
        'total_actual_fee_wei': str(total_fee),
        'total_actual_fee_eth': units(total_fee),
        'validation': {'contiguous_blocks': True, 'linked_block_hashes': True,
                       'unique_transaction_hashes': True, 'all_receipts_present': True,
                       'receipt_gas_matches_every_block': True, 'snapshot_head_rechecked': True},
        'fee_formula': 'actual_fee_wei = gas_used * gas_price_wei; actual_fee_eth = actual_fee_wei / 10^18',
    }
    for name, rows in [('transactions.jsonl', records), ('blocks.raw.jsonl', blocks), ('pending.raw.jsonl', pending)]:
        with (output / name).open('w', encoding='utf-8', newline='\n') as file:
            for row in rows:
                file.write(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n')
    (output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output_directory': str(output.resolve()), **summary}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
