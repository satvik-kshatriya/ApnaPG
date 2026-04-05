import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";

export const useHandshake = (propertyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/connections", { property_id: propertyId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_connections"] });
      toast.success("Handshake sent! Connection request is pending.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Action failed.";
      toast.error(typeof msg === 'string' ? msg : "You already have an active request for this property.");
    }
  });
};
