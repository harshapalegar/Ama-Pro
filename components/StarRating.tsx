import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, count, size = 16 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} size={size} fill="#FF9900" stroke="#FF9900" className="mr-0.5" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} size={size} fill="#FF9900" stroke="#FF9900" className="mr-0.5" />);
    } else {
      stars.push(<Star key={i} size={size} stroke="#FF9900" className="mr-0.5 text-gray-300" />);
    }
  }

  return (
    <div className="flex items-center">
      <div className="flex">{stars}</div>
      <span className="ml-1 text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
        {count.toLocaleString()}
      </span>
    </div>
  );
};
