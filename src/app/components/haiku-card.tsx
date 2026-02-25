import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { motion } from "motion/react";

interface HaikuCardProps {
  id: string;
  imageUrl: string;
  haiku: string[];
  author: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  timestamp: string;
  textPosition?: "left" | "right" | "center";
}

export function HaikuCard({
  imageUrl,
  haiku,
  author,
  authorAvatar,
  likes: initialLikes,
  comments,
  timestamp,
  textPosition = "right",
}: HaikuCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const positionClass =
    textPosition === "left"
      ? "items-start pl-8"
      : textPosition === "right"
      ? "items-end pr-8"
      : "items-center";

  // Stagger offset for each line: 0, 1em, 2em drop
  const lineOffsets = [0, 1.2, 2.4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ aspectRatio: "1/1" }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />

      {/* Vertical Haiku Text - right to left, staggered drop */}
      <div
        className={`absolute inset-0 flex flex-col justify-center ${positionClass} z-10`}
      >
        <div
          className="flex flex-row-reverse items-start"
          style={{
            fontFamily: "'Klee One', cursive",
            color: "white",
            gap: "0.5em",
          }}
        >
          {haiku.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
              style={{
                writingMode: "vertical-rl",
                whiteSpace: "nowrap",
                fontSize: "1.5rem",
                letterSpacing: "0.3em",
                marginTop: `${lineOffsets[i]}em`,
              }}
            >
              {line}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex items-end justify-between">
          {/* Author info */}
          <div className="flex items-center gap-2.5">
              {authorAvatar.startsWith('http') ? (
                <img
                  src={authorAvatar}
                  alt={author}
                  className="w-9 h-9 rounded-full border-2 border-white/40 object-cover"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center shrink-0"
                  style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.85rem', color: 'white' }}
                >
                  {authorAvatar}
                </div>
              )}
            <div>
              <p
                className="text-white/90"
                style={{
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  fontSize: "0.8rem",
                }}
              >
                {author}
              </p>
              <p className="text-white/50" style={{ fontSize: "0.65rem" }}>
                {timestamp}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-0.5"
            >
              <Heart
                size={22}
                className={`transition-all duration-200 ${
                  liked
                    ? "fill-rose-400 text-rose-400 scale-110"
                    : "text-white/80"
                }`}
              />
              <span
                className="text-white/70"
                style={{ fontSize: "0.6rem" }}
              >
                {likes}
              </span>
            </button>
            <button className="flex flex-col items-center gap-0.5">
              <MessageCircle size={20} className="text-white/80" />
              <span
                className="text-white/70"
                style={{ fontSize: "0.6rem" }}
              >
                {comments}
              </span>
            </button>
            <button>
              <Share2 size={19} className="text-white/80" />
            </button>
            <button onClick={() => setSaved(!saved)}>
              <Bookmark
                size={20}
                className={`transition-all duration-200 ${
                  saved ? "fill-white text-white" : "text-white/80"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}