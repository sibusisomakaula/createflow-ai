import fs from "node:fs";
const path = "client/src/pages/Home.tsx";
const source = fs.readFileSync(path, "utf8");
const marker = "export function HistoryPage() {";
const index = source.indexOf(marker);
if (index < 0) throw new Error("HistoryPage marker not found");
const replacement = `export function HistoryPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const historyQuery = trpc.history.list.useQuery(undefined, { enabled: isAuthenticated });
  const deleteMutation = trpc.history.delete.useMutation();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setEntries((historyQuery.data ?? []).map(item => ({ id: String(item.id), type: item.type, title: item.title, content: item.content, date: new Date(item.createdAt).toISOString() })));
    } else if (!authLoading) {
      setEntries(readHistory());
    }
  }, [authLoading, historyQuery.data, isAuthenticated]);

  const remove = async (id: string) => {
    if (isAuthenticated) {
      await deleteMutation.mutateAsync({ id: Number(id) });
      setEntries(current => current.filter(item => item.id !== id));
    } else {
      const next = entries.filter(item => item.id !== id);
      setEntries(next);
      saveHistory(next);
    }
    setSelected(null);
    toast.success("Deleted from history.");
  };
  const copy = async (content: string) => { await navigator.clipboard.writeText(content); toast.success("Copied!"); };

  return <Shell><div className="mx-auto max-w-5xl px-5 pb-14 pt-10 lg:px-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e9e2ff] px-3 py-1.5 text-xs font-bold text-[#174783]"><HistoryIcon size={13} /> History</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your saved work.</h1><p className="mt-2 text-[#66849a]">{isAuthenticated ? "Private to your account, wherever you sign in." : "Saved in this browser. Sign in to keep your work private across devices."}</p></div><button onClick={() => navigate("/")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174783] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#bfe7ee] hover:bg-[#123765]"><Plus size={16} /> Start Creating</button></div>{authLoading || (isAuthenticated && historyQuery.isLoading) ? <div className="grid min-h-80 place-items-center rounded-3xl border border-[#d5e7ee] bg-white text-[#66849a]"><Loader2 className="mr-2 inline animate-spin" size={18} />Loading your private history…</div> : entries.length === 0 ? <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-[#d5e7ee] bg-white p-10 text-center"><div><div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#e9e2ff] text-indigo-500"><HistoryIcon size={23} /></div><h2 className="font-bold text-[#174783]">You haven't saved anything yet.</h2><p className="mt-2 text-sm text-[#66849a]">Create something to see it here.</p><button onClick={() => navigate("/")} className="mt-5 text-sm font-bold text-[#2369b7]">Start Creating <ArrowRight className="ml-1 inline" size={15} /></button></div></div> : <div className="space-y-3">{entries.map(entry => <article key={entry.id} className="flex flex-col gap-4 rounded-2xl border border-[#d5e7ee] bg-white p-5 shadow-sm sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f1f8fa] text-[#2369b7]">{(() => { const Icon = generatorMeta[entry.type].icon; return <Icon size={18} />; })()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-[#174783]">{entry.title}</h2><span className="rounded-md bg-[#e7f1f5] px-2 py-1 text-[10px] font-bold uppercase text-[#66849a]">{generatorMeta[entry.type].label}</span></div><p className="mt-1 text-xs text-[#89a4b5]">{new Date(entry.date).toLocaleString()}</p><p className="mt-2 line-clamp-2 text-sm text-[#66849a]">{entry.type === "image" ? "Generated image" : entry.content}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => setSelected(entry)} className="rounded-lg border border-[#d5e7ee] p-2 text-[#66849a] hover:bg-[#f1f8fa]" aria-label="View saved item"><Monitor size={16} /></button>{entry.type !== "image" && <><button onClick={() => copy(entry.content)} className="rounded-lg border border-[#d5e7ee] p-2 text-[#66849a] hover:bg-[#f1f8fa]" aria-label="Copy content"><Clipboard size={16} /></button><button onClick={() => downloadTextPdf(entry.title, entry.content)} className="rounded-lg border border-[#d5e7ee] p-2 text-[#66849a] hover:bg-[#f1f8fa]" aria-label="Download PDF"><FileText size={16} /></button></>}{entry.type === "image" && <button onClick={() => void downloadImage(entry.content, "createflow-history-image.png")} className="rounded-lg border border-[#d5e7ee] p-2 text-[#66849a] hover:bg-[#f1f8fa]" aria-label="Download image"><Download size={16} /></button>}<button onClick={() => void remove(entry.id)} className="rounded-lg border border-[#d5e7ee] p-2 text-[#66849a] hover:bg-[#fff0f4] hover:text-[#d65c78]" aria-label="Delete history item"><Trash2 size={16} /></button></div></article>)}</div>}{selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[#123765]/40 p-5" onClick={() => setSelected(null)}><div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#2369b7]">Saved {generatorMeta[selected.type].label}</p><h2 className="mt-1 text-xl font-bold text-[#123765]">{selected.title}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 text-[#89a4b5] hover:bg-[#f1f8fa]"><X size={18} /></button></div>{selected.type === "image" ? <><img src={selected.content} alt={selected.title} className="max-h-[55vh] w-full rounded-2xl object-contain" /><button onClick={() => void downloadImage(selected.content, "createflow-history-image.png")} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123765] px-3 py-2 text-sm font-semibold text-white"><Download size={15} />Download Image</button></> : <><div className="rounded-2xl bg-[#f1f8fa] p-4 text-sm leading-7 text-[#31516c]"><Streamdown>{selected.content}</Streamdown></div><button onClick={() => downloadTextPdf(selected.title, selected.content)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123765] px-3 py-2 text-sm font-semibold text-white"><FileText size={15} />Download PDF</button></>}</div></div>}</div></Shell>;
}
`;
fs.writeFileSync(path, source.slice(0, index) + replacement);
