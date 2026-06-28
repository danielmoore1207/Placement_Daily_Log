import { useState } from "react";

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
    return (
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white">Profile</h2>
        <p className="rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-zinc-100">{user.email}</p>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-lg border border-white/25 bg-black px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900"
        >
          Sign out
        </button>
        {status ? <p className="text-sm text-zinc-200">{status}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-white">Sign in</h2>
      <form className="space-y-3 rounded-xl border border-white/20 bg-black/40 p-4" onSubmit={handleSignIn}>
        <input
          type="email"
          required
          value={email}
          placeholder="Email"
          className="w-full rounded border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          required
          value={password}
          placeholder="Password"
          className="w-full rounded border border-white/25 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            className="rounded border border-white bg-white px-3 py-2 text-sm font-semibold text-black"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="rounded border border-white/25 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-100"
          >
            Sign up
          </button>
        </div>
      </form>
      {status ? <p className="text-sm text-zinc-200">{status}</p> : null}
    </section>
  );
}
