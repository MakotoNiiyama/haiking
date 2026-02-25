import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Upload, Sparkles, Send, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ComposeScreenProps {
  onBack: () => void;
}

const lineOffsets = [0, 1.2, 2.4];

// Mock AI haiku generation based on image "analysis"
const mockHaikuSets = [
  ["夕焼けに", "染まる帰り道", "影ふたつ"],
  ["風薫る", "木漏れ日の道", "歩く午後"],
  ["窓ガラス", "伝う雫に", "指を添え"],
  ["花びらが", "教科書のうえ", "春の授業"],
  ["湯気のぼる", "朝のしずけさ", "猫とわたし"],
  ["提灯の", "あかりに揺れる", "きみの横顔"],
  ["ホームにて", "来ない電車を", "待つ二月"],
  ["波の音", "イヤホン外して", "きく夏よ"],
];

export function ComposeScreen({ onBack }: ComposeScreenProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [haiku, setHaiku] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [textGray, setTextGray] = useState(255); // 0 = black, 255 = white
  const [textPos, setTextPos] = useState({ x: 65, y: 40 }); // percent
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const textColor = `rgb(${textGray}, ${textGray}, ${textGray})`;

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setHaiku(null);
      // Simulate AI generation
      setIsGenerating(true);
      setTimeout(() => {
        const randomHaiku = mockHaikuSets[Math.floor(Math.random() * mockHaikuSets.length)];
        setHaiku(randomHaiku);
        setIsGenerating(false);
        setTextPos({ x: 65, y: 40 }); // reset position
      }, 1800);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const regenerateHaiku = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setHaiku(null);
    setTimeout(() => {
      const randomHaiku = mockHaikuSets[Math.floor(Math.random() * mockHaikuSets.length)];
      setHaiku(randomHaiku);
      setIsGenerating(false);
    }, 1200);
  };

  // --- Drag text position (pointer events for touch + mouse) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!haiku || !cardRef.current) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = cardRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: textPos.x,
      posY: textPos.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    const newX = Math.max(5, Math.min(95, dragStartRef.current.posX + dx));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.posY + dy));
    setTextPos({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const hasContent = !!haiku && haiku.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span
          style={{
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontSize: "0.95rem",
          }}
          className="text-gray-800"
        >
          つくる
        </span>
        <button
          disabled={!hasContent}
          className={`px-4 py-1.5 rounded-full transition-all ${
            hasContent
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-400"
          }`}
          style={{
            fontFamily: "'Zen Maru Gothic', sans-serif",
            fontSize: "0.8rem",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Send size={14} />
            投稿
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Preview Card / Upload Area */}
        <div className="px-5 pt-5 pb-3">
          <div
            ref={cardRef}
            className={`relative w-full overflow-hidden rounded-2xl shadow-md ${
              isDragOver ? "ring-2 ring-gray-400 ring-offset-2" : ""
            }`}
            style={{ aspectRatio: "3/4" }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* AI generating indicator */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 z-20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles size={28} className="text-white" />
                        </motion.div>
                        <p
                          className="text-white/90"
                          style={{
                            fontFamily: "'Zen Maru Gothic', sans-serif",
                            fontSize: "0.8rem",
                          }}
                        >
                          AIが俳句を詠んでいます…
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draggable Haiku Text */}
                <AnimatePresence>
                  {haiku && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute z-10"
                      style={{
                        left: `${textPos.x}%`,
                        top: `${textPos.y}%`,
                        transform: "translate(-50%, -50%)",
                        cursor: isDragging ? "grabbing" : "grab",
                        touchAction: "none",
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    >
                      <div
                        className="flex flex-row-reverse items-start"
                        style={{
                          fontFamily: "'Klee One', cursive",
                          color: textColor,
                          gap: "0.5em",
                        }}
                      >
                        {haiku.map((line, i) => (
                          <motion.span
                            key={`${line}-${i}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            style={{
                              writingMode: "vertical-rl",
                              whiteSpace: "nowrap",
                              fontSize: "1.3rem",
                              letterSpacing: "0.3em",
                              marginTop: `${lineOffsets[i]}em`,
                              userSelect: "none",
                              WebkitUserSelect: "none",
                            }}
                          >
                            {line}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tap to re-upload overlay hint */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 left-3 z-20 bg-black/30 backdrop-blur-sm rounded-full p-2 transition-colors hover:bg-black/50"
                >
                  <Upload size={16} className="text-white/80" />
                </button>
              </>
            ) : (
              /* Empty upload state */
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-gray-100 transition-colors hover:bg-gray-150"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Upload size={26} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-gray-500"
                      style={{
                        fontFamily: "'Zen Maru Gothic', sans-serif",
                        fontSize: "0.85rem",
                      }}
                    >
                      写真をアップロード
                    </p>
                    <p
                      className="text-gray-400 mt-1"
                      style={{
                        fontFamily: "'Zen Maru Gothic', sans-serif",
                        fontSize: "0.65rem",
                      }}
                    >
                      タップまたはドラッグ&ドロップ
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {/* Controls - only show when image is uploaded */}
        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-2 pb-6"
          >
            {/* Regenerate button */}
            {haiku && !isGenerating && (
              <button
                onClick={regenerateHaiku}
                className="flex items-center gap-2 mx-auto mb-5 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                <RotateCcw size={14} className="text-gray-500" />
                <span
                  className="text-gray-600"
                  style={{
                    fontFamily: "'Zen Maru Gothic', sans-serif",
                    fontSize: "0.75rem",
                  }}
                >
                  もう一句よむ
                </span>
              </button>
            )}

            {/* Grayscale color slider */}
            {haiku && !isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-gray-400"
                    style={{
                      fontFamily: "'Zen Maru Gothic', sans-serif",
                      fontSize: "0.7rem",
                    }}
                  >
                    文字の色
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: textColor }}
                  />
                </div>
                <div className="relative">
                  {/* Gradient track background */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      height: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "linear-gradient(to right, #000000, #ffffff)",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={textGray}
                    onChange={(e) => setTextGray(Number(e.target.value))}
                    className="w-full relative z-10 appearance-none bg-transparent cursor-pointer"
                    style={{
                      height: "24px",
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-gray-300"
                    style={{
                      fontFamily: "'Zen Maru Gothic', sans-serif",
                      fontSize: "0.55rem",
                    }}
                  >
                    くろ
                  </span>
                  <span
                    className="text-gray-300"
                    style={{
                      fontFamily: "'Zen Maru Gothic', sans-serif",
                      fontSize: "0.55rem",
                    }}
                  >
                    しろ
                  </span>
                </div>
              </div>
            )}

            {/* Drag hint */}
            {haiku && !isGenerating && (
              <p
                className="text-center text-gray-300 mt-4"
                style={{
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  fontSize: "0.6rem",
                }}
              >
                俳句をドラッグして配置を調整できます
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
