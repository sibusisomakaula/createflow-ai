import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const trpcUtils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await trpcUtils.auth.me.invalidate();
      navigate("/dashboard");
    },
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return <main className="min-h-screen bg-[#eafcff] px-5 py-10"><div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]"><div className="hidden lg:block"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e9e2ff] px-3 py-1.5 text-xs font-bold text-[#174783]"><Sparkles size={13} /> CreateFlow AI</div><h1 className="max-w-xl text-5xl font-black tracking-tight text-[#123765]">Bring your next idea to life.</h1><p className="mt-4 max-w-lg text-lg leading-8 text-[#66849a]">Log in with your email and password to continue creating emails, content, code, and images in one calm workspace.</p></div><section className="rounded-[2rem] border border-[#d5e7ee] bg-white p-7 shadow-xl shadow-[#bfe7ee]/50 sm:p-9"><div className="mb-7"><div className="mb-4 grid size-12 place-items-center overflow-hidden rounded-2xl bg-[#174783] shadow-lg shadow-[#bfe7ee]"><img src="/manus-storage/createflow-logo-final_cc4280c8.png" alt="CreateFlow creativity logo" className="size-full object-cover" /></div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#2369b7]">Welcome back</p><h2 className="mt-2 text-2xl font-black text-[#123765]">Log in to CreateFlow.</h2><p className="mt-2 text-sm leading-6 text-[#66849a]">Use the email and password connected to your account.</p></div><form onSubmit={submit} className="space-y-4"><label className="block space-y-2"><span className="text-sm font-semibold text-[#31516c]">Email address</span><span className="relative block"><Mail className="absolute left-3 top-3.5 text-[#89a4b5]" size={17} /><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="h-11 w-full rounded-xl border border-[#d5e7ee] bg-white pl-10 pr-3.5 text-sm outline-none transition placeholder:text-[#89a4b5] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></span></label><label className="block space-y-2"><span className="text-sm font-semibold text-[#31516c]">Password</span><span className="relative block"><LockKeyhole className="absolute left-3 top-3.5 text-[#89a4b5]" size={17} /><input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 w-full rounded-xl border border-[#d5e7ee] bg-white pl-10 pr-11 text-sm outline-none transition placeholder:text-[#89a4b5] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-3 text-[#66849a]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{login.error && <p role="alert" className="rounded-xl bg-[#fff0f0] px-3 py-2 text-sm font-medium text-[#b42318]">{login.error.message}</p>}<button disabled={login.isPending} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#123765] text-sm font-bold text-white shadow-lg shadow-[#bfe7ee] transition hover:bg-[#174783] disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole size={17} /> {login.isPending ? "Logging in…" : "Log in with password"} <ArrowRight size={17} /></button></form><p className="mt-4 text-center text-xs leading-5 text-[#89a4b5]">Passwords are transmitted over the secure app connection and stored only as a one-way hash.</p><div className="my-7 flex items-center gap-3 text-xs font-semibold text-[#b3c4ce]"><span className="h-px flex-1 bg-[#e4eff3]" />or<span className="h-px flex-1 bg-[#e4eff3]" /></div><Link href="/" className="flex h-11 w-full items-center justify-center rounded-xl border border-[#d5e7ee] text-sm font-bold text-[#2369b7] hover:bg-[#f1f8fa]">Continue without logging in</Link><p className="mt-5 text-center text-sm text-[#66849a]">Need an account? <Link href="/signup" className="font-bold text-[#2369b7] hover:text-[#174783]">Create one with a password</Link></p></section></div></main>;
}
