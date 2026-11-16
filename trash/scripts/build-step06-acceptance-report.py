"""Build the step 06 acceptance record from saved receipts and original screenshots."""
import json
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
EVIDENCE = ROOT / "docs" / "verification"
IMAGES = EVIDENCE / "metamask-screenshots"
OUT = ROOT / "docs" / "reports" / "step-06-metamask-acceptance.docx"
load = lambda name: json.loads((EVIDENCE / name).read_text(encoding="utf-8"))
state = load("wallet-demo-state.json")
grants = load("wallet-role-receipts.json")
creation = load("wallet-product-receipts.json")[0]
transfers = load("wallet-handover-receipts.json")
manifest = json.loads((IMAGES / "manifest.json").read_text(encoding="utf-8"))
assert state["fullFlowOnChain"] and len(grants) == 4 and len(transfers) == 3
assert len(manifest) == 6 and all(row["status"] == 1 for row in grants + [creation] + transfers)

doc = Document()
sec = doc.sections[0]
sec.page_width = Inches(8.5)
sec.page_height = Inches(11)
sec.top_margin = sec.bottom_margin = Inches(0.65)
sec.left_margin = sec.right_margin = Inches(0.7)
sec.header_distance = sec.footer_distance = Inches(0.25)

for name in ["Normal", "Title", "Subtitle", "Heading 1", "Heading 2", "Caption"]:
    style = doc.styles[name]
    style.font.name = "Calibri"
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.line_spacing = 1.12
    style.paragraph_format.space_after = Pt(7)
doc.styles["Normal"].font.size = Pt(11)
doc.styles["Title"].font.size = Pt(25)
doc.styles["Title"].font.bold = True
doc.styles["Subtitle"].font.size = Pt(12)
doc.styles["Subtitle"].font.italic = False
doc.styles["Heading 1"].font.size = Pt(18)
doc.styles["Heading 1"].paragraph_format.space_before = Pt(6)
doc.styles["Heading 1"].paragraph_format.space_after = Pt(11)
doc.styles["Heading 2"].font.size = Pt(12)
doc.styles["Caption"].font.size = Pt(9)
doc.styles["Caption"].font.italic = False
doc.styles["Caption"].font.bold = False
doc.styles["Caption"].paragraph_format.space_before = Pt(5)
for name in ["Title", "Subtitle", "Heading 1", "Heading 2"]:
    doc.styles[name].paragraph_format.keep_with_next = True

language = OxmlElement("w:lang")
language.set(qn("w:val"), "en-US")
doc.styles["Normal"].element.get_or_add_rPr().append(language)
doc.core_properties.title = "Steps 06 and 07 Manual Acceptance Record"
doc.core_properties.subject = "Supply Chain Product Tracking manual acceptance through MetaMask in Microsoft Edge"
doc.core_properties.author = "Quoc"
doc.core_properties.keywords = "DS441A, Team 05, MetaMask, Ganache, acceptance testing"

header = sec.header.paragraphs[0]
header.text = "DS441A  |  SUPPLY CHAIN PRODUCT TRACKING"
header.runs[0].font.size = Pt(8)
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = footer.add_run("Steps 06 and 07 manual acceptance  |  ")
run.font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)


def para(text, lead=None):
    p = doc.add_paragraph()
    if lead:
        p.add_run(lead + " ").bold = True
    p.add_run(text)
    return p


