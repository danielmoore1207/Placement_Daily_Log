import { getServiceClient, getUserFromAuthHeader } from "./_supabaseAuth";
import { configureWebPush, sendPush } from "./_push";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { error: authError, user } = await getUserFromAuthHeader(req);
    if (authError || !user) return res.status(401).json({ error: authError || "Unauthorized." });

    configureWebPush();
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "No push subscription found for this user." });

    await sendPush(data, {
      title: "Placement Daily Log",
      body: "Test notification sent successfully.",
      url: "/"
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unexpected server error." });
  }
}
