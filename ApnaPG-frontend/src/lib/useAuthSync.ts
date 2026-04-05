import { useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Custom hook to synchronize the Clerk user to the ApnaPG backend (Mongoose DB).
 * It runs when the user is signed in and visits a protected dashboard route.
 */
export function useAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the landing role context based on the current URL
  const pathRole = location.pathname.includes("/owner") ? "owner" : "tenant";

  const { data: syncedUser } = useQuery({
    queryKey: ["auth_sync", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const payload = {
        clerk_id: user.id,
        role: pathRole, // Initial requested role (only used as fallback for first-time signups)
        full_name: user.fullName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone_number: user.primaryPhoneNumber?.phoneNumber || null,
        profile_image_url: user.imageUrl || null,
      };

      const response = await api.post("/api/users/sync", payload);
      return response.data;
    },
    enabled: isLoaded && isSignedIn && !!user?.id,
    staleTime: Infinity,
  });

  /** 
   * 🛡️ ROLE SECURITY GUARD
   * If the backend sync confirms a role that doesn't match the current URL path,
   * we push them to the correct dashboard path.
   */
  if (syncedUser && syncedUser.role !== pathRole) {
    const targetPath = `/${syncedUser.role}`;
    console.log(`🛡️ [GUARD] Path Role [${pathRole}] Mismatch. Pushing to [${targetPath}]`);
    navigate(targetPath, { replace: true });
  }
}
