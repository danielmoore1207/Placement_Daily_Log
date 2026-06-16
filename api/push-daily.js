import { getServiceClient } from "./_supabaseAuth";
import { configureWebPush, sendPush } from "./_push";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const expectedToken = process.env.CRON_SECRET;
    const authorization = req.headers.authorization || "";
    const providedToken = authorization.toLowerCase().startsWith("bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";
    if (!expectedToken || providedToken !== expectedToken) {
      return res.status(401).json({ error: "Unauthorized cron trigger." });
    }

    configureWebPush();
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("push_subscriptions").select("*");
    if (error) return res.status(500).json({ error: error.message });

    let sent = 0;
    let failed = 0;
    await Promise.all(
      (data || []).map(async (subscription) => {
        try {
          await sendPush(subscription, {
            title: "Daily log reminder",
            body: "Reminder: add today's placement entry before you finish work.",
            url: "/new-log"
          });
          sent += 1;
        } catch {
          failed += 1;
        }
      })
    );

    return res.status(200).json({ sent, failed });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unexpected server error." });
  }
}
