import { Target, Users, ShieldCheck, Zap, Heart, Globe, Sparkles, TrendingUp } from "lucide-react";

export function AboutPage() {
  const stats = [
    { label: "Active Students", value: "10K+", icon: Users, color: "text-primary-600" },
    { label: "Verified Listings", value: "5K+", icon: ShieldCheck, color: "text-emerald-600" },
    { label: "Daily Handshakes", value: "200+", icon: Zap, color: "text-amber-500" },
    { label: "Happy Owners", value: "2K+", icon: Heart, color: "text-rose-500" },
  ];

  const values = [
    {
      title: "Direct Access",
      tag: "Direct",
      description: "We eliminate the middleman, connecting students directly with property owners for total transparency.",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      glow: "bg-blue-500/10"
    },
    {
      title: "Verified Trust",
      tag: "Secure",
      description: "Every property and user goes through a rigorous verification process to ensure supreme platform safety.",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      glow: "bg-indigo-500/10"
    },
    {
      title: "Student Focused",
      tag: "Mission-Driven",
      description: "Designed from the ground up to solve the unique housing challenges faced by students in major cities.",
      icon: Target,
      color: "text-primary-600",
      bg: "bg-primary-50",
      glow: "bg-primary-500/10"
    }
  ];

  return (
    <div className="pt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative overflow-hidden">
      {/* Background Hero Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] max-w-[1400px] aspect-square bg-primary-500/5 blur-[160px] rounded-full -z-10 animate-pulse duration-[10s]" />

      {/* Hero Section - Editorial Weight */}
      <div className="text-center mb-10 md:mb-16 max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-full shadow-xl shadow-primary-500/5 mb-8">
            <Sparkles size={14} className="text-primary-500 fill-primary-500/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Our Story</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95]">
          Revolutionizing <span className="text-primary-600">Student Living</span> <br className="hidden md:block" />
          One Room at a Time.
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed px-4">
          ApnaPG is India's most trusted broker-free platform, bridging the gap between quality accommodation and the students who need it.
        </p>
      </div>

      {/* Stats Grid - High-Impact Dashboard Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24 md:mb-32">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-3xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 text-center group ring-1 ring-zinc-200/20">
            <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/40`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* The Journey Section - Narrative Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 md:mb-32">
        <div className="space-y-8 bg-slate-900 p-10 md:p-16 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
             {/* Accent Glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl" />
             
             <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6">
                <TrendingUp size={28} />
             </div>
             
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
                The ApnaPG <br /> <span className="text-primary-400">Journey.</span>
             </h2>
             
             <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Founded with a singular vision, ApnaPG was born out of the frustration of thousands of students facing predatory brokerage and unverified property listings.
             </p>
        </div>
        
        <div className="space-y-8 px-4">
             <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                       <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-150 transition-transform" />
                       <p className="text-slate-900 font-bold text-lg tracking-tight">Started in Tier-1 Hubs (Delhi, Mumbai)</p>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed pl-6">
                       We began our mission where the problem was most acute, building a network of verified owners in India's leading education hubs.
                  </p>
             </div>
             
             <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                       <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-150 transition-transform" />
                       <p className="text-slate-900 font-bold text-lg tracking-tight">Zero-Brokerage Guarantee</p>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed pl-6">
                       Our platform strictly excludes middlemen, ensuring that every handshake is direct, transparent, and legally sound.
                  </p>
             </div>
        </div>
      </div>

      {/* Values Section - High-Fidelity Feature Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto mb-24 md:mb-32">
        {values.map((value, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden p-10 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-500 ring-1 ring-zinc-200/20"
          >
            {/* Hover-Reveal Accent Glow */}
            <div className={`absolute -top-16 -right-16 w-48 h-48 ${value.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-white/40`}>
              <value.icon className={value.color} size={28} />
            </div>
            
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${value.color} mb-3 block`}>
              {value.tag}
            </span>
            
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
              {value.title}
            </h3>
            
            <p className="text-slate-500 text-base font-medium leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mission Statement - Brand Authority Closing */}
      <div className="max-w-5xl mx-auto text-center space-y-8 pt-20 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            Official Mission
        </div>
        <p className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-[1] max-w-4xl mx-auto">
          "To empower every student in India with safe, affordable, and <span className="text-primary-600 underline decoration-primary-200 underline-offset-8">broker-free</span> housing, enabling them to focus entirely on their dreams and education."
        </p>
        <div className="flex items-center justify-center gap-6 text-slate-300 pt-6 pb-4">
             <div className="h-px w-14 bg-slate-100" />
             <span className="font-black text-[11px] uppercase tracking-[0.5em] text-slate-400">Team ApnaPG</span>
             <div className="h-px w-14 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
