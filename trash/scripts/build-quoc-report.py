"""Build Quoc's English report using saved project evidence and original screenshots."""
from pathlib import Path
import json
import hashlib
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / 'frontend/node_modules/.verification/quoc-report'
TMP.mkdir(parents=True, exist_ok=True)
OUT = ROOT / 'docs/reports/report-quoc-final.docx'
V1 = ROOT / 'docs/transaction log/transaction_v1/ganache log v1'
V2 = ROOT / 'docs/transaction log/transaction_v2'
load = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
rows1 = [json.loads(x) for x in (V1/'transactions.jsonl').read_text().splitlines()]
rows2 = [json.loads(x) for x in (V2/'transactions.jsonl').read_text().splitlines()]
for folder, rows in [(V1, rows1), (V2, rows2)]:
    summary = load(folder/'summary.json')
    assert len(rows) == summary['transaction_count']
    assert sum(int(r['actual_fee_wei']) for r in rows) == int(summary['total_actual_fee_wei'])
    for r in rows:
        assert int(r['raw_receipt']['status'],16) == 1
        assert int(r['raw_receipt']['gasUsed'],16) == r['gas_used']
        assert int(r['raw_receipt']['effectiveGasPrice'],16) * r['gas_used'] == int(r['actual_fee_wei'])
assert [r['block_number'] for r in rows2] == list(range(17,26))
assert sum(r['gas_used'] for r in rows1[:9]) == 3120968
assert sum(r['gas_used'] for r in rows2) == 2770148
assert sum(int(r['actual_fee_wei']) for r in rows2) == 14777931549405433
assert rows2[0]['created_contract_address'].lower() == '0x703d2ab4ab6f36889741a44fec83b9fefa4f5eae'

# A compact architecture figure drawn from the implemented communication paths.
im = Image.new('RGB',(1800,590),'white'); draw = ImageDraw.Draw(im)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf',29)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf',25)
def box(rect, lines):
    draw.rounded_rectangle(rect, radius=12, fill='#F4F6F8',outline='#6D7883',width=2)
    x0,y0,x1,y1=rect
    for i,t in enumerate(lines):
        w=draw.textlength(t,font=font);draw.text(((x0+x1-w)/2,y0+20+i*37),t,font=font,fill='#17212B')
def arrow(points,label=None,xy=None):
    draw.line(points,fill='#34495E',width=4)
    x,y=points[-1];px,py=points[-2]
    if x>px: poly=[(x,y),(x-14,y-8),(x-14,y+8)]
    elif y>py: poly=[(x,y),(x-8,y-14),(x+8,y-14)]
    else: poly=[(x,y),(x+14,y-8),(x+14,y+8)]
    draw.polygon(poly,fill='#34495E')
    if label:draw.text(xy,label,font=small,fill='#34495E')
box((15,205,330,335),['Trace frontend','HTML CSS JavaScript'])
box((450,60,960,180),['Public reads','ethers JsonRpcProvider'])
box((450,355,960,475),['Signed writes','BrowserProvider and MetaMask'])
box((1080,205,1390,335),['Ganache RPC','Chain ID 1337'])
box((1490,205,1780,335),['SupplyChainV2','Roles and history'])
arrow([(330,240),(390,240),(390,120),(450,120)],'No wallet',(400,15))
arrow([(330,300),(390,300),(390,415),(450,415)],'User confirms',(465,493))
arrow([(960,120),(1020,120),(1020,240),(1080,240)])
arrow([(960,415),(1020,415),(1020,300),(1080,300)])
arrow([(1390,270),(1490,270)])
draw.text((20,550),'Hardhat Ignition and verified export supply the ABI and local deployment configuration.',font=small,fill='#34495E')
ARCH=TMP/'architecture.png';im.save(ARCH)

