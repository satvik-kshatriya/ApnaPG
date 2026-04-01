
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Custom hook to synchronize the Clerk user to the ApnaPG backend (Neon DB).
 * It runs when the user is signed in and visits a protected dashboard route.
 */
export function useAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Determine the role context based on the current URL
  const pathRole = location.pathname.includes("/owner") ? "owner" : "tenant";

  useQuery({
    // Cache key incorporates the user id so it only fires once per active session/user
    queryKey: ["auth_sync", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Persist the role assignment natively into Clerk's metadata payload
      if (user.unsafeMetadata?.role !== pathRole) {
        await user.update({ unsafeMetadata: { ...user.unsafeMetadata, role: pathRole } });
      }

      const payload = {
        clerk_id: user.id,
        role: pathRole,
        full_name: user.fullName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone_number: user.primaryPhoneNumber?.phoneNumber || null,
        profile_image_url: user.imageUrl || null,
      };

      const response = await api.post("/api/users/sync", payload);
      return response.data;
    },
    // Only attempt to sync if Clerk has finished loading and the user is securely signed in
    enabled: isLoaded && isSignedIn && !!user?.id,
    staleTime: Infinity, // Prevent refetching this synchronization hook constantly
  });
}
