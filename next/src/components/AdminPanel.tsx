"use client";

import Link from "next/link";
import { useState } from "react";

type Branch = { code: string; name: string };
type Entry = {
  id: string; playerName: string; phoneNumber: string | null; score: number; mode: "easy" | "normal" | "hard";
  branchCode: string; branchName: string; createdAt: string;
};

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("Wrong password.");
      const data = await fetch("/api/admin/entries", { cache: "no-store" });
      if (!data.ok) throw new Error("Admin data is temporarily unavailable.");
      const result = await data.json() as { entries: Entry[]; branches: Branch[] };
      setEntries(result.entries); setBranches(result.branches); setUnlocked(true); setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not unlock admin.");
    } finally {
      setLoading(false);
    }
  }
  async function save(entry: Entry) {
    setError("");
    const response = await fetch("/api/admin/entries", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    });
    const result = await response.json() as { entry?: Entry; error?: string };
    if (!response.ok || !result.entry) { setError(result.error || "Entry could not be updated."); return; }
    setEntries((current) => current.map((item) => item.id === entry.id ? result.entry! : item));
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    const response = await fetch("/api/admin/entries", {
      method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const result = await response.json() as { error?: string };
      setError(result.error || "Entry could not be deleted.");
      return;
    }
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }
  const visible = entries.filter((entry) =>
    (!branchFilter || entry.branchCode === branchFilter) &&
    (!query || entry.playerName.toLowerCase().includes(query.toLowerCase()) ||
      (entry.phoneNumber || "").includes(query)),
  );

  if (!unlocked) return <main className="adm"><section className="panel adm-in gate-panel">
    <h1>Backpack Blitz admin</h1>
    <p>Enter the admin password to load all entries.</p>
    <form className="gate" onSubmit={unlock}>
      <label htmlFor="admin-password">Admin password</label>
      <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus />
      <button className="btn sm" disabled={loading}>{loading ? "Unlocking…" : "Unlock"}</button>
      {error && <p className="msg">{error}</p>}
    </form>
  </section></main>;

  return <main className="adm"><section className="panel adm-in">
    <div className="adm-top"><h1>Admin: edit or delete entries</h1><Link className="btn sm" href="/">Back to game</Link></div>
    <div className="tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or phone" aria-label="Search name or phone" /><select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filter by branch"><option value="">All branches</option>{branches.map((branch) => <option key={branch.code} value={branch.code}>{branch.code}</option>)}</select><span className="am">{visible.length} of {entries.length} entries</span></div>
    {error && <p className="msg">{error}</p>}
    <div className="admin-list">{visible.map((entry) => <AdminRow key={entry.id} entry={entry} branches={branches} onSave={save} onDelete={remove} />)}{!visible.length && <p className="am">No entries.</p>}</div>
  </section></main>;
}

function AdminRow({ entry, branches, onSave, onDelete }: {
  entry: Entry; branches: Branch[]; onSave: (entry: Entry) => Promise<void>; onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(entry);
  return <div className="arow">
    <input value={draft.playerName} maxLength={14} aria-label="Name" onChange={(event) => setDraft({ ...draft, playerName: event.target.value })} />
    <input value={draft.phoneNumber || ""} inputMode="tel" aria-label="Phone number" placeholder="Phone (optional)" onChange={(event) => setDraft({ ...draft, phoneNumber: event.target.value || null })} />
    <select value={draft.branchCode} aria-label="Branch" onChange={(event) => setDraft({ ...draft, branchCode: event.target.value })}><option value="">Unassigned</option>{branches.map((branch) => <option key={branch.code} value={branch.code}>{branch.code}</option>)}</select>
    <input type="number" min="0" max="9999" value={draft.score} aria-label="Score" onChange={(event) => setDraft({ ...draft, score: Number(event.target.value) })} />
    <select value={draft.mode} aria-label="Difficulty" onChange={(event) => setDraft({ ...draft, mode: event.target.value as Entry["mode"] })}><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select>
    <span className="am">{new Date(entry.createdAt).toLocaleString()}</span>
    <div className="aa"><button className="btn sm" onClick={() => void onSave(draft)}>Save</button><button className="btn sm danger" onClick={() => void onDelete(entry.id)}>Delete</button></div>
  </div>;
}