def code(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    r.font.name = "Consolas"
    r.font.size = Pt(9)
    return p


def table(headers, rows, widths, font=10):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for col, width in zip(t.columns, widths):
        col.width = Inches(width)
    for cell, width in zip(t.rows[0].cells, widths):
        cell.width = Inches(width)
    props = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ["top", "left", "bottom", "right", "insideH", "insideV"]:
        el = OxmlElement("w:" + edge)
        for key, val in [("val", "single"), ("sz", "4"), ("color", "D9D9D9")]:
            el.set(qn("w:" + key), val)
        borders.append(el)
    props.append(borders)
    margins = OxmlElement("w:tblCellMar")
    for edge, val in [("top", "80"), ("bottom", "80"), ("left", "95"), ("right", "95")]:
        el = OxmlElement("w:" + edge)
        el.set(qn("w:w"), val)
        el.set(qn("w:type"), "dxa")
        margins.append(el)
    props.append(margins)
    repeat = OxmlElement("w:tblHeader")
    t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for i, values in enumerate([headers] + rows):
        row = t.rows[0] if i == 0 else t.add_row()
        no_split = OxmlElement("w:cantSplit")
        row._tr.get_or_add_trPr().append(no_split)
        for j, value in enumerate(values):
            cell = row.cells[j]
            cell.width = Inches(widths[j])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.06
            if headers[j] in ["Block", "Gas used", "Receipt"]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(str(value))
            r.font.size = Pt(font)
            if i == 0:
                shade = OxmlElement("w:shd")
                shade.set(qn("w:fill"), "20364A")
                cell._tc.get_or_add_tcPr().append(shade)
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.bold = True
            elif i % 2 == 0:
                shade = OxmlElement("w:shd")
                shade.set(qn("w:fill"), "F1F4F7")
                cell._tc.get_or_add_tcPr().append(shade)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return t


def next_page(title):
    doc.add_page_break()
    doc.add_heading(title, 1)


def figure(index, description, max_height=6.0):
    record = manifest[index - 1]
    filename = IMAGES / record["file"]
    with Image.open(filename) as image:
        width, height = image.size
    scale = min(7.0 / width, max_height / height)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Pt(1)
    inline = p.add_run().add_picture(str(filename), width=Inches(width * scale))
    inline._inline.docPr.set("descr", description)
    shared = datetime.fromisoformat(record["messageTimestampUTC"].replace("Z", "+00:00"))
    local = shared.astimezone(timezone(timedelta(hours=7)))
    caption = doc.add_paragraph(
        f"Figure {index}  {description} Original user screenshot shared at {local:%H:%M:%S} ICT on {local:%d %B %Y}.",
        style="Caption",
    )
    caption.paragraph_format.keep_with_next = False


def receipt_summary(record):
    block = record.get("blockNumber", record.get("block"))
    para(f"Block {block}; status 1 Successful; gas used {int(record['gasUsed']):,}.", "Receipt")
    code(record.get("hash", record.get("transactionHash")))


# Page 1: context and public identifiers.
doc.add_heading("Steps 06 and 07 Manual Acceptance Record", 0)
doc.add_paragraph("Supply Chain Product Tracking", style="Subtitle")
para("Quoc completed the role grants, product creation, invalid handover check and full custody transfer through the website with MetaMask in Microsoft Edge. Independent RPC reads and transaction receipts confirm that COFFEE-DEMO-001 reached Delivered with Customer as its holder and four history entries.")
para("This record documents the manual acceptance on 16 November 2026, from Grant all participant roles through final delivery, followed by product lookup and physical camera QR scanning. Both steps are complete. Sections 9 and 10 record the step 07 results and the original lookup screenshot.")
doc.add_heading("Verified environment", 2)
table(["Item", "Verified value"], [
    ["Browser and wallet", "Microsoft Edge with MetaMask"],
    ["Website", "http://127.0.0.1:5173/"],
    ["Ganache workspace", "NOISELESS-MAGIC"],
    ["RPC and Chain ID", "http://127.0.0.1:7545  |  1337  |  0x539"],
    ["Network ID", "5777  |  separate from Chain ID"],
    ["Contract", state["contractAddress"]],
], [1.65, 5.45], 10)
doc.add_heading("Public participant addresses", 2)
roles = {row["name"]: row for row in state["roles"]}
table(["Role", "Wallet address"], [[name, roles[name]["address"]] for name in ["Admin", "Producer", "Distributor", "Retailer", "Customer"]], [1.25, 5.85], 9.5)
para("All addresses refer to this local workspace. Only public identifiers are included. The original six user screenshots are embedded in their corresponding test sections and retained separately with a SHA256 manifest.")

# Page 2: consolidated role grants.
next_page("1 Grant all participant roles")
para("The Admin wallet used Grant participant role to grant Producer, Distributor, Retailer and Customer to their corresponding wallets. Each role grant was a separate transaction confirmed by the user in MetaMask.", "Action")
para("All four participants should have their requested on-chain role. Admin must remain independent of Producer privileges.", "Expected result")
table(["Granted role", "Block", "Gas used", "Receipt"], [[r["role"], r["block"], f"{int(r['gasUsed']):,}", "Successful"] for r in grants], [2.45, 0.75, 1.25, 2.65], 10)
para("The website showed Granted on-chain for all four participants. Independent hasRole reads returned true and all four receipts had status 1. The single screenshot records the consolidated result after all grants; individual confirmation popups were not supplied.", "Observed result")
figure(1, "All four participant roles granted with Admin connected in MetaMask")

# Page 3: product creation.
next_page("2 Create the product as Producer")
para("The user switched from Admin to Producer, verified the updated wallet role, filled Create product and confirmed the transaction in MetaMask.", "Action")
table(["Field", "Submitted value"], [["Product ID", "COFFEE-DEMO-001"], ["Product name", "Da Lat Arabica"], ["Origin", "Da Lat, Vietnam"]], [1.5, 5.6], 10)
para("The ID was unused before submission. Creation produced stage Produced, assigned Producer as current holder and added the first history entry from the zero address.", "Verified result")
receipt_summary(creation)
figure(2, "Product creation confirmed with Producer selected and stage Produced displayed")

# Page 4: negative check.
next_page("3 Reject a handover that skips Distributor")
para("While Producer held COFFEE-DEMO-001, the user attempted a direct handover to Customer instead of Distributor.", "Action")
para("The application should reject this recipient because the next stage requires Distributor membership.", "Expected result")
para('The website displayed Product handover failed and the message "The recipient needs the Distributor role." Transaction hash and gas used remained blank. The screenshot still showed Produced with Producer as holder.', "Observed result")
para("This was a preflight rejection backed by on-chain role reads. It did not create a transaction receipt and must not be described as a mined revert or a rejected MetaMask signing prompt. The next successful handover was mined at block 7.", "Evidence classification")
figure(3, "Invalid recipient rejected before broadcasting a handover transaction")

# Pages 5 to 7: full handover sequence.
transfer_specs = [
    ("4 Hand over from Producer to Distributor", "Producer", "Distributor", "At distributor", 2, 4),
    ("5 Hand over from Distributor to Retailer", "Distributor", "Retailer", "At retailer", 3, 5),
    ("6 Hand over from Retailer to Customer", "Retailer", "Customer", "Delivered", 4, 6),
]
for record, (title, sender, receiver, stage, count, image_index) in zip(transfers, transfer_specs):
    next_page(title)
    para(f"With {sender} selected in MetaMask, the user entered COFFEE-DEMO-001 and the {receiver} recipient in Hand over product, then confirmed the transaction in MetaMask.", "Action")
    para(f"Stage {stage}; holder {receiver}; history length {count}. Independent reads matched the website result.", "Verified result")
    receipt_summary(record)
    figure(image_index, f"{sender} to {receiver} handover confirmed with stage {stage} displayed", max_height=5.75)

# Page 8: account-change evidence and final state.
next_page("7 Verify account changes and final state")
para("The run used Admin for grants, Producer for creation and the first handover, Distributor for the second handover and Retailer for the final handover. The supplied screenshots show role-gated controls changing during this sequence.")
table(["Manual observation", "Recorded result"], [
    ["Producer selected", "Create product was available; the first handover was signed by Producer."],
    ["Producer after transfer", "Hand over product became unavailable because Producer no longer held the product."],
    ["Distributor and Retailer selected", "Create product was unavailable because the active account lacked Producer membership."],
    ["Final transfer", "Delivered was shown and Retailer could no longer hand over the product."],
], [2.2, 4.9], 10)
doc.add_heading("Final on-chain assertions", 2)
table(["Assertion", "Result"], [
    ["Product", "COFFEE-DEMO-001  |  Da Lat Arabica  |  Da Lat, Vietnam"],
    ["Stage and holder", "Delivered  |  Customer"],
    ["History entries", "4  |  Creation then Distributor then Retailer then Customer"],
    ["Last verified block", "9"],
    ["Successful acceptance transactions", "8  |  4 grants plus 1 creation plus 3 handovers"],
    ["Invalid handover", "Correctly rejected before a transaction was broadcast"],
], [2.2, 4.9], 10)
doc.add_heading("Evidence limits", 2)
para("The user screenshots and confirmations establish the manual browser workflow. RPC reads independently establish receipt success, roles, holder, stage and history. RPC data alone cannot identify the wallet software used to sign.")
para("Rejected signing prompts, empty-account disconnect and wrong-chain recovery were checked with an automated simulated provider; they are not claimed as manual tests. The invalid handover in section 3 and account changes above were manually evidenced.")
para("MetaMask screenshots retain the network label Localhost 8545. The user confirmed the actual network parameters as RPC port 7545 and Chain ID 1337, and the transaction hashes matched that Ganache chain. A display name is not the RPC configuration.")
para("Step 06 acceptance is complete. The subsequent step 07 lookup, QR and camera acceptance is recorded in sections 9 and 10.", "Conclusion")

# Page 9: exact receipt references and evidence locations.
next_page("8 Transaction receipts and source evidence")
para("These receipt identifiers connect the manual test record to the saved chain evidence. Every listed receipt has status 1. Deployment at block 1 is outside this acceptance sequence.")
records = [dict(label=f"Grant {r['role']}", block=r['block'], gas=r['gasUsed'], hash=r['transactionHash']) for r in grants]
records += [dict(label="Create product", block=creation['blockNumber'], gas=creation['gasUsed'], hash=creation['hash'])]
records += [dict(label=f"Handover {i + 1}", block=r['blockNumber'], gas=r['gasUsed'], hash=r['hash']) for i, r in enumerate(transfers)]
for r in records:
    p = para(f"Block {r['block']}  |  Gas used {int(r['gas']):,}  |  Successful", r['label'])
    p.paragraph_format.keep_with_next = True
    code(r['hash'])
doc.add_heading("Saved evidence files", 2)
para("All paths below are relative to the repository root. The six embedded images are the original user uploads, not regenerated interface images.")
for filename in ["docs/verification/wallet-role-receipts.json", "docs/verification/wallet-product-receipts.json", "docs/verification/wallet-handover-receipts.json", "docs/verification/wallet-demo-state.json", "docs/verification/wallet-transactions.md", "docs/verification/metamask-screenshots/manifest.json"]:
    code(filename)
para("The screenshot manifest records filenames, message sharing times in UTC, dimensions and SHA256 hashes. No screenshots from earlier wallet setup were included.")

next_page("9 Accept public lookup and camera scanning")
para("Quoc confirmed that the physical camera successfully scanned the product QR in Microsoft Edge. The resulting lookup screenshot matches the previously verified contract state. Quoc subsequently confirmed both automatic camera shutdown after decoding and shutdown through Stop camera.", "Manual acceptance")
table(["Manual check", "Confirmed result"], [
    ["Physical webcam QR scan", "The camera decoded the QR and displayed COFFEE-DEMO-001."],
    ["Product details", "Da Lat Arabica; Da Lat, Vietnam; Delivered; Customer as current holder."],
    ["History timeline", "Four ordered entries: Product initialized, At distributor, At retailer, Delivered."],
    ["Automatic camera shutdown", "The user confirmed that the camera indicator turned off after scanning."],
    ["Stop camera", "The user confirmed that the camera also turned off when stopped manually."],
], [2.1, 5.0], 10)
doc.add_heading("Evidence and scope", 2)
para("Figure 7 is the original screenshot supplied after the successful physical scan. It shows the product ID, name, origin, Customer address and all four history entries. Camera shutdown is supported by the user's explicit confirmation; the result screenshot alone does not show the camera indicator.")
para("An Admin wallet is connected in the screenshot. Lookup without MetaMask was verified separately in automated browser checks. Automated checks also covered QR image round-trip decoding, unknown IDs, RPC errors, stale result removal and camera resource cleanup. These checks are separate from the physical webcam acceptance.")
para("A startup fault in the public reader initially left the page at Checking network. The ethers Network construction was corrected, and the actual Edge page then showed Ganache connected with Chain ID 1337 and verified contract bytecode. All 25 frontend tests and the production build passed after the repair.")
para("Steps 06 and 07 are complete. No new blockchain transactions were required for lookup or QR scanning. Step 08 has not started.", "Conclusion")

next_page("10 Physical camera scan result")
para("The QR scan returned the delivered product and its full custody history. The displayed state matches the independent block 9 contract verification.")
shot = EVIDENCE / "lookup-screenshots" / "01-physical-camera-lookup.png"
with Image.open(shot) as image:
    width, height = image.size
scale = min(7.0 / width, 7.3 / height)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.keep_with_next = True
inline = p.add_run().add_picture(str(shot), width=Inches(width * scale))
inline._inline.docPr.set("descr", "Original user screenshot after physical camera QR scanning showing COFFEE-DEMO-001 delivered to Customer with four history entries")
doc.add_paragraph("Figure 7  Original user screenshot after physical webcam QR scanning in Edge on 16 November 2026. Automatic camera shutdown and Stop camera were subsequently confirmed by the user.", style="Caption")

OUT.parent.mkdir(parents=True, exist_ok=True)
# The bundled Word base template can carry a blue Title paragraph rule.
# Strip paragraph borders so the title remains plain black without a decorative line.
for root in [doc.styles.element, doc.element]:
    for border in list(root.iter(qn("w:pBdr"))):
        border.getparent().remove(border)
doc.save(OUT)
print(OUT)
