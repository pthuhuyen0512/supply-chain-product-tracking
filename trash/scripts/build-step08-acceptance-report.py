"""Build the English step 08 acceptance report from original images and chain evidence."""
import json
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'docs' / 'verification'
IMAGES = EVIDENCE / 'integration-screenshots'
OUT = ROOT / 'docs' / 'reports' / 'step-08-integration-acceptance.docx'
load = lambda name: json.loads((EVIDENCE / name).read_text(encoding='utf8'))
chain = load('integration-chain-replay.json')
batch = load('integration-manual-batch-a.json')
checks = load('integration-checks.json')
browser = load('integration-browser.json')
manifest = json.loads((IMAGES / 'manifest.json').read_text(encoding='utf8'))
assert chain['fullFlow'] and len(chain['history']) == 4 and len(manifest) == 10
assert all(r['exitCode'] == 0 for r in checks['records'])
assert len(browser['checks']) == 13 and all(r['status'] == 'pass' for r in browser['checks'])
assert batch['oldProductAndHistoryUnchanged'] and not chain['rejectedProductExists']
for row in manifest:
    assert hashlib.sha256((IMAGES / row['file']).read_bytes()).hexdigest() == row['sha256']

doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = Inches(.65)
section.left_margin = section.right_margin = Inches(.7)
section.header_distance = section.footer_distance = Inches(.25)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Caption']:
    style = doc.styles[name]
    style.font.name = 'Calibri'; style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.line_spacing = 1.1
    style.paragraph_format.space_after = Pt(7)
for name, size in [('Normal',11), ('Title',25), ('Subtitle',12), ('Heading 1',18), ('Heading 2',12), ('Caption',9)]:
    doc.styles[name].font.size = Pt(size)
for name in ['Title', 'Subtitle', 'Heading 1', 'Heading 2']:
    doc.styles[name].paragraph_format.keep_with_next = True
doc.styles['Title'].font.bold = True
doc.styles['Caption'].font.italic = False
lang = OxmlElement('w:lang'); lang.set(qn('w:val'), 'en-US')
doc.styles['Normal'].element.get_or_add_rPr().append(lang)
doc.core_properties.title = 'Step 08 Integration Acceptance Record'
doc.core_properties.subject = 'Supply Chain Product Tracking integration acceptance in Edge with MetaMask and camera QR scanning'
doc.core_properties.author = 'Quoc'
header = section.header.paragraphs[0]
header.text = 'DS441A  |  SUPPLY CHAIN PRODUCT TRACKING'; header.runs[0].font.size = Pt(8)
footer = section.footer.paragraphs[0]; footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('Step 08 integration acceptance  |  ').font.size = Pt(8)
field = OxmlElement('w:fldSimple'); field.set(qn('w:instr'), 'PAGE'); footer._p.append(field)

def para(text, label=None):
    p = doc.add_paragraph()
    if label: p.add_run(label + ' ').bold = True
    p.add_run(text)
    return p

def code(text):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text); r.font.name = 'Consolas'; r.font.size = Pt(9)
    return p

def page(title):
    doc.add_page_break(); doc.add_heading(title, 1)

def table(headers, rows, widths):
    t = doc.add_table(rows=1, cols=len(headers)); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    for col,w in zip(t.columns,widths): col.width = Inches(w)
    borders = OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        e=OxmlElement('w:'+edge)
        for key,value in [('val','single'),('sz','4'),('color','D9D9D9')]: e.set(qn('w:'+key),value)
        borders.append(e)
    t._tbl.tblPr.append(borders)
    margins=OxmlElement('w:tblCellMar')
    for edge,value in [('top','85'),('bottom','85'),('left','95'),('right','95')]:
        e=OxmlElement('w:'+edge);e.set(qn('w:w'),value);e.set(qn('w:type'),'dxa');margins.append(e)
    t._tbl.tblPr.append(margins)
    repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for i,values in enumerate([headers]+rows):
        row=t.rows[0] if not i else t.add_row()
        row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        for j,value in enumerate(values):
            cell=row.cells[j];cell.width=Inches(widths[j]);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p=cell.paragraphs[0];p.paragraph_format.space_after=Pt(0);p.paragraph_format.line_spacing=1.05
            r=p.add_run(str(value));r.font.size=Pt(10)
            if not i or i%2==0:
                shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'20364A' if not i else 'F1F4F7');cell._tc.get_or_add_tcPr().append(shade)
            if not i: r.bold=True;r.font.color.rgb=RGBColor(255,255,255)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

