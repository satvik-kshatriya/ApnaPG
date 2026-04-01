import { Star, StarHalf } from "lucide-react";

type StarRatingDisplayProps = {
  rating: number | null;
  count: number;
  size?: number;
  showText?: boolean;
};

export function StarRatingDisplay({ rating, count, size = 16, showText = true }: StarRatingDisplayProps) {
  if (rating === null || count === 0) {
    return (
      <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
        <Star size={size} className="text-gray-300" />
        {showText && <span>New to ApnaPG</span>}
      </div>
    );
  }

  // Generate stars dynamically
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
  }

  return (
    <div className="flex items-center gap-1.5 font-medium">
      <div className="flex">{stars}</div>
      {showText && (
        <span className="text-gray-700 text-sm flex items-center">
          {rating.toFixed(1)} <span className="text-gray-400 ml-1 font-normal">({count})</span>
        </span>
      )}
    </div>
  );
}
