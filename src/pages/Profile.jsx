import { useState } from "react";
import { sendTestPush, subscribeToPush } from "../services/pushClient";

export default function Profile({ user, onSignIn, onSignUp, onSignOut }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleSignIn(event) {
    event.preventDefault();
    setStatus("");
    try {
      await onSignIn(email, password);
      setStatus("Signed in.");
    } catch (error) {
      setStatus(error.message || "Sign in failed.");
    }
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setStatus("");
    try {
      await onSignUp(email, password);
      setStatus("Check your inbox to confirm your account.");
    } catch (error) {
      setStatus(error.message || "Sign up failed.");
    }
  }

  if (user) {
    async function handleEnableNotifications() {
      setStatus("");
      try {
        await subscribeToPush();
        setStatus("Notifications enabled for this device.");
      } catch (error) {
        setStatus(error.message || "Could not enable notifications.");
      }
    }

    async function handleTestNotification() {
      setStatus("");
      try {
        await sendTestPush();
        setStatus("Test notification sent.");
      } catch (error) {
        setStatus(error.message || "Could not send test notification.");
      }
    }

    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{user.email}</p>
        <button
          type="button"
          onClick={handleEnableNotifications}
          className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white"
        >
          Enable notifications on this device
        </button>
        <button
          type="button"
          onClick={handleTestNotification}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
        >
          Send test notification
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
        >
          Sign out
        </button>
        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={handleSignIn}>
        <input
          type="email"
          required
          value={email}
          placeholder="Email"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          required
          value={password}
          placeholder="Password"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <button type="submit" className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Sign up
          </button>
        </div>
      </form>
      {status ? <p className="text-sm text-slate-700">{status}</p> : null}
    </section>
  );
}
