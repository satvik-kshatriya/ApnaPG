import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, MapPin, IndianRupee, Users, ShieldCheck, Info, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { StarRatingDisplay } from "../reviews/StarRatingDisplay";
import { useHandshake } from "../../hooks/useHandshake";

interface PropertyDetailModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    property?.images?.[0]?.url || ""
  );

  // Sync selectedImage when property changes (avoids stale state from previous modal open)
  useEffect(() => {
    if (property?.images?.length > 0) {
      setSelectedImage(property.images[0].url);
    }
  }, [property]);

  const handshake = useHandshake(property?._id);

  // Trust Engine: Fetch Landlord Rating
  const { data: ownerRatingData } = useQuery({
    queryKey: ["user_reviews", property?.owner_id],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${property.owner_id}`);
      return res.data;
    },
    enabled: !!property?.owner_id && isOpen
  });

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300">
      {/* Premium Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
        
        {/* Sticky Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-white/80 backdrop-blur-md hover:bg-white rounded-full shadow-lg text-zinc-500 hover:text-zinc-900 transition-all active:scale-90 border border-zinc-100"
        >
          <X size={20} />
        </button>

        {/* Left: Image Gallery (60% Desktop) */}
        <div className="w-full md:w-3/5 bg-zinc-50 flex flex-col border-r border-zinc-100">
          <div className="relative flex-grow min-h-[350px] md:min-h-0 overflow-hidden bg-zinc-200">
             {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">No images available</div>
             )}
             
             {property.is_verified_owner && (
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-100/50 flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-widest shadow-lg">
                  <ShieldCheck size={16} className="text-indigo-600" /> Verified Owner
                </div>
             )}
          </div>

          {/* Premium Thumbnail Strip */}
          <div className="p-4 flex gap-4 overflow-x-auto hide-scrollbar bg-white shadow-[0_-1px_0_0_rgba(0,0,0,0.02)]">
            {property.images?.map((img: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className={`flex-none w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ring-offset-2 ${selectedImage === img.url ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md translate-y-[-2px]' : 'border-transparent grayscale hover:grayscale-0 opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info Area (40% Desktop) */}
        <div className="w-full md:w-2/5 flex flex-col h-full bg-white relative">
          <div className="p-8 md:p-10 overflow-y-auto flex-grow space-y-8 custom-scrollbar">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-3">
                {property.title}
              </h2>
              <div className="flex items-center text-zinc-500 text-sm font-medium">
                <MapPin size={18} className="mr-2 text-indigo-600 opacity-70" />
                {property.locality}
              </div>
            </div>

            {/* Pricing Section - High End Style */}
            <div className="bg-zinc-50/80 rounded-2xl p-6 border border-zinc-100 grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1 block">Monthly Rent</span>
                <div className="text-2xl font-black text-zinc-900 flex items-center">
                  <IndianRupee size={22} className="mr-0.5 text-indigo-600" />
                  {property.monthly_rent?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="border-l border-zinc-200 pl-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1 block">Occupancy</span>
                <div className="text-lg font-bold text-zinc-700 flex items-center gap-2 capitalize">
                  <span className="p-1 bg-white rounded-lg shadow-sm border border-zinc-100"><Users size={16} className="text-indigo-500" /></span>
                  {property.occupancy_type}
                </div>
              </div>
            </div>

            {/* Trust Engine Integration */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Landlord Trust Score</h4>
                 <div className="group relative">
                   <Info size={14} className="text-zinc-300 cursor-help transition-colors hover:text-indigo-400" />
                   <div className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-zinc-900 text-white text-[11px] font-medium rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 pointer-events-none z-30">
                     Verified reviews from previous tenants on ApnaPG Trust Engine.
                   </div>
                 </div>
               </div>
               <div className="flex items-center h-10 px-4 bg-zinc-50/50 border border-zinc-100 rounded-xl">
                 {ownerRatingData ? (
                    <StarRatingDisplay 
                      rating={ownerRatingData.average_rating} 
                      count={ownerRatingData.total_reviews} 
                      size={18} 
                    />
                 ) : (
                    <div className="animate-pulse flex gap-1.5 Items-center">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 bg-zinc-200 rounded-full" />)}
                    </div>
                 )}
               </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">About Property</h4>
              <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* House Rules Refined */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">House Rules</h4>
              <div className="flex flex-wrap gap-2.5">
                 {property.house_rules && Object.entries(property.house_rules).length > 0 ? (
                    Object.entries(property.house_rules).map(([key, value]) => (
                      <div key={key} className="bg-white border border-zinc-200 text-zinc-700 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:border-indigo-200 transition-colors">
                        <span className="text-zinc-400 font-bold uppercase text-[9px] mr-1">{key.replace(/_/g, ' ')}:</span> {String(value)}
                      </div>
                    ))
                 ) : (
                    <span className="text-sm text-zinc-400 italic font-medium">Standard community rules apply.</span>
                 )}
              </div>
            </div>
          </div>

          {/* Persistent Premium CTA Footer */}
          <div className="p-8 border-t border-zinc-100 bg-white/80 backdrop-blur-md">
             <button 
                disabled={handshake.isPending || handshake.isSuccess}
                onClick={() => handshake.mutate()}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95
                  ${handshake.isSuccess
                    ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 ring-4 ring-transparent hover:ring-indigo-100"
                  }
                `}
             >
                {handshake.isPending ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : handshake.isSuccess ? (
                  "Handshake Sent"
                ) : (
                  "Request Connection"
                )}
             </button>
             <p className="text-[10px] text-zinc-400 font-bold text-center mt-4 px-6 uppercase tracking-wider leading-relaxed">
                Connect Directly · Skip The Broker · No Fees
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
