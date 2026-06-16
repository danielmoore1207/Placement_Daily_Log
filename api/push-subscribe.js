import { getServiceClient, getUserFromAuthHeader } from "./_supabaseAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { error: authError, user } = await getUserFromAuthHeader(req);
    if (authError || !user) return res.status(401).json({ error: authError || "Unauthorized." });

    const { subscription } = req.body || {};
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: "Invalid push subscription payload." });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unexpected server error." });
  }
}
