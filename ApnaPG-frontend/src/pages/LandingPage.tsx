import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, Heart, ArrowRight, Sparkles, Building, Users } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export function LandingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = (user.publicMetadata as any)?.role || (user.unsafeMetadata as any)?.role || "tenant";
      if (role === "owner") {
        navigate("/owner");
      } else {
        navigate("/tenant");
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!isLoaded) return null;

  const features = [
    {
      icon: ShieldCheck,
      title: "Universal Trust",
      tag: "Verified",
      description: "Every property and owner goes through a multi-step verification process.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      glow: "bg-emerald-500/10"
    },
    {
      icon: Zap,
      title: "Broker-Free",
      tag: "Direct",
      description: "Direct connections between students and owners. No middlemen, no hidden fees.",
      color: "text-primary-600",
      bg: "bg-primary-50",
      glow: "bg-primary-500/10"
    },
    {
      icon: Heart,
      title: "Verified Reviews",
      tag: "Transparent",
      description: "Transparent feedback from actual residents to help you choose with confidence.",
      color: "text-rose-600",
      bg: "bg-rose-50",
      glow: "bg-rose-500/10"
    }
  ];

  return (
    <div className="flex flex-col items-center pt-6 pb-12 px-4 md:pt-10 md:pb-24 relative overflow-hidden min-h-screen">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] max-w-[1400px] aspect-square bg-primary-500/5 blur-[160px] rounded-full -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] aspect-square bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      {/* Trust Pill */}
      <div className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-full shadow-xl shadow-primary-500/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Sparkles size={14} className="text-primary-500 fill-primary-500/20" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">India's #1 Broker-Free Hub</span>
      </div>

      {/* Hero Section - Editorial Weight */}
      <div className="text-center mb-8 md:mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] max-w-5xl mx-auto">
          Find Your Perfect PG <br className="hidden md:block" />
          <span className="text-primary-600">Minus the Broker.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
          The most trusted ecosystem bridging verified property owners and student tenants with complete transparency.
        </p>
      </div>

      {/* Portal Path Selection - Max-w Grid Alignment */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 mb-24 md:mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        {/* Tenant Portal */}
        <Link
          to="/sign-up?role=tenant"
          className="group relative flex flex-col items-start p-10 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-500"
        >
          {/* Accent Mesh */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-500">
            <Users size={32} />
          </div>

          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">I'm a Student</h2>
          <p className="text-slate-400 text-base font-medium mb-12">
            Browse verified listings, read reviews, and handshake directly with owners.
          </p>

          <div className="flex items-center gap-3 text-white">
            <span className="text-xs font-black uppercase tracking-[0.2em]">Start Exploring</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </div>

          <div className="absolute bottom-6 right-10 text-[60px] font-black text-white/5 select-none pointer-events-none">TENANT</div>
        </Link>

        {/* Owner Portal */}
        <Link
          to="/sign-up?role=owner"
          className="group relative flex flex-col items-start p-10 bg-white border border-zinc-200 rounded-[3rem] shadow-xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-500"
        >
          {/* Accent Mesh */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl" />

          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
            <Building size={32} />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter leading-none">I'm an Owner</h2>
          <p className="text-slate-500 text-base font-medium mb-12">
            List your vacancy, vet applicants, and manage your property securely.
          </p>

          <div className="flex items-center gap-3 text-primary-600 group-hover:text-slate-900 transition-colors">
            <span className="text-xs font-black uppercase tracking-[0.2em]">List Property</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </div>

          <div className="absolute bottom-6 right-10 text-[60px] font-black text-slate-900/5 select-none pointer-events-none">OWNER</div>
        </Link>
      </div>

      {/* Pillars Section - High-Fidelity Feature Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden p-8 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-500 ring-1 ring-zinc-200/20"
          >
            {/* Hover-Reveal Accent Glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 ${feature.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-white/40`}>
              <feature.icon className={feature.color} size={28} />
            </div>
            
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${feature.color} mb-3 block`}>
              {feature.tag}
            </span>
            
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
              {feature.title}
            </h3>
            
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mission Statement - Brand Authority Hook */}
      <div className="max-w-4xl mx-auto text-center space-y-6 pt-16 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            Official Mission
        </div>
        <p className="text-xl md:text-4xl font-black tracking-tighter text-slate-900 leading-[1.1]">
          "To empower every student in India with safe, affordable, and <span className="text-primary-600 underline decoration-primary-200 underline-offset-8">broker-free</span> housing, enabling them to focus entirely on their dreams and education."
        </p>
        <div className="flex items-center justify-center gap-4 text-slate-300 pt-2 pb-12">
             <div className="h-px w-10 bg-slate-100" />
             <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400">Team ApnaPG</span>
             <div className="h-px w-10 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
