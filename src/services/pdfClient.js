import { isSupabaseConfigured, supabase } from "../utils/supabase";

export async function requestPdfGeneration(logId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("You must be signed in to generate PDFs.");
  }

  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ logId })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "PDF generation failed.");
  }

  return response.json();
}

export async function getSignedPdfUrl(path) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase.storage
    .from("daily-log-pdfs")
    .createSignedUrl(path, 60 * 15);
  if (error) throw error;
  return data.signedUrl;
}
