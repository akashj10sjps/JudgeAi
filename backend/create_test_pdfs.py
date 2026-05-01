"""
Generate realistic Karnataka High Court judgment PDFs for JudgeAI demo.
Uses reportlab to produce two multi-page court orders.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.colors import black, HexColor


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "test_data")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ──────────────────────────────────────────────
# Shared styles
# ──────────────────────────────────────────────
def build_styles():
    ss = getSampleStyleSheet()

    ss.add(ParagraphStyle(
        "CourtHeader", parent=ss["Normal"],
        fontName="Times-Bold", fontSize=14,
        alignment=TA_CENTER, spaceAfter=2,
    ))
    ss.add(ParagraphStyle(
        "CourtSubHeader", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=11,
        alignment=TA_CENTER, spaceAfter=4,
    ))
    ss.add(ParagraphStyle(
        "CaseTitle", parent=ss["Normal"],
        fontName="Times-Bold", fontSize=12,
        alignment=TA_CENTER, spaceAfter=6, spaceBefore=6,
    ))
    ss.add(ParagraphStyle(
        "PartyLine", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=11,
        alignment=TA_CENTER, spaceAfter=2,
    ))
    ss.add(ParagraphStyle(
        "PartyBold", parent=ss["Normal"],
        fontName="Times-Bold", fontSize=11,
        alignment=TA_CENTER, spaceAfter=2,
    ))
    ss.add(ParagraphStyle(
        "BodyText2", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=11,
        alignment=TA_JUSTIFY, leading=16,
        spaceAfter=8, firstLineIndent=36,
    ))
    ss.add(ParagraphStyle(
        "BodyTextNoIndent", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=11,
        alignment=TA_JUSTIFY, leading=16, spaceAfter=8,
    ))
    ss.add(ParagraphStyle(
        "DirectionHead", parent=ss["Normal"],
        fontName="Times-Bold", fontSize=11,
        alignment=TA_LEFT, spaceAfter=6, spaceBefore=12,
        underlineProportion=1,
    ))
    ss.add(ParagraphStyle(
        "DirectionItem", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=11,
        alignment=TA_JUSTIFY, leading=16,
        leftIndent=36, spaceAfter=8,
    ))
    ss.add(ParagraphStyle(
        "JudgeName", parent=ss["Normal"],
        fontName="Times-Bold", fontSize=11,
        alignment=TA_RIGHT, spaceBefore=30,
    ))
    ss.add(ParagraphStyle(
        "SmallCenter", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=9,
        alignment=TA_CENTER, textColor=HexColor("#666666"),
    ))
    ss.add(ParagraphStyle(
        "DateLine", parent=ss["Normal"],
        fontName="Times-Roman", fontSize=10,
        alignment=TA_LEFT, spaceAfter=4,
    ))
    return ss


def header_block(styles, case_no, petitioner, respondent, coram, date_of_order):
    """Return the common header flowables for a judgment."""
    elements = []

    elements.append(Paragraph("IN THE HIGH COURT OF KARNATAKA AT BENGALURU", styles["CourtHeader"]))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="60%", thickness=1, color=black, spaceAfter=4))
    elements.append(Paragraph("(ORIGINAL JURISDICTION)", styles["CourtSubHeader"]))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph(f"WRIT PETITION No. {case_no}", styles["CaseTitle"]))
    elements.append(Spacer(1, 6))

    elements.append(Paragraph(f"DATED THIS THE {date_of_order}", styles["CourtSubHeader"]))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("BEFORE", styles["CourtSubHeader"]))
    elements.append(Paragraph(coram, styles["PartyBold"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("BETWEEN:", styles["PartyBold"]))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(petitioner, styles["PartyBold"]))
    elements.append(Paragraph("... Petitioner", styles["PartyLine"]))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("AND", styles["PartyBold"]))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(respondent, styles["PartyBold"]))
    elements.append(Paragraph("... Respondent", styles["PartyLine"]))
    elements.append(Spacer(1, 10))

    elements.append(HRFlowable(width="100%", thickness=0.5, color=black, spaceAfter=6))

    elements.append(Paragraph(
        "This Writ Petition is filed under Articles 226 and 227 of the Constitution of India, "
        "praying for the reliefs stated hereinbelow.",
        styles["CourtSubHeader"],
    ))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=black, spaceBefore=6, spaceAfter=12))

    elements.append(Paragraph("<b>O R D E R</b>", styles["CaseTitle"]))
    elements.append(Spacer(1, 8))
    return elements


# ══════════════════════════════════════════════
#  PDF 1 — WP 45231/2024  (BBMP occupancy cert)
# ══════════════════════════════════════════════
def create_judgment_1(styles):
    path = os.path.join(OUTPUT_DIR, "judgment_1.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=1.2*inch, rightMargin=1.2*inch,
        topMargin=0.8*inch, bottomMargin=0.8*inch,
    )
    story = header_block(
        styles,
        case_no="45231/2024",
        petitioner="M/s Bangalore Metro Infrastructure Pvt Ltd",
        respondent="Bruhat Bengaluru Mahanagara Palike (BBMP)",
        coram="HON'BLE MR. JUSTICE R. SURESH KUMAR",
        date_of_order="15TH DAY OF NOVEMBER, 2024",
    )

    # --- Page 1 body ---
    paras = [
        "The petitioner, M/s Bangalore Metro Infrastructure Pvt Ltd, a company incorporated under "
        "the Companies Act, 2013 and having its registered office at No. 42, Residency Road, "
        "Bengaluru – 560 025, has approached this Court seeking a Writ of Mandamus directing the "
        "respondent, Bruhat Bengaluru Mahanagara Palike (hereinafter referred to as 'BBMP'), to "
        "issue the occupancy certificate for the commercial complex constructed at Survey No. 118/2, "
        "Koramangala, Bengaluru South Taluk, which has been pending disposal for a period exceeding "
        "eighteen months despite fulfilment of all statutory requirements.",

        "The learned Senior Counsel Sri. K. Ramachandra Rao, appearing on behalf of the petitioner, "
        "submits that the petitioner had applied for the occupancy certificate on 12th March 2023 "
        "vide Application No. BBMP/BPA/OC/2023/4412, and that all structural stability certificates, "
        "fire safety NOCs from the Karnataka State Fire and Emergency Services, and environmental "
        "clearances from the Karnataka State Pollution Control Board were duly enclosed. Despite "
        "repeated representations dated 15th June 2023, 20th September 2023, and 10th January 2024, "
        "addressed to the Commissioner, BBMP, and the Joint Director (Town Planning), the respondent "
        "has failed to process the said application.",

        "The learned Government Advocate Sri. M. Venkatesh, appearing on behalf of the respondent-BBMP, "
        "submits that there were certain discrepancies in the building plan vis-à-vis the sanctioned "
        "plan, and that a fresh site inspection was necessitated owing to complaints received from "
        "neighbouring property owners. He further submits that the pandemic and subsequent "
        "administrative reorganization of BBMP zones caused unavoidable delays in processing the "
        "application and that the respondent is not opposed to granting the certificate subject to "
        "verification.",

        "Having heard both sides and having perused the material placed on record, including the "
        "original application, the sanctioned building plan bearing No. BDA/LP/2021/0088, the "
        "structural stability certificate issued by the registered structural engineer, the fire "
        "safety NOC dated 28th February 2023, and the environmental clearance certificate, this "
        "Court is of the considered opinion that there has been an unreasonable and unjustifiable "
        "delay on the part of the respondent-BBMP in processing the petitioner's application for "
        "the occupancy certificate.",
    ]
    for p in paras:
        story.append(Paragraph(p, styles["BodyText2"]))

    # --- Page 2 body ---
    paras2 = [
        "It is a well-settled principle of administrative law that statutory authorities are duty-bound "
        "to discharge their obligations within a reasonable time frame. The Hon'ble Supreme Court in "
        "<i>State of Haryana v. Mukesh Kumar</i> (2014) 8 SCC 196 has held that undue delay in "
        "processing applications, where no valid ground for refusal exists, amounts to an arbitrary "
        "exercise of power and is violative of Article 14 of the Constitution of India.",

        "Furthermore, the Karnataka Town and Country Planning Act, 1961, read with the BBMP Building "
        "Bye-Laws, 2003, as amended, does not contemplate indefinite postponement of issuance of "
        "occupancy certificates. Rule 32(4) of the said Bye-Laws prescribes a maximum period of "
        "sixty days from the date of receipt of the application, complete in all respects, for "
        "grant or refusal of the occupancy certificate. The petitioner's application has been "
        "pending for over eighteen months, which is manifestly in contravention of the statutory "
        "time limits prescribed.",

        "The contention of the learned Government Advocate regarding discrepancies in the building "
        "plan is not supported by any contemporaneous inspection report placed on record. The "
        "respondent has not produced any show-cause notice issued to the petitioner pointing out "
        "specific deviations from the sanctioned plan. In the absence of such material, the "
        "alleged discrepancies cannot form a valid basis for withholding the occupancy certificate.",

        "In light of the aforesaid discussion and the undisputed facts placed before this Court, "
        "this Court deems it appropriate to issue the following directions in the interest of justice "
        "and to ensure that the petitioner is not further prejudiced by the inaction of the "
        "respondent authority.",
    ]
    for p in paras2:
        story.append(Paragraph(p, styles["BodyText2"]))

    # --- Directions ---
    story.append(Spacer(1, 6))
    story.append(Paragraph("<u>DIRECTIONS</u>", styles["DirectionHead"]))
    story.append(Spacer(1, 4))

    directions = [
        "<b>(i)</b>&nbsp;&nbsp;The respondent, Bruhat Bengaluru Mahanagara Palike (BBMP), through "
        "its Commissioner, is hereby <b>directed to issue the pending occupancy certificate</b> in "
        "respect of the commercial complex situated at Survey No. 118/2, Koramangala, Bengaluru "
        "South Taluk, <b>within a period of 45 (forty-five) days</b> from the date of receipt of a "
        "certified copy of this order, subject to verification of structural safety compliance.",

        "<b>(ii)</b>&nbsp;&nbsp;The respondent-BBMP is further <b>directed to pay compensation of "
        "Rs. 2,50,000/- (Rupees Two Lakhs and Fifty Thousand only)</b> to the petitioner towards "
        "the losses suffered on account of the undue and unreasonable delay in processing the "
        "application. The said amount shall be paid within thirty days from the date of this order.",

        "<b>(iii)</b>&nbsp;&nbsp;The respondent shall <b>file a compliance report</b> before the "
        "Registrar (Judicial) of this Court on or before the next date of listing, indicating the "
        "steps taken to comply with directions (i) and (ii) above. Non-compliance shall be viewed "
        "seriously and may result in initiation of contempt proceedings.",
    ]
    for d in directions:
        story.append(Paragraph(d, styles["DirectionItem"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "The Writ Petition is disposed of in the aforesaid terms. No order as to costs.",
        styles["BodyTextNoIndent"],
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Registry to communicate a copy of this order to the Commissioner, BBMP, within three working days.",
        styles["BodyTextNoIndent"],
    ))

    story.append(Paragraph("Sd/-", styles["JudgeName"]))
    story.append(Paragraph("<b>JUSTICE R. SURESH KUMAR</b>", styles["JudgeName"]))
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#999999"), spaceAfter=4))
    story.append(Paragraph(
        "Authenticated copy — High Court of Karnataka, Bengaluru  |  Generated for demo purposes",
        styles["SmallCenter"],
    ))

    doc.build(story)
    print(f"  [OK] Created: {path}")


# ══════════════════════════════════════════════
#  PDF 2 — WP 78903/2024  (Land mutation)
# ══════════════════════════════════════════════
def create_judgment_2(styles):
    path = os.path.join(OUTPUT_DIR, "judgment_2.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=1.2*inch, rightMargin=1.2*inch,
        topMargin=0.8*inch, bottomMargin=0.8*inch,
    )
    story = header_block(
        styles,
        case_no="78903/2024",
        petitioner="Smt. Kavitha Reddy",
        respondent="Department of Revenue, Government of Karnataka",
        coram="HON'BLE MS. JUSTICE S. PRIYA NAIR",
        date_of_order="20TH DAY OF NOVEMBER, 2024",
    )

    # --- Page 1 body ---
    paras = [
        "The petitioner, Smt. Kavitha Reddy, wife of Sri. Venkatesh Reddy, resident of "
        "Anjanapura Layout, 9th Block, Bengaluru – 560 062, has invoked the extraordinary "
        "jurisdiction of this Court under Article 226 of the Constitution of India, seeking a "
        "Writ of Mandamus commanding the respondent, the Department of Revenue, Government of "
        "Karnataka, acting through the Tahsildar, Bengaluru South Taluk, to process and grant "
        "the mutation of the property bearing Katha No. 245/112/2018 in Survey No. 66/3, "
        "Anjanapura Village, Bengaluru South Taluk, in the name of the petitioner consequent upon "
        "a registered sale deed executed in her favour.",

        "The petitioner's learned counsel, Smt. Deepa S., submits that the petitioner purchased "
        "the subject property measuring 30 feet by 40 feet from one Sri. Nagaraj B., the previous "
        "owner, through a registered sale deed dated 14th August 2023, bearing Document No. "
        "BLR-S-2023-08-05671, registered before the Sub-Registrar, Jayanagar, Bengaluru. The "
        "petitioner, immediately upon registration, applied for mutation before the Tahsildar, "
        "Bengaluru South Taluk, vide Application No. REV/MUT/BST/2023/2289 dated 20th August 2023. "
        "Despite the passage of over fourteen months and multiple personal visits and written "
        "representations, no action has been taken on the application.",

        "It is further submitted that the petitioner has fulfilled all requirements under Section "
        "128-A of the Karnataka Land Revenue Act, 1964, including submission of the original sale "
        "deed, encumbrance certificate obtained from the Sub-Registrar's Office for the preceding "
        "thirteen years, property tax receipts from the BBMP, and an up-to-date Aadhaar-linked "
        "identity proof. The petitioner has not received any notice of deficiency or objection from "
        "the respondent authority.",

        "The learned Additional Government Advocate, Sri. P. Kiran Kumar, appearing for the "
        "respondent, submits that the delay is attributable to the ongoing digitization of land "
        "records under the Bhoomi project and that a large number of applications are pending "
        "across all taluks in Bengaluru Urban District. He further states that the Village "
        "Accountant had been transferred during the relevant period and that the successor officer "
        "was in the process of verifying the pending files.",
    ]
    for p in paras:
        story.append(Paragraph(p, styles["BodyText2"]))

    # --- Page 2 body ---
    paras2 = [
        "This Court has carefully considered the submissions of both sides and has perused the "
        "documents annexed to the petition, including the certified copy of the sale deed, the "
        "encumbrance certificate, the application for mutation along with its acknowledgment "
        "receipt, and the representations made by the petitioner to the Tahsildar and the "
        "Assistant Commissioner, Bengaluru South Sub-Division.",

        "The right to hold property and to have the revenue records reflect the correct ownership "
        "is a fundamental aspect of property rights in India. Delay in mutation of revenue records "
        "not only causes hardship to the property owner but also creates ambiguity in title, which "
        "can impede the owner's ability to access credit, obtain building permissions, or transfer "
        "the property. The Hon'ble Supreme Court in <i>Suraj Lamp & Industries (P) Ltd. v. State "
        "of Haryana</i> (2012) 1 SCC 656, while discussing the importance of revenue records, "
        "emphasized the need for timely updation of mutation entries.",

        "Section 128-A of the Karnataka Land Revenue Act, 1964, as amended, read with Rule 57 of "
        "the Karnataka Land Revenue Rules, 1966, mandates that mutation proceedings shall be "
        "completed within a period of thirty days from the date of receipt of the application, "
        "complete in all respects. In the present case, the petitioner's application has been "
        "pending for over fourteen months, which is patently in violation of the statutory time "
        "limit and constitutes a clear dereliction of duty on the part of the respondent authority.",

        "The explanation offered by the respondent regarding digitization and transfer of officials "
        "cannot be accepted as a valid justification for such inordinate delay. Administrative "
        "inconvenience cannot override the statutory rights of citizens. It is the duty of the "
        "State to ensure that adequate manpower and systems are in place to discharge statutory "
        "obligations within the prescribed time frames.",

        "In view of the foregoing, this Court is satisfied that the petitioner has made out a case "
        "for grant of the reliefs sought, and accordingly passes the following order:",
    ]
    for p in paras2:
        story.append(Paragraph(p, styles["BodyText2"]))

    # --- Directions ---
    story.append(Spacer(1, 6))
    story.append(Paragraph("<u>DIRECTIONS</u>", styles["DirectionHead"]))
    story.append(Spacer(1, 4))

    directions = [
        "<b>(i)</b>&nbsp;&nbsp;The respondent, Department of Revenue, Government of Karnataka, "
        "acting through the Tahsildar, Bengaluru South Taluk, is hereby <b>directed to process and "
        "complete the mutation of the property</b> bearing Katha No. 245/112/2018 in Survey No. "
        "66/3, Anjanapura Village, in the name of the petitioner Smt. Kavitha Reddy, <b>within a "
        "period of 30 (thirty) days</b> from the date of receipt of a certified copy of this order, "
        "in accordance with the provisions of Section 128-A of the Karnataka Land Revenue Act, 1964.",

        "<b>(ii)</b>&nbsp;&nbsp;In the event the respondent fails to comply with direction (i) above "
        "within the stipulated period, <b>a penalty of Rs. 500/- (Rupees Five Hundred only) per day "
        "of delay</b> shall be imposed on the concerned Tahsildar, to be recovered from his personal "
        "salary, until the mutation is completed. This penalty shall commence from the 31st day "
        "following receipt of this order.",

        "<b>(iii)</b>&nbsp;&nbsp;The <b>Deputy Commissioner, Bengaluru Urban District, is directed "
        "to personally supervise</b> the compliance of direction (i) and shall file a compliance "
        "affidavit before this Court within 45 days from the date of this order, confirming that the "
        "mutation has been effected and the revenue records have been updated accordingly.",
    ]
    for d in directions:
        story.append(Paragraph(d, styles["DirectionItem"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "The Writ Petition stands disposed of with the above directions. No order as to costs. "
        "Parties to bear their own costs.",
        styles["BodyTextNoIndent"],
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "The Registry is directed to forward a copy of this order to the Principal Secretary, "
        "Department of Revenue, Government of Karnataka, for information and necessary action.",
        styles["BodyTextNoIndent"],
    ))

    story.append(Paragraph("Sd/-", styles["JudgeName"]))
    story.append(Paragraph("<b>JUSTICE S. PRIYA NAIR</b>", styles["JudgeName"]))
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#999999"), spaceAfter=4))
    story.append(Paragraph(
        "Authenticated copy — High Court of Karnataka, Bengaluru  |  Generated for demo purposes",
        styles["SmallCenter"],
    ))

    doc.build(story)
    print(f"  [OK] Created: {path}")


# ──────────────────────────────────────────────
if __name__ == "__main__":
    print("\n[*] Generating Karnataka High Court judgment PDFs ...\n")
    styles = build_styles()
    create_judgment_1(styles)
    create_judgment_2(styles)
    print(f"\n[OK] PDFs saved to: {os.path.abspath(OUTPUT_DIR)}\n")