doc=Document();sec=doc.sections[0]
sec.page_width=Inches(8.27);sec.page_height=Inches(11.69)
sec.top_margin=sec.bottom_margin=Inches(.63)
sec.left_margin=sec.right_margin=Inches(.70)
sec.footer_distance=Inches(.28)
for name,size in [('Normal',10.5),('Title',23),('Subtitle',11),('Heading 1',15),('Heading 2',11.5),('Caption',9)]:
    s=doc.styles[name];s.font.name='Calibri';s.font.size=Pt(size);s.font.color.rgb=RGBColor(0,0,0)
    s.paragraph_format.space_after=Pt(6);s.paragraph_format.line_spacing=1.06
    if name in ['Title','Subtitle','Heading 1','Heading 2']:s.paragraph_format.keep_with_next=True
    for border in list(s.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
    for fonts in s.element.iter(qn('w:rFonts')):
        for attr in list(fonts.attrib):
            if 'theme' in attr.lower():del fonts.attrib[attr]
doc.styles['Title'].font.bold=True
doc.styles['Caption'].font.italic=False
doc.styles['Normal'].paragraph_format.widow_control=True
lang=OxmlElement('w:lang');lang.set(qn('w:val'),'en-US');doc.styles['Normal'].element.get_or_add_rPr().append(lang)
doc.core_properties.title='Frontend Deployment and Integration Report'
doc.core_properties.subject='DS441A Project 7 Team 5 Supply Chain Product Tracking'
doc.core_properties.author='Mai Nam Quốc'
doc.core_properties.keywords='Ganache, MetaMask, ethers, QR, SupplyChainV2'
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('DS441A Team 5  |  Mai Nam Quoc  |  ').font.size=Pt(8)
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)

def p(t,style=None):return doc.add_paragraph(t,style)
def h(t):doc.add_heading(t,level=1)
def sub(t):doc.add_heading(t,level=2)
def page(t):doc.add_page_break();h(t)
def table(headers,rows,widths):
    t=doc.add_table(rows=1, cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
    for c,w in zip(t.columns,widths):c.width=Inches(w)
    for c,txt in zip(t.rows[0].cells,headers):c.text=txt
    for row in rows:
        for c,txt in zip(t.add_row().cells,row):c.text=str(txt)
    pr=t._tbl.tblPr
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        e=OxmlElement('w:'+edge);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
    pr.append(borders)
    for i,row in enumerate(t.rows):
        trpr=row._tr.get_or_add_trPr();nosplit=OxmlElement('w:cantSplit');trpr.append(nosplit)
        if i==0:trpr.append(OxmlElement('w:tblHeader'))
        for j,c in enumerate(row.cells):
            c.width=Inches(widths[j]);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            mar=OxmlElement('w:tcMar')
            for edge in ['top','left','bottom','right']:
                e=OxmlElement('w:'+edge);e.set(qn('w:w'),'85');e.set(qn('w:type'),'dxa');mar.append(e)
            c._tc.get_or_add_tcPr().append(mar)
            sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'253E53' if i==0 else ('F1F5F8' if i%2 else 'FFFFFF'));c._tc.get_or_add_tcPr().append(sh)
            for par in c.paragraphs:
                par.paragraph_format.space_after=Pt(1);par.paragraph_format.line_spacing=1.02
                for r in par.runs:r.font.size=Pt(9);r.bold=(i==0);r.font.color.rgb=RGBColor.from_string('FFFFFF' if i==0 else '000000')
    p('') .paragraph_format.space_after=Pt(0)
    return t
def picture(path,width,caption,alt):
    par=p('');par.alignment=WD_ALIGN_PARAGRAPH.CENTER;par.paragraph_format.space_after=Pt(3)
    shape=par.add_run().add_picture(str(path),width=Inches(width));shape._inline.docPr.set('descr',alt)
    p(caption,'Caption')

p('Frontend Deployment and Integration Report','Title')
p('Supply Chain Product Tracking','Subtitle')
p('Mai Nam Quốc  |  Student ID 29211145181\nDS441A  |  Project 7  |  Team 5  |  17 November 2026')
h('1 Purpose and contribution')
p('Trace is a web application for tracking product custody from Producer to Distributor, Retailer and Customer on a local Ganache blockchain. My contribution covers deployment integration, the frontend, MetaMask transactions, public product lookup, QR processing and the installation documentation. The recorded workflows reach Delivered with the Customer as holder and four ordered history entries. [1, 5, 6]')
p('Phạm Thu Huyền is responsible for the Solidity contracts, contract tests, security analysis and gas optimization. We share system integration and preparation of the group submission. This report describes my implementation and its verification; the detailed contract design and optimization analysis belong to the corresponding group sections. [1]')
h('2 System architecture')
p('The interface uses HTML, CSS and JavaScript with Vite 8.3.8, ethers 6.17.0, qrcode 1.5.4 and html5-qrcode 2.3.8. It communicates directly with Ganache through JSON-RPC without an application backend. Separate providers support public reading and wallet-authorized writing. [2]')
picture(ARCH,6.75,'Figure 1  Communication paths implemented by the frontend. Source: project services and deployment scripts. [2, 3]','Architecture showing separate public read and MetaMask write paths from Trace to Ganache and SupplyChainV2')
p('Public lookup uses JsonRpcProvider and requires neither a wallet connection nor a signature. State changes use BrowserProvider with a Signer selected through MetaMask. The contract enforces roles and custody rules for every write; interface controls help users select valid actions. A wallet must hold local test ETH to pay transaction fees. [2]')

