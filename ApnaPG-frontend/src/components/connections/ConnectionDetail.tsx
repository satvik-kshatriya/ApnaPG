import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Phone, Mail, FileText, Loader2, Star } from "lucide-react";
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

  const nameToShow = role === "owner" ? connection.tenant_name : connection.owner_name;
  const emailToShow = role === "owner" ? connection.tenant_email : "Email masked initially"; 
  const phoneToShow = role === "owner" ? connection.tenant_phone : connection.owner_phone;
  const targetUserId = role === "owner" ? connection.tenant_id : connection.owner_id;

  // Check if current user already left a review on this exact connection
  const { data: targetReviewsData } = useQuery({
    queryKey: ["user_reviews", targetUserId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${targetUserId}`);
      return res.data;
    },
    enabled: !!targetUserId && (connection.status === "active_tenancy" || connection.status === "ended")
  });

  const myReview = targetReviewsData?.reviews?.find(
    (r: any) => r.connection_id === connection.id
  );

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      setIsDownloading(true);
      setErrorMsg("");
      const response = await api.get(`/api/documents/lease/${connection.id}`, { responseType: "blob" });
      return response.data;
    },
    onSuccess: (blobData) => {
      const url = window.URL.createObjectURL(new Blob([blobData], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Lease_Agreement_${connection.id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) link.parentNode.removeChild(link);
      setIsDownloading(false);
    },
    onError: () => {
      setErrorMsg("Failed to generate digital lease. Ensure connection is active.");
      setIsDownloading(false);
    }
  });

  if (connection.status === "pending") {
    return (
      <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-center justify-between border border-blue-200 mt-4">
        <span className="font-semibold text-sm">Status: Pending Verification</span>
        <span className="text-xs italic opacity-80">Waiting for owner response...</span>
      </div>
    );
  }

  if (connection.status === "rejected") {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200 mt-4">
        <span className="font-semibold text-sm">Status: Rejected</span>
      </div>
    );
  }

  const isPdfAvailable = connection.status === "accepted" || connection.status === "active_tenancy" || connection.status === "ended";
  const isReviewEligible = connection.status === "active_tenancy" || connection.status === "ended";

  return (
    <div className="bg-white border-2 border-primary-100 rounded-xl p-6 shadow-sm mt-4">
      <div className="mb-4 pb-4 border-b border-gray-100 flex items-center justify-between">
         <h4 className="text-lg font-bold text-gray-900 border-l-4 border-primary-500 pl-3">
           Connection Secured: {nameToShow}
         </h4>
         <div className="bg-green-100 text-green-800 text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wide">
           {connection.status.replace("_", " ")}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-full text-primary-600">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone Number</p>
            <p className="font-semibold text-gray-900">{phoneToShow || "Not Provided"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-full text-primary-600">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Address</p>
            <p className="font-semibold text-gray-900 truncate">{emailToShow}</p>
          </div>
        </div>
      </div>

      {errorMsg && <p className="text-red-500 text-xs mb-3">{errorMsg}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        {isPdfAvailable && (
          <button
            onClick={() => downloadPdfMutation.mutate()}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-wait shadow-sm hover:shadow"
          >
            {isDownloading ? <><Loader2 size={18} className="animate-spin" /> Generating PDF...</> : <><FileText size={18} /> Digital Lease <Download size={14} className="opacity-70" /></>}
          </button>
        )}

        {isReviewEligible && !myReview && !showReviewForm && (
          <button 
            onClick={() => setShowReviewForm(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition shadow-sm"
          >
            <Star size={18} className="fill-yellow-400 text-yellow-400" /> Leave a Review
          </button>
        )}
      </div>

      {isReviewEligible && showReviewForm && !myReview && (
        <ReviewForm connectionId={connection.id} targetUserId={targetUserId} />
      )}

      {myReview && (
        <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
           <div className="flex justify-between items-center mb-2">
             <span className="font-bold text-gray-900 flex items-center gap-1.5"><Star size={14} className="fill-yellow-400 text-yellow-400" /> Your Review ({myReview.rating}/5)</span>
             <span className="text-xs text-gray-400">{new Date(myReview.created_at).toLocaleDateString()}</span>
           </div>
           {myReview.review_text && <p className="text-sm text-gray-600 italic">"{myReview.review_text}"</p>}
        </div>
      )}

    </div>
  );
}
