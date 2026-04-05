import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

/**
 * DashboardRedirect acts as a "traffic controller" after login.
 * It identifies the user's role and pushes them to the correct dashboard.
 */
export function DashboardRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // 🛡️ Hierarchy of Truth: 
      // 1. JWT publicMetadata.role (Stateless & Safe)
      // 2. unsafeMetadata.role (Legacy/Frontend-set)
      // 3. Fallback to /tenant (Default)
      
      const publicRole = (user.publicMetadata as any)?.role;
      const unsafeRole = (user.unsafeMetadata as any)?.role;
      const role = publicRole || unsafeRole || "tenant";
      
      console.log(`🚀 [REDIRECTOR] Routing user [${user.id}] as [${role}] (P: ${publicRole}, U: ${unsafeRole})`);
      navigate(`/${role}`, { replace: true });
    } else if (isLoaded && !isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-700">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" strokeWidth={3} />
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Synchronizing Session</p>
        <p className="text-slate-400 text-xs font-bold mt-1">Preparing your dashboard...</p>
      </div>
    </div>
  );
}