page('3 Deployment and configuration')
p('Hardhat Ignition deploys the current SupplyChainV2 contract through SupplyChainV2Module. The deploy:local npm script explicitly selects the default build profile: Solidity 0.8.34, Paris EVM and optimizer disabled. Ganache uses RPC http://127.0.0.1:7545 in the recorded environment. Chain ID 1337 identifies the chain for wallet interaction; Network ID 5777 is a separate value. [3]')
p('The deployer receives DEFAULT_ADMIN_ROLE and must grant the four participant roles separately. Admin does not automatically receive Producer privileges. The recorded environment uses five wallets for Admin, Producer, Distributor, Retailer and Customer. Wallet labels are descriptive; actual permissions are read through role getters and hasRole. [2, 3]')
table(['Recorded deployment','V1','V2'],[
('Contract','SupplyChain','SupplyChainV2'),('Deployment block','1','17'),('Deployment gas','2,502,495','2,151,867'),('Product flow blocks','6–9 and 10–13','22–25'),('Example product','COFFEE-DEMO-001','COFFEE v2-1')],[2.20,2.30,2.30])
p('The V1 address is 0x843b273a8c67bcab604f14fd466162cbdbb556b9. The V2 address is 0x703d2ab4ab6f36889741a44fec83b9fefa4f5eae. These addresses identify the saved local deployments and are not portable configuration values for other machines. [6]')
sub('Verified ABI and configuration export')
p('scripts/export-frontend.mjs reads the configured RPC, current artifact and Ignition deployment record. It verifies matching artifact ABI and runtime bytecode, the live bytecode, the successful deployment receipt and the deployer’s Admin role before writing frontend files. These checks detect stale addresses and source or build-profile mismatches. [3]')
p('The generated deployment.local.json contains contractName, contractAddress, rpcUrl and decimal chainId as a string. The exported ABI retains the filename SupplyChain.json while containing V2 definitions. Local configuration and deployment journals are ignored by Git. The example configuration and runtime validation let a clean frontend display setup guidance when local configuration is missing or malformed. [2, 3]')
sub('Version migration and reproducibility')
p('V1 and V2 are separate contracts. A new deployment requires the matching ABI and address, fresh role registration and new product records; existing history does not migrate automatically. The current export script targets V2, whereas the older deployment summary and acceptance reports retain V1 snapshots. The report therefore identifies the version of each result. [3, 5, 6]')
p('The reproducible sequence is to install the root and frontend dependencies, compile with the selected profile, run deploy:local, run export:frontend and start the Vite development server. The README contains the complete commands and MetaMask setup. A workspace change requires deployment verification and a new export before further use. [3]')

page('4 Interface and wallet transactions')
p('The interface separates Overview, Product lookup, Operations, Access control and QR and camera. It displays network availability, the selected wallet and its current on-chain roles. Admin grants participant roles; Producer creates a product; the current holder transfers it to the next registered role. [2]')
picture(V2/'img/Producer_create_product.png',5.95,'Figure 2  V2 creation of COFFEE v2-1 confirmed at block 22 with 146,889 gas. The displayed transaction hash matches the saved receipt. Original screenshot from transaction_v2/img. [6]','Original V2 interface screenshot showing Producer connected, product creation confirmed in block 22 and gas used 146889')
p('Before requesting a signature, the application rechecks the account, wallet and RPC Chain IDs, contract code, active roles, holder and stage, then performs a staticCall simulation. Submission is locked while pending. A transaction hash records submission; confirmation requires a successful receipt. The result panel reports the hash, block and gas actually used. [2]')
p('Account, chain and disconnect events invalidate the previous writer immediately. Generation checks prevent a delayed role response from restoring an obsolete signer. Wrong-network writes remain disabled. Explicit connection and network-switch controls prevent repeated permission requests after disconnect. [2]')
p('V2 custom errors are decoded from the ABI and mapped to readable messages, including ProductExists, NotCurrentHolder and AlreadyDelivered. The interface also distinguishes wallet rejection, insufficient funds and RPC failures. Preflight rejection or refusal to sign creates no mined transaction and must be distinguished from a receipt with failed status. [2, 5]')

