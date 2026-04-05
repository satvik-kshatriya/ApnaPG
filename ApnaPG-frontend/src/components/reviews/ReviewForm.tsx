import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, Heart } from "lucide-react";
import { api } from "../../lib/api";

type ReviewFormProps = {
  connectionId: string;
  targetUserId: string;
};

export function ReviewForm({ connectionId, targetUserId }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/reviews", {
        connection_id: connectionId,
        target_user_id: targetUserId,
        rating,
        review_text: reviewText.trim()
      });
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMsg("");
      // Force refresh the target's reviews immediately
      queryClient.invalidateQueries({ queryKey: ["user_reviews", targetUserId] });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to submit review. You may have already reviewed this tenancy.");
    }
  });

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <div className="bg-white p-4 rounded-3xl mb-6 text-emerald-500 shadow-xl shadow-emerald-200/50">
          <Heart size={40} className="fill-emerald-500" />
        </div>
        <h4 className="font-black text-emerald-900 text-xl mb-2 tracking-tight">Community Trust Earned!</h4>
        <p className="text-emerald-700/70 text-sm font-medium max-w-[280px] leading-relaxed">
          Your honest feedback helps maintain the high standards of the ApnaPG marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 rounded-[2.5rem] p-10 border border-zinc-100 mt-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
         <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
            <Star className="text-zinc-400" size={18} />
         </div>
         <h4 className="font-black text-zinc-900 text-lg tracking-tight">Build Trust</h4>
      </div>
      <p className="text-zinc-400 text-sm font-medium mb-8">Honest community reviews help verified students and owners find better stays.</p>
      
      {/* Star Selector Refined */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((starObj) => (
          <button
            key={starObj}
            type="button"
            className="focus:outline-none transition-all hover:scale-125 active:scale-90"
            onMouseEnter={() => setHoveredRating(starObj)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(starObj)}
          >
            <Star 
              size={40} 
              className={`transition-all duration-300 drop-shadow-sm ${
                starObj <= (hoveredRating || rating) 
                  ? "fill-amber-400 text-amber-400 scale-110" 
                  : "text-zinc-300"
              }`} 
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 flex items-center text-xs font-black uppercase tracking-widest text-zinc-400 animate-in fade-in slide-in-from-left-2 transition-all">
             {rating}/5 Stars
          </span>
        )}
      </div>

      <textarea
        className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 mb-6 min-h-[140px] resize-none placeholder:text-zinc-300 transition-all shadow-sm"
        placeholder="How was the tenancy experience? (Communication, hygiene, rules...)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      ></textarea>

      {errorMsg && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-6 bg-red-50 p-4 rounded-2xl border border-red-100">
           <Loader2 size={14} className="opacity-50" />
           {errorMsg}
        </div>
      )}

      <button
        onClick={() => reviewMutation.mutate()}
        disabled={rating === 0 || reviewMutation.isPending}
        className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-zinc-900/10"
      >
        {reviewMutation.isPending ? <><Loader2 size={18} className="animate-spin" /> Publishing Review...</> : "Publish to Community"}
      </button>
    </div>
  );
}
