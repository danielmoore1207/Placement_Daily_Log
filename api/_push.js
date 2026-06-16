import webpush from "web-push";

export function configureWebPush() {
  const subject = process.env.WEB_PUSH_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error("Missing WEB_PUSH_SUBJECT, VAPID_PUBLIC_KEY, or VAPID_PRIVATE_KEY.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPush(subscription, payload) {
  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    },
    JSON.stringify(payload)
  );
}
