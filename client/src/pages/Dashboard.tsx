import { Link } from "wouter";
import { ArrowRight, BarChart3, BookOpen, Clock3, FileText, Image, Lightbulb, Plus, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import type { StoredHistoryEntry } from "@/lib/storage";

function readHistory(): StoredHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem("createflow-history") || "[]") as StoredHistoryEntry[];
  } catch {
    return [];
  }
}

function DashboardContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<StoredHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readHistory());
  }, []);

  const typeCount = new Set(entries.map(entry => entry.type)).size;
  const imageCount = entries.filter(entry => entry.type === "image").length;
  const codeCount = entries.filter(entry => entry.type === "code").length;
  const displayName = user?.name?.split(" ")[0] || "creator";

  return <div className="min-h-screen bg-[#eafcff] px-4 py-5 text-[#123765] sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e9e2ff] px-3 py-1.5 text-xs font-bold text-[#174783]"><Sparkles size={13} /> Your creative command center</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Good to see you, {displayName}.</h1><p className="mt-2 max-w-xl text-[#66849a]">Pick up an idea, explore a prompt, or turn a blank page into something useful.</p></div><Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123765] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#bfe7ee] transition hover:bg-[#174783]"><Plus size={17} /> New creation</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={BarChart3} label="Total creations" value={entries.length} detail="Saved in this browser" tone="lavender" /><Metric icon={Clock3} label="Recent formats" value={typeCount} detail="Different generator types" tone="cyan" /><Metric icon={Image} label="Images created" value={imageCount} detail="Visual ideas saved" tone="pink" /><Metric icon={FileText} label="Code drafts" value={codeCount} detail="Build-ready outputs" tone="teal" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><section className="rounded-3xl border border-[#d5e7ee] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#89a4b5]">Keep moving</p><h2 className="mt-2 text-xl font-black">Quick actions</h2></div><Wand2 className="text-[#2369b7]" size={20} /></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><ActionCard href="/" icon={Plus} title="Create" detail="Start from a blank brief" /><ActionCard href="/prompts" icon={BookOpen} title="Prompt Library" detail="Borrow a proven direction" /><ActionCard href="/history" icon={Clock3} title="History" detail="Return to saved work" /></div><div className="mt-6 rounded-2xl bg-[#f1f8fa] p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e9e2ff] text-[#2369b7]"><Lightbulb size={17} /></span><div><h3 className="font-bold">A simple way to start</h3><p className="mt-1 text-sm leading-6 text-[#66849a]">Choose a generator, add one clear sentence, and let CreateFlow shape the first draft. You can refine it after the first result.</p></div></div></div></section><section className="rounded-3xl border border-[#d5e7ee] bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#89a4b5]">Your workspace</p><h2 className="mt-2 text-xl font-black">Recent work</h2></div><Link href="/history" className="inline-flex items-center gap-1 text-sm font-bold text-[#2369b7]">View all <ArrowRight size={15} /></Link></div>{entries.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#c9e0e8] bg-[#f8fcfd] px-5 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e9e2ff] text-[#2369b7]"><FileText size={20} /></span><h3 className="mt-4 font-bold">Your first creation is waiting</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#66849a]">Saved generations will appear here so you can pick up where you left off.</p><Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123765] px-4 py-2.5 text-sm font-bold text-white">Start creating <ArrowRight size={15} /></Link></div> : <div className="mt-5 space-y-3">{entries.slice(0, 5).map(entry => <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-[#e4eff3] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9e2ff] text-[#2369b7]"><FileText size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{entry.title}</p><p className="mt-1 text-xs text-[#89a4b5]">{entry.type} · {new Date(entry.date).toLocaleDateString()}</p></div><Link href="/history" className="grid size-8 shrink-0 place-items-center rounded-lg text-[#66849a] hover:bg-[#f1f8fa] hover:text-[#2369b7]" aria-label={`View ${entry.title}`}><ArrowRight size={16} /></Link></div>)}</div>}</section></div></div></div>;
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof BarChart3; label: string; value: number; detail: string; tone: "lavender" | "cyan" | "pink" | "teal" }) {
  const tones = { lavender: "bg-[#e9e2ff] text-[#2369b7]", cyan: "bg-[#e4f8fb] text-[#178da0]", pink: "bg-[#fde8f1] text-[#c6507c]", teal: "bg-[#e0f5f0] text-[#13856f]" };
  return <div className="rounded-2xl border border-[#d5e7ee] bg-white p-5 shadow-sm"><div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></div><p className="mt-5 text-sm font-semibold text-[#66849a]">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-[#89a4b5]">{detail}</p></div>;
}

function ActionCard({ href, icon: Icon, title, detail }: { href: string; icon: typeof Plus; title: string; detail: string }) {
  return <Link href={href} className="group rounded-2xl border border-[#d5e7ee] bg-[#f8fcfd] p-4 transition hover:-translate-y-0.5 hover:border-[#93d8df] hover:bg-white"><span className="grid size-9 place-items-center rounded-xl bg-[#e9e2ff] text-[#2369b7]"><Icon size={17} /></span><p className="mt-4 font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#66849a]">{detail}</p></Link>;
}

export default function Dashboard() {
  return <DashboardLayout><DashboardContent /></DashboardLayout>;
}
