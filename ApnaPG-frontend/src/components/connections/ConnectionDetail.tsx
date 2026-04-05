import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Phone, Mail, FileText, Loader2, Star, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { ReviewForm } from "../reviews/ReviewForm";

type ConnectionDetailProps = {
  connection: any;
  role: "tenant" | "owner";
};

export function ConnectionDetail({ connection, role }: ConnectionDetailProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const emailToShow = role === "owner" ? connection.tenant_id?.email : connection.property_id?.owner_id?.email || "Email masked initially"; 
  const phoneToShow = role === "owner" ? connection.tenant_id?.phone_number : connection.property_id?.owner_id?.phone_number || "Contact masked initially";
  const targetUserId = role === "owner" ? connection.tenant_id?._id : connection.property_id?.owner_id?._id;

  const { data: reviewsData } = useQuery({
    queryKey: ["user_reviews", targetUserId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${targetUserId}`);
      return res.data;
    },
    enabled: !!targetUserId
  });

  const myReview = reviewsData?.reviews?.find((r: any) => r.connection_id === connection._id);

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      setIsDownloading(true);
      setErrorMsg("");
      try {
        const response = await api.get(`/api/documents/lease/${connection._id}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Lease_Agreement_${connection._id.substring(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err: any) {
        setErrorMsg("Failed to download lease. Please try again.");
        throw err;
      } finally {
        setIsDownloading(false);
      }
    }
  });

  if (connection.status === "pending") {
    return (
      <div className="flex items-center justify-between bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100/50 mt-4 group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100">
             <Loader2 size={14} className="text-indigo-600 animate-spin" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Handshake Verification In Progress</span>
        </div>
        <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Contact details will unlock after approval</p>
      </div>
    );
  }

  if (connection.status === "rejected") {
    return (
      <div className="bg-red-50/50 text-red-500 p-6 rounded-3xl flex items-center gap-3 border border-red-100/50 mt-4 animate-in fade-in duration-500">
        <AlertCircle size={18} className="text-red-400" />
        <span className="font-black text-[10px] uppercase tracking-widest">Handshake Declined</span>
      </div>
    );
  }

  const isPdfAvailable = ["accepted", "active_tenancy", "ended"].includes(connection.status);
  const isReviewEligible = ["active_tenancy", "ended"].includes(connection.status);

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Reveal Section */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 group hover:border-indigo-100 transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mb-0.5">Verified Contact</p>
              <p className="font-black text-zinc-900 text-lg tracking-tight">{phoneToShow || "Not Provided"}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 group hover:border-indigo-100 transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 border border-indigo-100 shadow-sm group-hover:bg-indigo-100 transition-colors">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mb-0.5">Direct Communication</p>
              <p className="font-black text-zinc-900 text-lg tracking-tight truncate max-w-[200px]">{emailToShow}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-50/50 p-4 rounded-[2rem] border border-zinc-100/50">
        {isPdfAvailable && (
          <button
            onClick={() => downloadPdfMutation.mutate()}
            disabled={isDownloading}
            className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait shadow-xl shadow-zinc-900/10"
          >
            {isDownloading ? <><Loader2 size={16} className="animate-spin" /> Finalizing Lease...</> : <><FileText size={16} /> Digital Agreement <Download size={12} className="opacity-60 ml-1" /></>}
          </button>
        )}

        {isReviewEligible && !myReview && !showReviewForm && (
          <button 
            onClick={() => setShowReviewForm(true)}
            className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
          >
            <Star size={16} className="fill-amber-400 text-amber-400" /> Share Feedback
          </button>
        )}
        
        {errorMsg && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-4">{errorMsg}</p>}
      </div>

      {isReviewEligible && showReviewForm && !myReview && (
        <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
           <ReviewForm connectionId={connection._id} targetUserId={targetUserId} />
        </div>
      )}

      {myReview && (
        <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 relative group overflow-hidden">
           {/* Decorative Background Icon */}
           <Star size={64} className="absolute -bottom-4 -right-4 text-zinc-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           
           <div className="flex justify-between items-center mb-4 relative z-10">
             <div className="flex items-center gap-2">
                <span className="font-black text-zinc-900 text-sm tracking-tight flex items-center gap-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" /> 
                  Rating {myReview.rating}/5
                </span>
             </div>
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Review Logged {new Date(myReview.created_at).toLocaleDateString()}
             </span>
           </div>
           {myReview.review_text && (
              <div className="relative z-10">
                <p className="text-zinc-600 text-sm italic font-medium leading-relaxed">"{myReview.review_text}"</p>
              </div>
           )}
        </div>
      )}

    </div>
  );
}