page('5 Product history and QR processing')
p('Product lookup calls getProduct and getHistory at the same block so the holder and timeline describe one consistent state. Product IDs are trimmed, preserve case and are passed as literal strings. Unknown IDs return exists=false and empty history; changing the input or encountering an RPC error clears stale results. [2]')
picture(V2/'img/trace product_v2.png',4.70,'Figure 3  V2 lookup shows COFFEE v2-1 at Delivered with the Customer holder and four history entries. The displayed times match blocks 22–25 on 16 November 2026 in UTC+7. Original screenshot from transaction_v2/img. [6]','V2 product lookup with Delivered state, Customer holder and the four ordered custody history entries')
p('The first entry represents initialization from the zero address. Subsequent entries preserve the contract array order, including when timestamps are equal. Blockchain timestamps are in seconds; the frontend converts them for display in the browser’s local time zone. [2]')
p('QR PNGs contain only the product ID. Decoding triggers the same lookup as manual entry, and text resembling a URL or HTML is treated as an ID. The scanner starts after a user action, suppresses repeated callbacks and releases camera tracks before querying the decoded product. Stop, navigation and page departure also clean up the camera. Image-file decoding provides an alternative input path. [2]')
p('Physical webcam scanning and release were accepted for V1. The V2 scan_V2.png image shows a generated QR and “Camera is off”; it establishes generation, not a completed V2 webcam scan. A phone may display the QR for a laptop webcam, but opening localhost on the phone does not reach the laptop application. [5, 6]')

page('6 Integration verification and operational limits')
p('Verification combines saved command output, isolated browser checks, original screenshots and transaction receipts. The V1 step 08 record contains 27 passing contract tests, 25 passing frontend service tests and 13 passing isolated Edge checks, plus successful compile, typecheck, build and export. These counts describe that recorded run; they do not establish the current V2 test count. [4]')
table(['Area','Method and version','Recorded outcome'],[
('Public lookup','V1 browser without a wallet','Product and four history entries read successfully'),
('MetaMask lifecycle','V1 manual replay and receipts','Creation and three handovers; final Delivered state'),
('Negative operations','V1 manual UI and read checks','Rejected signing, duplicate ID and invalid recipient; no broadcast for rejected attempts'),
('Wallet recovery','V1 simulated account/network provider','Automated coverage; actual disconnect/reconnect and network-return cases waived and not run'),
('Physical QR','V1 manual camera acceptance','Decoded product, automatic release and explicit stop confirmed'),
('V2 product lifecycle','Original UI images and blocks 18–25','Four role grants, creation and three handovers have successful receipts'),
('V2 QR','Original QR-ready screenshot','Generation evidenced; physical scan not established')],[1.08,2.16,3.56])
sub('Custody rules observed by the interface')
p('Creation establishes Produced with the Producer as holder and one history entry. The three transfers advance to AtDistributor, AtRetailer and Delivered, producing two, three and four entries respectively. The sender must be the current holder with the active role required for that stage, and the recipient must have the next role. A revoked holder remains recorded as holder but cannot transfer until the role is restored. Self-transfer and further transfer after Delivered are rejected. [2, 7]')
p('The V2 receipts confirm creation at block 22 followed by handovers at blocks 23, 24 and 25. The final screenshot identifies the Customer as holder with all four events. This recorded positive flow is separate from the broader negative-case and webcam acceptance performed on V1. [5, 6]')
sub('Security and operating boundaries')
p('Role checks and preflight simulation improve usability, while Solidity remains the enforcement boundary. Dynamic product data and errors are rendered as text. The frontend handles missing configuration, unavailable RPC and stale asynchronous responses without presenting an earlier product as a new successful result. [2]')
p('The trusted Admin controls registration, and on-chain product data is public. Custody changes take effect immediately without a recipient signature. A QR may be copied and does not authenticate physical goods. The application depends on the local node, wallet and deployment configuration; resetting Ganache can remove demo state. It has no application backend, public hosting or complete product enumeration service. [2, 7]')

