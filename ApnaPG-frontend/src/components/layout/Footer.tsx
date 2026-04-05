import { Link } from "react-router-dom";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white/70 backdrop-blur-xl border-t border-slate-100 mt-auto shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 lg:gap-12">

          {/* Brand Section - Span 2 on Mobile */}
          <div className="flex flex-col gap-5 col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                Apna<span className="text-primary-600">PG</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              India's most trusted, broker-free platform for student accommodation and rental property management.
            </p>
            <div className="flex items-center gap-5 text-slate-400">
              <a href="#" className="hover:text-primary-600 transition-all hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22"></path></svg>
              </a>
              <a href="#" className="hover:text-primary-600 transition-all hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="hover:text-primary-600 transition-all hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Tenants Section */}
          <div className="flex flex-col">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px]">Students</h3>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 font-semibold">
              <li><Link to="/tenant/explore" className="hover:text-primary-600 transition-colors">Explore</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">How it works</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">Verified Listings</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">Broker-Free</Link></li>
            </ul>
          </div>

          {/* Owners Section */}
          <div className="flex flex-col">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px]">Owners</h3>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 font-semibold">
              <li><Link to="/owner/create" className="hover:text-primary-600 transition-colors">List Property</Link></li>
              <li><Link to="/owner/properties" className="hover:text-primary-600 transition-colors">Dashboard</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">Security Rules</Link></li>
              <li><Link to="#" className="hover:text-primary-600 transition-colors">Trust Engine</Link></li>
            </ul>
          </div>

          {/* Contact Section - Span 2 on Mobile */}
          <div className="flex flex-col col-span-2 lg:col-span-1 border-t lg:border-none border-slate-100 pt-10 lg:pt-0">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-[0.2em] text-[10px]">Contact</h3>
            <ul className="flex flex-col gap-5 text-sm text-slate-500 font-semibold">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Delhi NCR / Pune<br />India</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-primary-500 flex-shrink-0" />
                <a href="mailto:support@apnapg.com" className="hover:text-primary-600 transition-colors">support@apnapg.com</a>
              </li>
              <li className="flex items-start gap-4 bg-primary-50/50 p-4 rounded-3xl border border-primary-100/50 group/trust">
                <ShieldCheck size={20} className="text-primary-600 flex-shrink-0 group-hover/trust:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-primary-800 uppercase tracking-tight leading-4">Verified Trust<br />Partner Engine</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <p>© {new Date().getFullYear()} ApnaPG Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link to="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-slate-900 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
