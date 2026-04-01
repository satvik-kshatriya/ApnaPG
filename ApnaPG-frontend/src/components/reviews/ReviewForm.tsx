import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex flex-col items-center justify-center text-center">
        <div className="bg-green-100 p-2 rounded-full mb-3 text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h4 className="font-bold text-green-900 mb-1">Review Submitted!</h4>
        <p className="text-green-700 text-sm">Thank you for helping keep the ApnaPG community trustworthy.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm mt-4">
      <h4 className="font-bold text-gray-900 mb-2">Leave a Trust Review</h4>
      <p className="text-gray-500 text-sm mb-4">Rate your experience. Honest reviews help future students and verified owners.</p>
      
      {/* Star Selector */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((starObj) => (
          <button
            key={starObj}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            onMouseEnter={() => setHoveredRating(starObj)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(starObj)}
          >
            <Star 
              size={32} 
              className={`transition-colors duration-200 ${
                starObj <= (hoveredRating || rating) 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"
              }`} 
            />
          </button>
        ))}
      </div>

      <textarea
        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3 min-h-[100px] resize-none"
        placeholder="Write your honest feedback here (Optional)..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      ></textarea>

      {errorMsg && <p className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded">{errorMsg}</p>}

      <button
        onClick={() => reviewMutation.mutate()}
        disabled={rating === 0 || reviewMutation.isPending}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {reviewMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
      </button>
    </div>
  );
}
