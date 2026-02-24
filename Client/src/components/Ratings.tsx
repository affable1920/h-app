import { StarIcon } from "lucide-react";

const attrs = {
  size: 12,
  strokeWidth: 0,
};

const Ratings = ({ rating }: { rating: number }) => {
  return (
    <div className="flex relative p-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i + 1} fill="#111" {...attrs} />
      ))}

      <div className="absolute flex">
        {Array.from({ length: Math.floor(rating) }, (_, i) => (
          <StarIcon {...attrs} key={i + 1} fill="#fbbf24" />
        ))}
      </div>
    </div>
  );
};

export default Ratings;
