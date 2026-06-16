import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key);
}

function getAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
  }
  return createClient(url, anon);
}

function drawWrappedText(page, font, text, x, y, maxWidth, lineHeight, size = 11) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let cursorY = y;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font, color: rgb(0.15, 0.17, 0.2) });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  });
  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color: rgb(0.15, 0.17, 0.2) });
    cursorY -= lineHeight;
  }
  return cursorY;
}

async function buildPdf(log) {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]); // A4
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  const marginX = 50;
  const contentWidth = 495;
  let y = 790;

  page.drawText("Placement Daily Log", {
    x: marginX,
    y,
    size: 18,
    font: titleFont,
    color: rgb(0.06, 0.11, 0.2)
  });
  y -= 28;

  const sections = [
    ["Date", String(log.log_date)],
    ["Projects", (log.projects || []).join(", ") || "N/A"],
    ["Key tasks completed", log.tasks_completed],
    ["Outcomes and impact", log.outcomes],
    ["Blockers or challenges", log.blockers || "N/A"],
    ["Learnings", log.learnings],
    ["Collaboration notes", log.collaboration || "N/A"],
    ["Priorities for tomorrow", log.next_steps],
    [
      "Self-evaluation",
      `Productivity: ${log.productivity}/5 | Communication: ${log.communication}/5 | Problem solving: ${log.problem_solving}/5 | Wellbeing: ${log.wellbeing}/5`
    ],
    ["Overall reflection", log.reflection]
  ];

  sections.forEach(([title, value]) => {
    if (y < 100) {
      const next = pdf.addPage([595.28, 841.89]);
      page = next;
      y = 790;
      next.drawText("Placement Daily Log (continued)", {
        x: marginX,
        y,
        size: 14,
        font: titleFont,
        color: rgb(0.06, 0.11, 0.2)
      });
      y -= 24;
    }
    page.drawText(title, {
      x: marginX,
      y,
      size: 12,
      font: titleFont,
      color: rgb(0.05, 0.18, 0.47)
    });
    y -= 16;
    y = drawWrappedText(page, bodyFont, String(value), marginX, y, contentWidth, 14);
    y -= 8;
  });

  return pdf.save();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { logId } = req.body || {};
    if (!logId) {
      return res.status(400).json({ error: "Missing logId." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "Missing bearer token." });
    }
    const accessToken = authHeader.slice("Bearer ".length).trim();
    if (!accessToken) {
      return res.status(401).json({ error: "Missing bearer token." });
    }

    const authClient = getAnonClient();
    const {
      data: { user },
      error: userError
    } = await authClient.auth.getUser(accessToken);
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid session token." });
    }

    const supabase = getServiceClient();
    const { data: log, error: logError } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("id", logId)
      .single();
    if (logError || !log) {
      return res.status(404).json({ error: "Log not found." });
    }
    if (log.user_id !== user.id) {
      return res.status(403).json({ error: "You do not have access to this log." });
    }

    const monthFolder = String(log.log_date).slice(0, 7);
    const fileName = `Daily_Log_(${log.log_date}).pdf`;
    const pdfPath = `monthly_logs/${monthFolder}/${fileName}`;
    const bytes = await buildPdf(log);

    const { error: uploadError } = await supabase.storage
      .from("daily-log-pdfs")
      .upload(pdfPath, bytes, {
        contentType: "application/pdf",
        upsert: true
      });
    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { error: updateError } = await supabase
      .from("daily_logs")
      .update({ pdf_path: pdfPath })
      .eq("id", logId);
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ pdfPath });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unexpected server error." });
  }
}