def figure(index, description):
    row=manifest[index-1]; filename=IMAGES/row['file']
    with Image.open(filename) as im: width,height=im.size
    scale=min(7/width,6.25/height)
    p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next=True;p.paragraph_format.space_after=Pt(1)
    image=p.add_run().add_picture(str(filename),width=Inches(width*scale))
    image._inline.docPr.set('descr',description)
    local=datetime.fromisoformat(row['messageTimestampUTC'].replace('Z','+00:00')).astimezone(timezone(timedelta(hours=7)))
    doc.add_paragraph(f'Figure {index}  {description}. Original screenshot shared on {local:%d %B %Y at %H:%M:%S} ICT.',style='Caption')

doc.add_heading('Step 08 Integration Acceptance Record',0)
doc.add_paragraph('Supply Chain Product Tracking',style='Subtitle')
para('Quoc completed the accepted step 08 integration checks in Microsoft Edge with MetaMask and physical camera QR scanning on 16 November 2026. The fresh product STEP08-DEMO-001 reached Delivered with Customer as its holder and four history entries. Live Ganache receipts, events and block timestamps match the manual results.')
para('Step 08 is closed within the scope approved by Quoc. Two actual-wallet recovery cases were explicitly waived: disconnect and reconnect, and switching to a different network then returning to Ganache. They are recorded as Not run, not as successful manual tests. Both behaviors have separate simulated browser coverage.')
doc.add_heading('Verified environment',2)
table(['Item','Value'],[
    ['Browser and wallet','Microsoft Edge with MetaMask'],
    ['Website','http://127.0.0.1:5173/'],
    ['Ganache workspace','NOISELESS-MAGIC'],
    ['RPC and Chain ID','http://127.0.0.1:7545  |  1337'],
    ['Contract',chain['config']['contractAddress']],
    ['Build profile','Default; Solidity 0.8.34; EVM Paris; optimizer disabled'],
    ['Product','STEP08-DEMO-001  |  Da Lat Arabica  |  Da Lat, Vietnam'],
    ['Final holder',chain['product']['holder']],
    ['Final state','Delivered; 4 history entries; last transfer at block 13'],
],[1.5,5.6])
doc.add_heading('Acceptance scope',2)
para('The ten original screenshots in this report cover actual signing rejection, duplicate ID rejection, product creation, invalid recipient rejection, three valid handovers, the Customer delivery gate, public product history and fresh QR decoding with camera release. The participant roles granted in step 06 were reused and independently rechecked; no chain reset or duplicate role grants were required.')
table(['Actual wallet recovery case','Disposition'],[
    ['Disconnect and reconnect','Not run; waived by Quoc'],
    ['Wrong network and return to Ganache','Not run; waived by Quoc'],
],[3.5,3.6])

page('Automated checks and transaction evidence')
table(['Check','Recorded result'],[
    ['Compile and typecheck','Exit 0 for default-profile compile and root TypeScript check'],
    ['Hardhat contract tests','27 passing on an isolated Hardhat network'],
    ['Frontend service tests','25 passing'],
    ['Edge browser checks','13 passing in an isolated profile; simulated injected wallet where needed'],
    ['Build and deployment export','Exit 0; current ABI, bytecode, receipt and Admin verified'],
    ['Protected source check','Exit 0; Solidity, Huyen tests, root lockfile and deployment module unchanged'],
],[2.0,5.1])
para('Hardhat tests are contract simulations. The isolated Edge checks use real Ganache reads, but wallet rejection, account events and network recovery use a simulated provider that blocks sends. Only the user performed the actual MetaMask transactions documented below. The automated checks broadcast no transactions.')
doc.add_heading('Fresh product receipts',2)
labels=['Create product','Producer to Distributor','Distributor to Retailer','Retailer to Customer']
for label,receipt in zip(labels,chain['receipts']):
    p=para(f"Block {receipt['block']}; status 1; gas {receipt['gasUsed']}; timestamp {receipt['timestamp']}.",label)
    p.paragraph_format.keep_with_next=True;code(receipt['hash'])
doc.add_heading('Evidence records',2)
para('The live audit verifies the transaction sender and recipient, stage, creation metadata, history order and exact event and receipt-block timestamps. Negative eth_call checks leave product and history unchanged. The rejected ID STEP08-REJECT-001 remains absent. The original COFFEE-DEMO-001 data was unchanged after the duplicate attempt.')
para('Repository evidence: docs/verification/integration.md, integration-checks.json, integration-chain-replay.json, integration-manual-batch-a.json and integration-browser.json. Original screenshot files and SHA256 hashes are in docs/verification/integration-screenshots/manifest.json.')

