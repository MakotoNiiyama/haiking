import { useState } from "react";
import { Settings, Grid3X3, Bookmark, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface ProfileScreenProps {
  onBack: () => void;
}

const myHaikus = [
  {
    id: "p1",
    image:
      "https://images.unsplash.com/photo-1669668181755-7c5d19898ff5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBza3klMjBjbG91ZHMlMjBhdG1vc3BoZXJpY3xlbnwxfHx8fDE3NzIwMDQ5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["夕焼けに", "染まる帰り道", "影ふたつ"],
  },
  {
    id: "p2",
    image:
      "https://images.unsplash.com/photo-1568571022375-ad4f3ef34972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwYmx1ZSUyMGNhbG18ZW58MXx8fHwxNzcyMDA0OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["波の音", "イヤホン外して", "きく夏よ"],
  },
  {
    id: "p3",
    image:
      "https://images.unsplash.com/photo-1571068160251-c8333566dad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBsZWF2ZXMlMjBnb2xkZW4lMjBsaWdodHxlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["金色の", "葉っぱの絨毯", "踏む二人"],
  },
  {
    id: "p4",
    image:
      "https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwY29mZmVlJTIwd2luZG93JTIwbGlnaHR8ZW58MXx8fHwxNzcxOTk4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["湯気のぼる", "朝のしずけさ", "猫とわたし"],
  },
];

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [tab, setTab] = useState<"posts" | "saved">("posts");

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span
          style={{
            fontFamily: "'Klee One', cursive",
            fontSize: "1.1rem",
          }}
          className="text-gray-800"
        >
          @haiku_lover
        </span>
        <button className="p-1">
          <Settings size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Profile info */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-violet-200 p-0.5">
            <div className="w-full h-full rounded-full bg-[#fafafa] p-0.5">
              <img
                src="https://images.unsplash.com/photo-1709435842605-72b57594f0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nJTIwcGV0YWxzfGVufDF8fHx8MTc3MjAwNDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex gap-6 justify-center">
              {[
                { count: "24", label: "句" },
                { count: "182", label: "フォロワー" },
                { count: "96", label: "フォロー" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="text-gray-900"
                    style={{
                      fontFamily: "'Zen Maru Gothic', sans-serif",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  >
                    {stat.count}
                  </p>
                  <p
                    className="text-gray-400"
                    style={{
                      fontFamily: "'Zen Maru Gothic', sans-serif",
                      fontSize: "0.6rem",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p
            className="text-gray-800"
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: "0.85rem",
            }}
          >
            ゆうひ
          </p>
          <p
            className="text-gray-500 mt-0.5"
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: "0.7rem",
            }}
          >
            日常の中にある、小さな感動を五七五に。
          </p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-gray-400" />
            <span
              className="text-gray-400"
              style={{
                fontFamily: "'Zen Maru Gothic', sans-serif",
                fontSize: "0.65rem",
              }}
            >
              東京
            </span>
          </div>
        </div>

        <button
          className="w-full mt-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
          style={{
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontSize: "0.8rem",
          }}
        >
          プロフィールを編集
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab("posts")}
          className={`flex-1 py-2.5 flex justify-center transition-colors ${
            tab === "posts"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400"
          }`}
        >
          <Grid3X3 size={20} />
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex-1 py-2.5 flex justify-center transition-colors ${
            tab === "saved"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400"
          }`}
        >
          <Bookmark size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {myHaikus.map((haiku, i) => (
            <motion.div
              key={haiku.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="relative aspect-square overflow-hidden"
            >
              <img
                src={haiku.image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15" />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontFamily: "'Klee One', cursive",
                }}
              >
                <div className="flex flex-row-reverse items-start" style={{ gap: "0.2em" }}>
                  {haiku.haiku.map((line, j) => (
                    <span
                      key={j}
                      className="text-white"
                      style={{
                        writingMode: "vertical-rl",
                        whiteSpace: "nowrap",
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        marginTop: `${j * 0.4}em`,
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}