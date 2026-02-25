import { useState } from "react";
import { Search, TrendingUp, Hash } from "lucide-react";
import { motion } from "motion/react";

interface DiscoverScreenProps {
  onBack: () => void;
}

const trendingTopics = [
  { tag: "春の風", count: 342 },
  { tag: "放課後", count: 287 },
  { tag: "夕暮れ", count: 256 },
  { tag: "雨の日", count: 198 },
  { tag: "通学路", count: 176 },
  { tag: "夏休み", count: 154 },
];

const featuredHaikus = [
  {
    id: "d1",
    image:
      "https://images.unsplash.com/photo-1771330021649-3104f04934f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbiUyMHN0YXRpb24lMjBwbGF0Zm9ybSUyMG5vc3RhbGdpY3xlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["ホームにて", "来ない電車を", "待つ二月"],
    author: "あおい",
    likes: 89,
  },
  {
    id: "d2",
    image:
      "https://images.unsplash.com/photo-1761191615719-7e1ccb297bf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc3MjAwNDk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["提灯の", "あかりに揺れる", "きみの横顔"],
    author: "りく",
    likes: 134,
  },
  {
    id: "d3",
    image:
      "https://images.unsplash.com/photo-1636976349626-ea37b23805a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWluJTIwd2luZG93JTIwdXJiYW4lMjBtZWxhbmNob2x5fGVufDF8fHx8MTc3MjAwNDk4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["窓ガラス", "伝う雫に", "指を添え"],
    author: "はるか",
    likes: 201,
  },
  {
    id: "d4",
    image:
      "https://images.unsplash.com/photo-1709435842605-72b57594f0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nJTIwcGV0YWxzfGVufDF8fHx8MTc3MjAwNDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["花びらが", "教科書のうえ", "春の授業"],
    author: "みさき",
    likes: 167,
  },
];

export function DiscoverScreen({ onBack }: DiscoverScreenProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="俳句やユーザーを探す"
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: "0.85rem",
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Trending topics */}
        <div className="px-5 pt-3 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-gray-600" />
            <span
              className="text-gray-700"
              style={{
                fontFamily: "'Zen Maru Gothic', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              いま話題のことば
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic, i) => (
              <motion.button
                key={topic.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <Hash size={12} className="text-gray-400" />
                <span
                  className="text-gray-700"
                  style={{
                    fontFamily: "'Zen Maru Gothic', sans-serif",
                    fontSize: "0.75rem",
                  }}
                >
                  {topic.tag}
                </span>
                <span
                  className="text-gray-300"
                  style={{ fontSize: "0.6rem" }}
                >
                  {topic.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Featured haiku grid */}
        <div className="px-5 pb-3">
          <span
            className="text-gray-700"
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            おすすめの一句
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-24">
          {featuredHaikus.map((haiku, i) => (
            <motion.div
              key={haiku.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-xl shadow-sm ${
                i % 3 === 0 ? "row-span-2" : ""
              }`}
              style={{
                aspectRatio: i % 3 === 0 ? "2/3" : "1/1",
              }}
            >
              <img
                src={haiku.image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontFamily: "'Klee One', cursive",
                }}
              >
                <div className="flex flex-row-reverse items-start" style={{ gap: "0.3em" }}>
                  {haiku.haiku.map((line, j) => (
                    <span
                      key={j}
                      className="text-white"
                      style={{
                        writingMode: "vertical-rl",
                        whiteSpace: "nowrap",
                        fontSize: i % 3 === 0 ? "0.85rem" : "0.65rem",
                        letterSpacing: "0.25em",
                        marginTop: `${j * (i % 3 === 0 ? 0.8 : 0.5)}em`,
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2.5">
                <span
                  className="text-white/80"
                  style={{
                    fontFamily: "'Zen Maru Gothic', sans-serif",
                    fontSize: "0.6rem",
                  }}
                >
                  {haiku.author}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}