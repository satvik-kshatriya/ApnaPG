import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldCheck, MapPin, IndianRupee, Users, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { StarRatingDisplay } from "../reviews/StarRatingDisplay";

type PropertyCardProps = {
  property: any;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const [hasRequested, setHasRequested] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handshakeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await api.post("/api/connections", { property_id: propertyId });
      return res.data;
    },
    onSuccess: () => {
      setHasRequested(true);
      setErrorMsg("");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "You already have an active request for this property.";
      setErrorMsg(typeof msg === 'string' ? msg : "Action failed.");
      if (err.response?.status === 400) {
        setHasRequested(true); 
      }
    }
  });

  // Trust Engine: Fetch Owner Rating actively
  const { data: ownerRatingData } = useQuery({
    queryKey: ["user_reviews", property.owner_id],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${property.owner_id}`);
      return res.data;
    },
    enabled: !!property.owner_id
  });

  const handleConnect = () => {
    handshakeMutation.mutate(property.id);
  };

  const isVerifiedOwner = property.is_verified_owner ?? true; 

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200">
      
      {/* Cover Photo */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0].image_url} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isVerifiedOwner && (
            <div className="bg-white/90 backdrop-blur text-green-700 font-bold text-xs uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <ShieldCheck size={14} /> Broker-Free Verified
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-primary-600 transition">
            {property.title}
          </h3>
          <div className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap">
            <Users size={12} /> <span className="capitalize">{property.occupancy_type}</span>
          </div>
        </div>
        
        {/* Trust Rating Injected */}
        <div className="mb-3 border-b border-gray-100 pb-3 h-[24px]">
          {ownerRatingData ? (
             <StarRatingDisplay 
               rating={ownerRatingData.average_rating} 
               count={ownerRatingData.total_reviews} 
               size={14} 
             />
          ) : <div className="animate-pulse bg-gray-100 h-4 w-24 rounded"></div>}
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="truncate">{property.locality}</span>
        </div>

        {errorMsg && (
          <div className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Footer Area */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Rent</span>
            <div className="text-xl font-bold flex items-center text-gray-900">
              <IndianRupee size={18} className="mr-0.5" />
              {property.monthly_rent?.toLocaleString('en-IN')}
              <span className="text-sm text-gray-500 font-normal ml-1">/mo</span>
            </div>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={hasRequested || handshakeMutation.isPending}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm
              ${hasRequested 
                ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed" 
                : "bg-gray-900 border border-transparent text-white hover:bg-gray-800 hover:shadow"
              }
            `}
          >
            {handshakeMutation.isPending ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</span>
            ) : hasRequested ? (
              "Request Sent"
            ) : (
              "Request Connection"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
