"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRANCHES, DIFFICULTIES, type Difficulty, type PublicEntry } from "@/lib/constants";

type Item = { id: number; emoji: string; name: string; weight: number; value: number; inBag: boolean };
type Phase = "ready" | "play" | "end";
type Branch = { code: string; name: string };
const POOL = [
  ["💎", "Blue diamond"], ["👑", "Crown"], ["🏺", "Ming vase"], ["🖼️", "Painting"],
  ["📀", "Gold disc"], ["🗿", "Statue"], ["⌚", "Watch"], ["🔱", "Trident"],
  ["🧿", "Amulet"], ["📜", "Scroll"], ["🪙", "Coin stash"], ["🎻", "Violin"],
];
const TIMES = ["auto", "20", "30", "45", "60", "90"];

function randomInt(max: number) { return Math.floor(Math.random() * max); }
function solve(items: Item[], capacity: number) {
  const dp = Array.from({ length: items.length + 1 }, () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= items.length; i++) {
    const item = items[i - 1];
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c];
      if (c >= item.weight) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - item.weight] + item.value);
    }
  }
  let capacityLeft = capacity;
  const selected: number[] = [];
  for (let i = items.length; i > 0; i--) {
    if (dp[i][capacityLeft] !== dp[i - 1][capacityLeft]) {
      selected.push(i - 1);
      capacityLeft -= items[i - 1].weight;
    }
  }
  return { best: dp[items.length][capacity], selected };
}
function greedy(items: Item[], capacity: number) {
  let weight = 0;
  let value = 0;
  [...items].sort((a, b) => b.value / b.weight - a.value / a.weight).forEach((item) => {
    if (weight + item.weight <= capacity) {
      weight += item.weight;
      value += item.value;
    }
  });
  return value;
}
function generateItems(mode: Difficulty) {
  const config = DIFFICULTIES[mode];
  let items: Item[] = [];
  for (let attempt = 0; attempt < 800; attempt++) {
    const names = [...POOL].sort(() => Math.random() - 0.5).slice(0, config.items);
    items = names.map(([emoji, name], id) => {
      const weight = 2 + randomInt(config.maxWeight - 1);
      return { id, emoji, name, weight, value: weight * (3 + randomInt(6)) + randomInt(12) + 2, inBag: false };
    });
    if (items.reduce((sum, item) => sum + item.weight, 0) >= config.capacity * 1.4) {
      const optimal = solve(items, config.capacity).best;
      if (optimal > greedy(items, config.capacity)) break;
    }
  }
  return items;
}
function playTone(frequency: number, duration = 0.12, type: OscillatorType = "sine") {
  try {
    const AudioContextClass = window.AudioContext || (
      window as unknown as { webkitAudioContext?: typeof AudioContext }
    ).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.07;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  } catch {
    // Audio is optional and may be blocked by the browser.
  }
}

