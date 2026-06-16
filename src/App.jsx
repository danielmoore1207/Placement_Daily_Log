import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewLog from "./pages/NewLog";
import History from "./pages/History";
import Profile from "./pages/Profile";
import { getSignedPdfUrl, requestPdfGeneration } from "./services/pdfClient";
import { isSupabaseConfigured, supabase } from "./utils/supabase";

export default function App() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setConfigError("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use this app.");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setLogs([]);
      return;
    }

    async function fetchLogs() {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false });
      if (!error) setLogs(data || []);
    }
    fetchLogs();
  }, [user]);

  async function upsertLog(payload) {
    if (!supabase || !user) {
      throw new Error("Sign in required.");
    }

    const dbPayload = {
      ...payload,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(dbPayload, { onConflict: "user_id,log_date" })
      .select("*")
      .single();

    if (error) throw error;

    setLogs((prev) => {
      const index = prev.findIndex((item) => item.id === data.id);
      if (index === -1) return [data, ...prev];
      const next = [...prev];
      next[index] = data;
      return next;
    });

    return data;
  }

  async function handleGeneratePdf(logId) {
    const result = await requestPdfGeneration(logId);
    setLogs((prev) => prev.map((log) => (log.id === logId ? { ...log, pdf_path: result.pdfPath } : log)));
    return result;
  }

  async function handleOpenPdf(path) {
    const url = await getSignedPdfUrl(path);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleSignIn(email, password) {
    if (!supabase) throw new Error("Supabase not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function handleSignUp(email, password) {
    if (!supabase) throw new Error("Supabase not configured.");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setLogs([]);
  }

  return (
    <Layout>
      {configError ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{configError}</div>
      ) : null}

      <Routes>
        <Route path="/" element={<Dashboard user={user} logs={logs} />} />
        <Route
          path="/new-log"
          element={user ? <NewLog onUpsertLog={upsertLog} /> : <Navigate to="/profile" replace />}
        />
        <Route
          path="/history"
          element={
            user ? (
              <History logs={logs} onGeneratePdf={handleGeneratePdf} onOpenPdf={handleOpenPdf} />
            ) : (
              <Navigate to="/profile" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            <Profile user={user} onSignIn={handleSignIn} onSignUp={handleSignUp} onSignOut={handleSignOut} />
          }
        />
      </Routes>
    </Layout>
  );
}
