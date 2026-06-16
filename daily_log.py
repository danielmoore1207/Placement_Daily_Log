from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
from typing import Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT_DIR = Path(__file__).parent
ENTRIES_DIR = ROOT_DIR / "entries"
PDF_DIR = ROOT_DIR / "monthly_logs"


def prompt_text(label: str, required: bool = True) -> str:
    while True:
        value = input(f"{label}: ").strip()
        if value or not required:
            return value
        print("This field is required.")


def prompt_multiline(label: str, required: bool = True) -> str:
    print(f"{label} (type END on a new line to finish):")
    lines: List[str] = []
    while True:
        line = input()
        if line.strip().upper() == "END":
            break
        lines.append(line)
    text = "\n".join(lines).strip()
    if required and not text:
        print("This field is required.")
        return prompt_multiline(label, required=required)
    return text


def prompt_rating(label: str) -> int:
    while True:
        raw = input(f"{label} [1-5]: ").strip()
        if raw.isdigit() and 1 <= int(raw) <= 5:
            return int(raw)
        print("Enter a number from 1 to 5.")


def ensure_directories(date_value: dt.date) -> Dict[str, Path]:
    month_key = date_value.strftime("%Y-%m")
    entry_folder = ENTRIES_DIR / month_key
    pdf_folder = PDF_DIR / month_key
    entry_folder.mkdir(parents=True, exist_ok=True)
    pdf_folder.mkdir(parents=True, exist_ok=True)
    return {"entry_folder": entry_folder, "pdf_folder": pdf_folder}


def collect_entry(date_value: dt.date) -> Dict:
    print("\nDaily Placement Log Form")
    print("-" * 28)
    print(f"Date: {date_value.isoformat()}")
    print("Use END to finish multi-line answers.\n")

    project_names = prompt_text("Project(s) worked on (comma-separated)")
    tasks_completed = prompt_multiline("Key tasks completed")
    outcomes = prompt_multiline("Outcomes/impact of your work")
    blockers = prompt_multiline("Blockers or challenges", required=False)
    learnings = prompt_multiline("What you learned today")
    collaboration = prompt_multiline("Who you worked with / collaboration notes", required=False)
    next_steps = prompt_multiline("Priorities for tomorrow")

    ratings = {
        "productivity": prompt_rating("Productivity"),
        "communication": prompt_rating("Communication"),
        "problem_solving": prompt_rating("Problem solving"),
        "wellbeing": prompt_rating("Wellbeing"),
    }

    reflection = prompt_multiline("Short overall reflection")

    return {
        "date": date_value.isoformat(),
        "projects": [p.strip() for p in project_names.split(",") if p.strip()],
        "tasks_completed": tasks_completed,
        "outcomes": outcomes,
        "blockers": blockers,
        "learnings": learnings,
        "collaboration": collaboration,
        "next_steps": next_steps,
        "ratings": ratings,
        "reflection": reflection,
    }


def write_json(entry: Dict, output_path: Path) -> None:
    output_path.write_text(json.dumps(entry, indent=2), encoding="utf-8")


def make_pdf(entry: Dict, output_path: Path) -> None:
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    title_style.fontName = "Helvetica-Bold"
    title_style.fontSize = 18

    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading3"],
        spaceAfter=4,
        textColor=colors.HexColor("#0b3d91"),
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        leading=14,
        spaceAfter=8,
    )

    story: List = []
    story.append(Paragraph("Placement Daily Log", title_style))
    story.append(Paragraph(f"Date: {entry['date']}", styles["Normal"]))
    story.append(Spacer(1, 8))

    projects = ", ".join(entry["projects"]) if entry["projects"] else "N/A"
    story.append(Paragraph("<b>Projects:</b> " + projects, body_style))
    story.append(Spacer(1, 4))

    def add_section(title: str, text: str) -> None:
        safe_text = text.replace("\n", "<br/>") if text else "N/A"
        story.append(Paragraph(title, section_title))
        story.append(Paragraph(safe_text, body_style))

    add_section("Key Tasks Completed", entry["tasks_completed"])
    add_section("Outcomes and Impact", entry["outcomes"])
    add_section("Blockers or Challenges", entry["blockers"])
    add_section("Learnings", entry["learnings"])
    add_section("Collaboration Notes", entry["collaboration"])
    add_section("Priorities for Tomorrow", entry["next_steps"])

    story.append(Paragraph("Daily Self-Evaluation", section_title))
    rating_rows = [["Metric", "Rating (1-5)"]] + [
        [metric.replace("_", " ").title(), str(score)]
        for metric, score in entry["ratings"].items()
    ]
    table = Table(rating_rows, colWidths=[100 * mm, 40 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dce6f8")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#102a43")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ALIGN", (1, 1), (1, -1), "CENTER"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 8))

    add_section("Overall Reflection", entry["reflection"])

    doc.build(story)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a daily placement log form and export it to PDF."
    )
    parser.add_argument(
        "--date",
        help="Date for the entry in YYYY-MM-DD format. Defaults to today.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.date:
        try:
            date_value = dt.date.fromisoformat(args.date)
        except ValueError:
            raise SystemExit("Invalid date format. Use YYYY-MM-DD.")
    else:
        date_value = dt.date.today()

    folders = ensure_directories(date_value)
    entry = collect_entry(date_value)

    date_stamp = date_value.isoformat()
    json_path = folders["entry_folder"] / f"Daily_Log_({date_stamp}).json"
    pdf_path = folders["pdf_folder"] / f"Daily_Log_({date_stamp}).pdf"

    write_json(entry, json_path)
    make_pdf(entry, pdf_path)

    print("\nSaved successfully:")
    print(f"- Form entry: {json_path}")
    print(f"- PDF file:   {pdf_path}")


if __name__ == "__main__":
    main()
