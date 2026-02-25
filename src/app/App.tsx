import { useState } from "react";
import { Home, Search, Plus, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HaikuCard } from "./components/haiku-card";
import { ComposeScreen } from "./components/compose-screen";
import { ProfileScreen } from "./components/profile-screen";
import { DiscoverScreen } from "./components/discover-screen";

type Tab = "home" | "discover" | "compose" | "profile";

const feedData = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1669668181755-7c5d19898ff5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBza3klMjBjbG91ZHMlMjBhdG1vc3BoZXJpY3xlbnwxfHx8fDE3NzIwMDQ5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["夕焼けに", "染まる帰り道", "影ふたつ"],
    author: "ゆうひ",
    authorAvatar:
      "https://images.unsplash.com/photo-1709435842605-72b57594f0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nJTIwcGV0YWxzfGVufDF8fHx8MTc3MjAwNDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 42,
    comments: 5,
    timestamp: "3時間前",
    textPosition: "right" as const,
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1636976349626-ea37b23805a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWluJTIwd2luZG93JTIwbmV3JTIwcmV2aWV3fGVufDF8fHx8MTc3MjAwNDk4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["窓ガラス", "伝う雫に", "指を添え"],
    author: "はるか",
    authorAvatar:
      "https://images.unsplash.com/photo-1568571022375-ad4f3ef34972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwYmx1ZSUyMGNhbG18ZW58MXx8fHwxNzcyMDA0OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 78,
    comments: 12,
    timestamp: "5時間前",
    textPosition: "left" as const,
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1761191615719-7e1ccb297bf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc3MjAwNDk5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["提灯の", "あかりに揺れる", "きみの横顔"],
    author: "りく",
    authorAvatar:
      "https://images.unsplash.com/photo-1571068160251-c8333566dad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBsZWF2ZXMlMjBnb2xkZW4lMjBsaWdodHxlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 134,
    comments: 23,
    timestamp: "昨日",
    textPosition: "right" as const,
  },
  {
    id: "4",
    imageUrl:
      "https://images.unsplash.com/photo-1771330021649-3104f04934f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbiUyMHN0YXRpb24lMjBwbGF0Zm9ybSUyMG5vc3RhbGdpY3xlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["ホームにて", "来ない電車を", "待つ二月"],
    author: "あおい",
    authorAvatar:
      "https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwY29mZmVlJTIwd2luZG93JTIwbGlnaHR8ZW58MXx8fHwxNzcxOTk4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 56,
    comments: 8,
    timestamp: "2日前",
    textPosition: "center" as const,
  },
  {
    id: "5",
    imageUrl:
      "https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwY29mZmVlJTIwd2luZG93JTIwbGlnaHR8ZW58MXx8fHwxNzcxOTk4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    haiku: ["湯気のぼる", "朝のしずけさ", "猫とわたし"],
    author: "みさき",
    authorAvatar:
      "https://images.unsplash.com/photo-1709435842605-72b57594f0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nJTIwcGV0YWxzfGVufDF8fHx8MTc3MjAwNDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 91,
    comments: 15,
    timestamp: "3日前",
    textPosition: "left" as const,
  },
];

function FeedScreen({ onDiscoverTap }: { onDiscoverTap: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <h1
            className="text-gray-900"
            style={{
              fontFamily: "'Klee One', cursive",
              fontSize: "1.5rem",
              letterSpacing: "0.05em",
            }}
          >
            haiking
          </h1>
          <p
            className="text-gray-400 mt-0.5"
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
            }}
          >
            ことばと写真で、今日を切り取る
          </p>
        </div>
        <button
          onClick={onDiscoverTap}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Search size={22} className="text-gray-500" />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
        {feedData.map((item) => (
          <HaikuCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div
      className="relative mx-auto h-full bg-[#fafafa] overflow-hidden"
      style={{ maxWidth: "430px" }}
    >
      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === "home" && <FeedScreen onDiscoverTap={() => setActiveTab("discover")} />}
          {activeTab === "discover" && (
            <DiscoverScreen onBack={() => setActiveTab("home")} />
          )}
          {activeTab === "compose" && (
            <ComposeScreen onBack={() => setActiveTab("home")} />
          )}
          {activeTab === "profile" && (
            <ProfileScreen onBack={() => setActiveTab("home")} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Compose Button - centered, elevated above nav */}
      {activeTab !== "compose" && (
        <div
          className="absolute z-30"
          style={{
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setActiveTab("compose")}
            className="bg-gray-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] active:scale-95 transition-transform flex items-center justify-center"
            style={{
              width: "56px",
              height: "56px",
            }}
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.button>
        </div>
      )}

      {/* Bottom Navigation */}
      {activeTab !== "compose" && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-20">
          <div className="flex items-center justify-center gap-16 pt-2 pb-5">
            <NavTab
              active={activeTab === "home"}
              icon={Home}
              label="ホーム"
              onClick={() => setActiveTab("home")}
            />

            {/* Center spacer for FAB */}
            <div style={{ width: "56px" }} />

            <NavTab
              active={activeTab === "profile"}
              icon={User}
              label="わたし"
              onClick={() => setActiveTab("profile")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NavTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-5 py-1 transition-all"
    >
      <Icon
        size={22}
        className={`transition-colors ${
          active ? "text-gray-900" : "text-gray-400"
        }`}
      />
      <span
        className={`transition-colors ${
          active ? "text-gray-900" : "text-gray-400"
        }`}
        style={{
          fontFamily: "'Zen Maru Gothic', sans-serif",
          fontSize: "0.55rem",
        }}
      >
        {label}
      </span>
    </button>
  );
}