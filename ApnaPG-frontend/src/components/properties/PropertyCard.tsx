import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, MapPin, IndianRupee, Users, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { StarRatingDisplay } from "../reviews/StarRatingDisplay";
import { useHandshake } from "../../hooks/useHandshake";

type PropertyCardProps = {
  property: any;
  onSelect?: (property: any) => void;
};

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const handshake = useHandshake(property._id);

  // Trust Engine: Fetch Owner Rating actively
  const { data: ownerRatingData } = useQuery({
    queryKey: ["user_reviews", property.owner_id],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${property.owner_id}`);
      return res.data;
    },
    enabled: !!property.owner_id
  });

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    handshake.mutate();
  };

  const isVerifiedOwner = property.is_verified_owner ?? true;

  return (
    <div
      onClick={() => onSelect?.(property)}
      className={`group flex flex-col bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ring-1 ring-transparent hover:ring-primary-500/10 ${onSelect ? 'cursor-pointer' : ''}`}
    >

      {/* Cover Photo Area with Premium Zoom */}
      <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0].url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            No Image
          </div>
        )}

        {/* Floating Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isVerifiedOwner && (
            <div className="bg-white/95 backdrop-blur-sm text-primary-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 border border-primary-100/50">
              <ShieldCheck size={14} className="text-primary-600" /> Broker-Free
            </div>
          )}
        </div>

        {/* Occupancy Indicator Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 shadow-sm capitalize">
          {property.occupancy_type}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-slate-700 text-sm mb-4">
          <MapPin size={14} className="mr-1.5 flex-shrink-0 opacity-80" />
          <span className="truncate font-medium">{property.locality}</span>
        </div>

        {/* Micro-Interaction Bar: Rating & Details */}
        <div className="flex items-center justify-between py-3 border-y border-slate-100 mb-5">
          <div className="h-6 flex items-center">
            {ownerRatingData ? (
              <StarRatingDisplay
                rating={ownerRatingData.average_rating}
                count={ownerRatingData.total_reviews}
                size={14}
                showText={true}
              />
            ) : <div className="animate-pulse bg-slate-100 h-4 w-24 rounded-full"></div>}
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Users size={12} /> <span className="uppercase tracking-tighter">{property.occupancy_type}</span>
          </div>
        </div>

        {/* Footer Area: Pricing & CTA */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest pl-0.5">Rent</span>
            <div className="text-xl font-extrabold flex items-center text-slate-900 leading-none mt-1">
              <IndianRupee size={20} className="mr-0.5 text-primary-600" />
              {property.monthly_rent?.toLocaleString('en-IN')}
              <span className="text-sm text-slate-500 font-bold ml-1.5">/mo</span>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={handshake.isSuccess || handshake.isPending}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 hover:cursor-pointer
              ${handshake.isSuccess
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                : "bg-primary-600 border border-transparent text-white hover:bg-primary-700 hover:shadow-primary-500/20"
              }
            `}
          >
            {handshake.isPending ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> ...</span>
            ) : handshake.isSuccess ? (
              "Sent"
            ) : (
              "Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