cases=[
('1 Reject product creation in MetaMask',
 'With Producer selected, submit STEP08-REJECT-001 with name Da Lat Arabica and origin Da Lat, Vietnam, then choose Reject in MetaMask.',
 'The website reports that the request was rejected in MetaMask. Transaction hash and gas remain blank, and Create product is available again. Independent reads confirm that this ID has no product or history. This is a real wallet rejection with no mined receipt.',
 'Real MetaMask signing rejection with no transaction hash'),
('2 Reject an existing product ID',
 'As Producer, attempt to create the existing COFFEE-DEMO-001 with non-empty product name and origin.',
 'The website reports Contract rejected the operation Product exists, with no hash or gas. Independent reads confirm that the original product and all four history entries remain unchanged. This is a preflight contract rejection, not a mined revert.',
 'Duplicate product rejected before broadcasting'),
('3 Create a fresh product as Producer',
 'As Producer, create STEP08-DEMO-001 with name Da Lat Arabica and origin Da Lat, Vietnam, and confirm in MetaMask.',
 'The website confirms block 10. The successful receipt uses 146937 gas. ProductCreated, the block timestamp and the first history entry all match timestamp 1794770899. The product is Produced and held by Producer.',
 'Fresh product creation confirmed at block 10'),
('4 Reject a Customer recipient while Produced',
 'Before the first valid handover, keep Producer selected and enter Customer as the recipient for STEP08-DEMO-001.',
 'The website reports The recipient needs the Distributor role. No hash or gas is shown, and the screenshot still shows Produced with Producer holder. Only the later valid transfer was mined between blocks 10 and 11. This rejection created no receipt.',
 'Invalid Customer recipient rejected at the Produced stage'),
('5 Hand over from Producer to Distributor',
 'Replace the invalid recipient with Distributor and confirm Hand over product in MetaMask.',
 'The successful transfer is mined at block 11 with gas 87258. The event and second history entry match timestamp 1794771061 and stage At distributor. Distributor is now holder. The previous holder can no longer hand over the product, as the disabled button and current-holder hint show.',
 'Producer to Distributor transfer confirmed and former holder locked'),
('6 Hand over from Distributor to Retailer',
 'Switch to Distributor, verify the active wallet and hand over STEP08-DEMO-001 to Retailer through MetaMask.',
 'The successful transfer is mined at block 12 with gas 87526. The event and third history entry match timestamp 1794771162 and stage At retailer. Retailer is holder. Producer-only creation and the former holder handover are disabled in the result screenshot.',
 'Distributor to Retailer transfer confirmed at block 12'),
('7 Hand over from Retailer to Customer',
 'Switch to Retailer and hand over STEP08-DEMO-001 to Customer, confirming in MetaMask.',
 'The successful transfer is mined at block 13 with gas 87794. The event and fourth history entry match timestamp 1794771228 and stage Delivered. Customer is final holder, all four ordered entries exist, and product metadata remains unchanged.',
 'Retailer to Customer transfer confirmed at block 13'),
('8 Prevent handover after delivery',
 'Select Customer and use Check holder and stage for STEP08-DEMO-001.',
 'The website displays Delivered, the Customer holder and a disabled Hand over product button with This product has already been delivered. A separate live eth_call from Customer also rejects with Already delivered and leaves state unchanged.',
 'Delivered product handover disabled for the Customer holder'),
('9 Verify product details and the timeline',
 'Look up STEP08-DEMO-001 after the final delivery and compare the displayed product and history with the chain audit.',
 'The website shows Da Lat Arabica, Da Lat, Vietnam, Delivered and Customer holder. Four history entries appear in order: initialization, Distributor, Retailer, Customer. Displayed local times 02:28:19, 02:31:01, 02:32:42 and 02:33:48 match the audited timestamps. Customer is connected in this screenshot; lookup without MetaMask is separately verified by automated browser checks.',
 'Fresh delivered product details and all four history entries'),
('10 Generate and scan the fresh product QR',
 'Generate a QR code for STEP08-DEMO-001 and scan it with the physical camera in Edge.',
 'The QR card shows the exact product ID and a generated QR image. The scanner status reads QR decoded Camera released Looking up the decoded text as a product ID. The paired lookup screenshot shows the correct delivered product and complete timeline. Camera decoding and release are accepted. Together with the preceding cases, this closes step 08 within the approved scope; the two waived wallet recovery cases remain Not run.',
 'Fresh product QR decoded and camera released'),
]
for index,(title,action,result,description) in enumerate(cases,1):
    page(title);para(action,'Action');para(result,'Observed and verified result');figure(index,description)

for root in [doc.styles.element,doc.element]:
    for border in list(root.iter(qn('w:pBdr'))):border.getparent().remove(border)
OUT.parent.mkdir(parents=True,exist_ok=True);doc.save(OUT);print(OUT)