export default function Game() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<Difficulty>("normal");
  const [timeChoice, setTimeChoice] = useState("auto");
  const [seconds, setSeconds] = useState<number>(DIFFICULTIES.normal.time);
  const [items, setItems] = useState<Item[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branches, setBranches] = useState<Branch[]>(BRANCHES.map(([code, name]) => ({ code, name })));
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<"dept" | "player">("dept");
  const [leaderboardBranch, setLeaderboardBranch] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ title: string; score: number; detail: string; reveal: string } | null>(null);
  const [bestBot, setBestBot] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const raf = useRef<number | null>(null);

  const capacity = DIFFICULTIES[mode].capacity;
  const roundTime = timeChoice === "auto" ? DIFFICULTIES[mode].time : Number(timeChoice);
  const usedWeight = items.filter((item) => item.inBag).reduce((sum, item) => sum + item.weight, 0);
  const haulValue = items.filter((item) => item.inBag).reduce((sum, item) => sum + item.value, 0);
  const activeBranches = branches.length ? branches : BRANCHES.map(([code, name]) => ({ code, name }));

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Leaderboard unavailable");
      const data = await response.json() as { branches: Branch[]; entries: PublicEntry[] };
      setBranches(data.branches);
      setEntries(data.entries);
    } catch {
      setMessage("Leaderboard is unavailable. Scores can be played, but could not be loaded.");
    }
  }, []);

  useEffect(() => {
    // The fetch synchronizes the initial client view with the database.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLeaderboard();
    const savedMode = window.localStorage.getItem("bb-mode") as Difficulty | null;
    const savedTime = window.localStorage.getItem("bb-time");
    if (savedMode && savedMode in DIFFICULTIES) setMode(savedMode);
    if (savedTime && TIMES.includes(savedTime)) setTimeChoice(savedTime);
  }, [loadLeaderboard]);
  useEffect(() => { window.localStorage.setItem("bb-mode", mode); }, [mode]);
  useEffect(() => { window.localStorage.setItem("bb-time", timeChoice); }, [timeChoice]);
  useEffect(() => {
    if (phase !== "play") return;
    const tick = () => {
      const left = Math.max(0, (endAt - performance.now()) / 1000);
      setSeconds(left);
      if (left <= 0) {
        finish();
      } else {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // finish is intentionally read from the current render when the round starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endAt]);

  function start() {
    if (!branchCode) { setMessage("Pick your branch to start."); return; }
    const nextItems = generateItems(mode);
    setItems(nextItems);
    setBestBot(greedy(nextItems, capacity));
    setSeconds(roundTime);
    setResult(null);
    setMessage("");
    setPhase("play");
    setEndAt(performance.now() + roundTime * 1000);
    playTone(660, 0.15);
  }
  function move(id: number, toBag: boolean) {
    if (phase !== "play") return;
    const item = items.find((entry) => entry.id === id);
    if (!item || item.inBag === toBag) return;
    if (toBag && usedWeight + item.weight > capacity) {
      setMessage("That item would exceed your backpack capacity.");
      playTone(110, 0.2, "sawtooth");
      return;
    }
    setMessage("");
    setItems((current) => current.map((entry) => entry.id === id ? { ...entry, inBag: toBag } : entry));
    playTone(toBag ? 620 : 420, 0.08);
  }
  async function finish() {
    if (phase !== "play") return;
    if (raf.current) cancelAnimationFrame(raf.current);
    setPhase("end");
    const optimal = solve(items, capacity);
    const perfect = haulValue === optimal.best;
    const beat = haulValue > bestBot;
    const score = Math.round(haulValue / optimal.best * 700) + (beat ? 200 : 0) +
      (perfect ? 100 + Math.round(Math.max(0, seconds) / roundTime * 450) : 0);
    const name = playerName.trim() || `Player ${Number(window.localStorage.getItem("bb-n") || 0) + 1}`;
    window.localStorage.setItem("bb-n", String(Number(window.localStorage.getItem("bb-n") || 0) + 1));
    const branchName = activeBranches.find((branch) => branch.code === branchCode)?.name || branchCode;
    setResult({
      title: perfect ? "Perfect heist!" : beat ? "You beat the bot" : "The bot out-packed you",
      score,
      detail: `You ${haulValue} · Greedy bot ${bestBot} · Best possible ${optimal.best}. ${branchCode} (${branchName})`,
      reveal: `Best bag: ${optimal.selected.map((id) => items[id].emoji).join(" ")} (${optimal.selected.reduce((sum, id) => sum + items[id].weight, 0)}/${capacity} kg). Dynamic programming checks every weight limit.`,
    });
    playTone(perfect ? 880 : beat ? 660 : 90, 0.4, perfect || beat ? "sine" : "sawtooth");
    try {
      const response = await fetch("/api/scores", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerName: name, phoneNumber, score, mode, branchCode }),
      });
      const data = await response.json() as { entry?: PublicEntry; error?: string };
      if (!response.ok || !data.entry) throw new Error(data.error || "Score could not be saved.");
      setEntries((current) => [data.entry!, ...current.filter((entry) => entry.id !== data.entry!.id)]
        .sort((a, b) => b.score - a.score));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Score could not be saved.");
    }
  }
  function next() {
    setPhase("ready"); setItems([]); setSeconds(roundTime); setResult(null);
    setPlayerName(""); setPhoneNumber(""); setBranchCode(""); setMessage("");
  }
  const departments = useMemo(() => {
    const grouped = new Map<string, PublicEntry[]>();
    entries.forEach((entry) => {
      if (entry.branchCode) grouped.set(entry.branchCode, [...(grouped.get(entry.branchCode) || []), entry]);
    });
    return [...grouped.entries()].map(([code, scores]) => ({
      code, players: scores.length, points: scores.sort((a, b) => b.score - a.score)
        .slice(0, 3).reduce((sum, entry) => sum + entry.score, 0),
    })).sort((a, b) => b.points - a.points);
  }, [entries]);
  const visibleEntries = entries.filter((entry) => !leaderboardBranch || entry.branchCode === leaderboardBranch).slice(0, 15);

  return (
    <div className="app">
      <main className="panel main">
        <div className="top">
          <div className={`timer ${seconds < 10 ? "low" : ""}`}>{seconds.toFixed(1)}</div>
          <div className="stats">
            <div className="stat">Your haul<b>{haulValue}</b></div>
            <div className="stat">Weight<b>{usedWeight}/{capacity}</b></div>
            <div className="stat bot">Greedy bot<b>{phase === "play" ? bestBot : 0}</b></div>
          </div>
          <div className="brand">Backpack Blitz<small>IEEE Day, VIT Pune</small></div>
        </div>
        <div className="zones">
          <section className="zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
            event.preventDefault(); move(Number(event.dataTransfer.getData("text/plain")), false);
          }}>
            <h4>The vault <span>tap or drag loot into your bag</span></h4>
            <div className="grid">{items.map((item) => <LootCard key={item.id} item={item} inVault onMove={move} />)}</div>
          </section>
          <section className="zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
            event.preventDefault(); move(Number(event.dataTransfer.getData("text/plain")), true);
          }}>
            <h4>Your backpack <span>{usedWeight}/{capacity} kg</span></h4>
            <div className="meter"><i style={{ width: `${Math.min(100, usedWeight / capacity * 100)}%` }} /></div>
            <div className="grid">{items.filter((item) => item.inBag).map((item) => <LootCard key={item.id} item={item} onMove={move} />)}</div>
          </section>
        </div>
        <div className="foot"><button className="btn" onClick={finish} disabled={phase !== "play"}>Lock the bag (Enter)</button></div>
        {phase === "ready" && <div className="ov">
          <h1>Backpack Blitz</h1>
          <p>Alarms are about to go off. Your bag holds a limited weight, so fill it with the most valuable loot you can. A greedy bot is racing you.</p>
          <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={14} placeholder="Your name (optional)" autoComplete="off" />
          <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" placeholder="Phone number (optional, for retrying)" autoComplete="tel" />
          <select value={branchCode} onChange={(event) => setBranchCode(event.target.value)} aria-label="Branch">
            <option value="">Select your branch…</option>{activeBranches.map((branch) => <option key={branch.code} value={branch.code}>{branch.name}</option>)}
          </select>
          <div className="seg">{(["easy", "normal", "hard"] as Difficulty[]).map((value) => <button key={value} className={mode === value ? "on" : ""} onClick={() => { setMode(value); setSeconds(timeChoice === "auto" ? DIFFICULTIES[value].time : Number(timeChoice)); }}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
          <label className="tl">Round time <select value={timeChoice} onChange={(event) => setTimeChoice(event.target.value)}>{TIMES.map((value) => <option key={value} value={value}>{value === "auto" ? "Auto (by difficulty)" : `${value} seconds`}</option>)}</select></label>
          {message && <p className="msg">{message}</p>}
          <button className="btn" onClick={start}>Start heist (Enter)</button>
        </div>}
        {phase === "end" && result && <div className="ov">
          <h1>{result.title}</h1><div className="big">{result.score}</div><p>{result.detail}</p><p className="reveal">{result.reveal}</p>
          {message && <p className="msg">{message}</p>}<button className="btn" onClick={next}>Next player</button>
        </div>}
      </main>
      <aside className="side"><div className="panel lb">
        <h3>Leaderboard</h3>
        <div className="tabs"><button className={leaderboardTab === "dept" ? "on" : ""} onClick={() => setLeaderboardTab("dept")}>Departments</button><button className={leaderboardTab === "player" ? "on" : ""} onClick={() => setLeaderboardTab("player")}>Players</button></div>
        {leaderboardTab === "player" && <select value={leaderboardBranch} onChange={(event) => setLeaderboardBranch(event.target.value)} aria-label="Filter by branch"><option value="">All branches</option>{activeBranches.map((branch) => <option key={branch.code} value={branch.code}>{branch.code}</option>)}</select>}
        <ol>{leaderboardTab === "dept" ? departments.map((entry, index) => <li key={entry.code}><span>{index + 1}. <b>{entry.code}</b><em>{entry.players} player{entry.players === 1 ? "" : "s"}</em></span><b>{entry.points}</b></li>) : visibleEntries.map((entry, index) => <li key={entry.id}><span>{index + 1}. <b>{entry.playerName}</b><em>{entry.branchCode || "?"}</em></span><b>{entry.score}</b></li>)}{!departments.length && leaderboardTab === "dept" && <li className="empty">No heists yet. Be the first.</li>}{!visibleEntries.length && leaderboardTab === "player" && <li className="empty">No entries yet.</li>}</ol>
      </div></aside>
    </div>
  );
}

function LootCard({ item, inVault = false, onMove }: { item: Item; inVault?: boolean; onMove: (id: number, toBag: boolean) => void }) {
  return <button className={`card${inVault && item.inBag ? " in" : ""}`} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(item.id))} onClick={() => onMove(item.id, !item.inBag)} aria-pressed={item.inBag}>
    <span className="e">{item.emoji}</span><b>{item.name}</b><span>⚖ {item.weight} kg</span><span>💰 {item.value}</span>
  </button>;
}