page('7 Gas presentation and conclusion')
p('The frontend includes a separate gas comparison view based on fixed exports from 16 November 2026. It is a presentation of recorded receipts rather than a live blockchain monitor. Matched pairs, workload scopes and caveats are exposed separately. The numerical comparison below uses V1 blocks 1–9 and V2 blocks 17–25. [6, 8]')
table(['Operation','V1 gas','V2 gas','Difference'],[
('Deployment','2,502,495','2,151,867','350,628'),('Four role grants combined','208,958','208,958','0'),('Create product','146,937','146,889','48'),('Producer to Distributor','87,258','87,210','48'),('Distributor to Retailer','87,526','87,478','48'),('Retailer to Customer','87,794','87,746','48'),('Matched nine transactions','3,120,968','2,770,148','350,820')],[2.75,1.33,1.33,1.39])
p('The matched set uses 11.2407% less gas in V2. Its actual fees are 0.017061638125000000 ETH for V1 and 0.014777931549405433 ETH for V2. Deployment gas prices differ, so the fee reduction cannot be attributed entirely to code. The full V1 snapshot has 16 transactions and must not be compared with nine V2 transactions as an equivalent workload. [6, 8]')
p('The V2 source replaces project-defined revert strings with custom errors. Deployment gas falls by 350,628 gas, while the four role grants are unchanged. Each successful product operation differs by 48 gas, matching the calldata charge difference between the 15-byte V1 ID and the 11-byte V2 ID. These successful calls do not establish lower execution gas. Isolating runtime improvements requires identical input data and comparable execution conditions. [7, 8]')
sub('Conclusion')
p('My work connects the deployed contract to an English interface that supports authorized transactions and public tracing through a product ID or QR. Verified export checks reduce configuration mismatches, and wallet lifecycle handling prevents use of a stale signer. V1 has detailed wallet and physical-camera acceptance; V2 has a recorded successful custody flow and final product history. The next validation priority is V2 regression coverage, including custom-error feedback and physical QR scanning, followed by clean-setup and demo rehearsal verification. [2–8]')
sub('Project references')
refs=[
'[1] DS441A_Blockchain_Team5.md, parent directory. Assignment requirements and member responsibilities.',
'[2] frontend/package.json; frontend/src/main.js, wallet-ui.js, lookup-ui.js; services/blockchain.js, wallet.js, products.js and camera.js; config/ and abi/.',
'[3] README.md; hardhat.config.ts; package.json; ignition/modules/SupplyChain.ts; scripts/export-frontend.mjs; docs/deployments/ganache-summary.json.',
'[4] docs/verification/integration-checks.json and integration-browser.json. Recorded step 08 automated verification.',
'[5] docs/verification/integration.md, integration-chain-replay.json and integration-screenshots/; lookup-qr.md; docs/reports/step-08-integration-acceptance.docx.',
'[6] docs/transaction log/transaction_v1/ganache log v1/ and transaction_v2/: transactions.jsonl, summary.json and V2 img/.',
'[7] contracts/SupplyChain.sol and SupplyChain_ver2.sol; docs/CONTRACT_INTERFACE.md and CONTRACT_INTERFACE_ver2.md; test/SupplyChain_ver2.test.ts.',
'[8] docs/reports/comparision_gas_v1_v2.docx; frontend/src/gas-comparison.js and data/gas-comparison.json. Receipt totals take precedence over display rounding.'
]
for txt in refs:
    par=p(txt);par.paragraph_format.space_after=Pt(3);par.paragraph_format.line_spacing=1.0
    for r in par.runs:r.font.size=Pt(8)
OUT.parent.mkdir(exist_ok=True)
doc.save(OUT)
print(json.dumps({'output':str(OUT),'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'v1ReceiptsValidated':len(rows1),'v2ReceiptsValidated':len(rows2),'originalScreenshots':2,'architectureFigure':1},indent=2))
