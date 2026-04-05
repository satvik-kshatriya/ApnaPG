import { Link, NavLink, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Inbox, Home, PlusCircle, Search, Info } from "lucide-react";

export function Navbar() {
  const { pathname } = useLocation();
  const isTenant = pathname.startsWith("/tenant");
  const isOwner = pathname.startsWith("/owner");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
      ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100/50"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 flex flex-col items-center gap-1 py-3 transition-all ${isActive ? "text-primary-600" : "text-slate-600"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl shadow-md">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side: Logo */}
            <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
              <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                Apna<span className="text-primary-600 transition-colors group-hover:text-primary-500">PG</span>
              </span>
            </Link>

            {/* Center Section: Navigation Actions (Desktop Only) */}
            <div className="hidden md:flex items-center bg-slate-50/50 p-1 rounded-2xl border border-slate-100 shadow-inner">
              {isTenant && (
                <>
                  <NavLink to="/tenant/explore" className={linkClass}>
                    <Search size={14} /> Explore
                  </NavLink>
                  <NavLink to="/tenant/handshakes" className={linkClass}>
                    <Inbox size={14} /> Handshakes
                  </NavLink>
                  <NavLink to="/tenant/about" className={linkClass}>
                    <Info size={14} /> About
                  </NavLink>
                </>
              )}
              {isOwner && (
                <>
                  <NavLink to="/owner/properties" className={linkClass}>
                    <Home size={14} /> My Properties
                  </NavLink>
                  <NavLink to="/owner/requests" className={linkClass}>
                    <Inbox size={14} /> Requests
                  </NavLink>
                  <NavLink to="/owner/create" className={linkClass}>
                    <PlusCircle size={14} /> Create
                  </NavLink>
                  <NavLink to="/owner/about" className={linkClass}>
                    <Info size={14} /> About
                  </NavLink>
                </>
              )}
            </div>

            {/* Right Side: Auth controls */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-all bg-slate-100 hover:bg-slate-200 py-3 px-6 rounded-2xl active:scale-95 border border-slate-200/50"
                >
                  Sign In
                </Link>
              </SignedOut>

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 border-2 border-primary-50 hover:border-primary-500 transition-colors shadow-sm",
                      userButtonTrigger: "focus:outline-none focus:ring-4 focus:ring-primary-50 rounded-full"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Visible only on small screens for Dashboard users) */}
      {(isTenant || isOwner) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-100 pb-safe shadow-2xl animate-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-around">
            {isTenant && (
              <>
                <NavLink to="/tenant/explore" className={mobileLinkClass}>
                  <Search size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
                </NavLink>
                <NavLink to="/tenant/handshakes" className={mobileLinkClass}>
                  <Inbox size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
                </NavLink>
                <NavLink to="/tenant/about" className={mobileLinkClass}>
                  <Info size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">About</span>
                </NavLink>
              </>
            )}
            {isOwner && (
              <>
                <NavLink to="/owner/properties" className={mobileLinkClass}>
                  <Home size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Listings</span>
                </NavLink>
                <NavLink to="/owner/requests" className={mobileLinkClass}>
                  <Inbox size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Requests</span>
                </NavLink>
                <NavLink to="/owner/create" className={mobileLinkClass}>
                  <PlusCircle size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">New</span>
                </NavLink>
                <NavLink to="/owner/about" className={mobileLinkClass}>
                  <Info size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">About</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
