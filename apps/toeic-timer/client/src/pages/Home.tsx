/*
 * Home.tsx - TOEIC Reading Timer Main Page
 * Design: Modern Minimalism × Focus-Oriented UI
 * Dark theme, circular progress ring, glow effects
 * Colors: Sky Blue (Part5), Emerald (Part6), Violet (Part7)
 * Fonts: Orbitron (timer/labels), Noto Sans JP (UI text)
 * Feature: Customizable duration per part via settings panel
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { PART_CONFIGS, useTimer } from "@/hooks/useTimer";
import AdBanner from "@/components/AdBanner";

const BG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663042559961/JsmH8rHQ5hZA2anNwu9dRy/toeic-bg-6thw9oixjCaKFKCYQqtrxa.webp";

const PART_COLORS = ["#38BDF8", "#10B981", "#A78BFA"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatEndTime(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function computePartEndTime(
  partIndex: number,
  currentPartIndex: number,
  secondsLeft: number,
  customMinutes: [number, number, number],
  completedParts: boolean[],
  partEndTimes: (Date | null)[]
): string {
  if (completedParts[partIndex] && partEndTimes[partIndex]) {
    return formatEndTime(partEndTimes[partIndex]);
  }
  const now = Date.now();
  if (partIndex === currentPartIndex) {
    return formatEndTime(new Date(now + secondsLeft * 1000));
  }
  if (partIndex > currentPartIndex) {
    let additionalSecs = secondsLeft;
    for (let i = currentPartIndex + 1; i <= partIndex; i++) {
      additionalSecs += customMinutes[i] * 60;
    }
    return formatEndTime(new Date(now + additionalSecs * 1000));
  }
  return "--:--";
}

// ---- Circular Progress Ring ----
interface ProgressRingProps {
  progress: number;
  color: string;
  size: number;
  strokeWidth: number;
  isWarning: boolean;
  isDanger: boolean;
  isCompleted: boolean;
}

function ProgressRing({ progress, color, size, strokeWidth, isWarning, isDanger, isCompleted }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const ringColor = isCompleted ? "#10B981" : isDanger ? "#F43F5E" : isWarning ? "#F59E0B" : color;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="absolute inset-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.9s ease, stroke 0.5s ease",
          filter: `drop-shadow(0 0 8px ${ringColor}) drop-shadow(0 0 20px ${ringColor}50)`,
        }}
      />
    </svg>
  );
}

// ---- Part Summary Card ----
interface PartCardProps {
  partIndex: number;
  isActive: boolean;
  isCompleted: boolean;
  endTimeStr: string;
  minutes: number;
}

function PartCard({ partIndex, isActive, isCompleted, endTimeStr, minutes }: PartCardProps) {
  const part = PART_CONFIGS[partIndex];
  const pc = PART_COLORS[partIndex];
  const borderColor = isActive ? `${pc}80` : isCompleted ? "#10B98150" : "rgba(255,255,255,0.07)";
  const bgGradient = isActive
    ? `linear-gradient(135deg, ${pc}14 0%, rgba(255,255,255,0.02) 100%)`
    : isCompleted
    ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,0.01) 100%)"
    : "rgba(255,255,255,0.02)";

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-500"
      style={{ background: bgGradient, border: `1.5px solid ${borderColor}`, boxShadow: isActive ? `0 0 20px ${pc}20` : "none" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: isCompleted ? "#10B981" : isActive ? pc : "rgba(255,255,255,0.35)", fontFamily: "'Orbitron', monospace" }}>
          {part.name}
        </span>
        {isCompleted && <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">✓ 完了</span>}
        {isActive && !isCompleted && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: pc, background: `${pc}15` }}>● 進行中</span>
        )}
      </div>
      <div className="text-3xl font-black mb-0.5" style={{ fontFamily: "'Orbitron', monospace", color: isCompleted ? "#10B981" : isActive ? pc : "rgba(255,255,255,0.5)" }}>
        {minutes}<span className="text-sm font-normal ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>分</span>
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{isCompleted ? "終了時刻" : "終了予定"}</p>
        <p className="text-xl font-bold" style={{ fontFamily: "'Orbitron', monospace", color: isCompleted ? "#10B981" : isActive ? pc : "rgba(255,255,255,0.35)" }}>
          {endTimeStr}
        </p>
      </div>
    </div>
  );
}

// ---- Settings Panel ----
interface SettingsPanelProps {
  customMinutes: [number, number, number];
  onChangeMinutes: (partIndex: number, minutes: number) => void;
  onClose: () => void;
  disabled: boolean;
}

function SettingsPanel({ customMinutes, onChangeMinutes, onClose, disabled }: SettingsPanelProps) {
  const [localValues, setLocalValues] = useState<[string, string, string]>([
    String(customMinutes[0]),
    String(customMinutes[1]),
    String(customMinutes[2]),
  ]);

  const handleChange = (i: number, val: string) => {
    const next = [...localValues] as [string, string, string];
    next[i] = val;
    setLocalValues(next);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 99) {
      onChangeMinutes(i, num);
    }
  };

  const handleBlur = (i: number) => {
    const num = parseInt(localValues[i], 10);
    if (isNaN(num) || num < 1) {
      const next = [...localValues] as [string, string, string];
      next[i] = String(customMinutes[i]);
      setLocalValues(next);
    }
  };

  const presets = [
    { label: "TOEIC公式", values: [12, 12, 51] as [number, number, number] },
    { label: "短縮練習", values: [6, 6, 25] as [number, number, number] },
    { label: "カスタム" },
  ];

  const isPreset = (vals: [number, number, number]) =>
    vals[0] === customMinutes[0] && vals[1] === customMinutes[1] && vals[2] === customMinutes[2];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-3xl p-8 w-full max-w-sm mx-4 animate-fade-in-up"
        style={{ background: "linear-gradient(135deg, #1E293B, #162032)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: "0.1em" }}>
              TIME SETTINGS
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>各パートの時間を設定</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            ✕
          </button>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-6">
          {presets.map((preset) => {
            if (!preset.values) return null;
            const active = isPreset(preset.values);
            return (
              <button
                key={preset.label}
                onClick={() => {
                  if (!disabled && preset.values) {
                    preset.values.forEach((v, i) => {
                      onChangeMinutes(i, v);
                      const next = [...localValues] as [string, string, string];
                      next[i] = String(v);
                      setLocalValues(next);
                    });
                  }
                }}
                disabled={disabled}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${active ? "#38BDF880" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#38BDF8" : "rgba(255,255,255,0.5)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Part inputs */}
        <div className="space-y-4">
          {PART_CONFIGS.map((part, i) => {
            const pc = PART_COLORS[i];
            return (
              <div key={part.id} className="flex items-center gap-4">
                {/* Part label */}
                <div
                  className="w-16 text-xs font-bold tracking-wider flex-shrink-0"
                  style={{ fontFamily: "'Orbitron', monospace", color: pc }}
                >
                  {part.name}
                </div>

                {/* Minus button */}
                <button
                  onClick={() => !disabled && handleChange(i, String(Math.max(1, customMinutes[i] - 1)))}
                  disabled={disabled || customMinutes[i] <= 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                  style={{
                    background: `${pc}18`,
                    border: `1px solid ${pc}40`,
                    color: pc,
                    opacity: disabled || customMinutes[i] <= 1 ? 0.4 : 1,
                    cursor: disabled || customMinutes[i] <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  −
                </button>

                {/* Input */}
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={localValues[i]}
                  onChange={(e) => !disabled && handleChange(i, e.target.value)}
                  onBlur={() => handleBlur(i)}
                  disabled={disabled}
                  className="flex-1 text-center text-2xl font-black rounded-xl py-2 outline-none transition-all"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    background: `${pc}10`,
                    border: `1.5px solid ${pc}40`,
                    color: pc,
                    cursor: disabled ? "not-allowed" : "text",
                    opacity: disabled ? 0.6 : 1,
                    MozAppearance: "textfield",
                  }}
                />

                {/* Plus button */}
                <button
                  onClick={() => !disabled && handleChange(i, String(Math.min(99, customMinutes[i] + 1)))}
                  disabled={disabled || customMinutes[i] >= 99}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                  style={{
                    background: `${pc}18`,
                    border: `1px solid ${pc}40`,
                    color: pc,
                    opacity: disabled || customMinutes[i] >= 99 ? 0.4 : 1,
                    cursor: disabled || customMinutes[i] >= 99 ? "not-allowed" : "pointer",
                  }}
                >
                  ＋
                </button>

                {/* Unit */}
                <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)", width: 16 }}>分</span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div
          className="mt-6 pt-5 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>合計時間</span>
          <span className="text-xl font-black" style={{ fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.8)" }}>
            {customMinutes.reduce((s, m) => s + m, 0)}<span className="text-sm font-normal ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>分</span>
          </span>
        </div>

        {disabled && (
          <p className="mt-4 text-center text-xs" style={{ color: "rgba(255,165,0,0.7)" }}>
            ⚠ タイマー実行中は変更できません。リセット後に設定してください。
          </p>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #38BDF8ee, #38BDF8aa)", color: "#0F172A" }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function Home() {
  const timer = useTimer();
  const [flashKey, setFlashKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const prevPartIndex = useRef(timer.currentPartIndex);

  useEffect(() => {
    if (prevPartIndex.current !== timer.currentPartIndex) {
      setFlashKey((k) => k + 1);
      prevPartIndex.current = timer.currentPartIndex;
    }
  }, [timer.currentPartIndex]);

  const handleMainButton = useCallback(() => {
    if (timer.status === "idle") {
      timer.start();
    } else if (timer.status === "running") {
      timer.pause();
    } else if (timer.status === "paused") {
      if (timer.partJustFinished) {
        timer.nextPart();
      } else {
        timer.resume();
      }
    }
  }, [timer]);

  const isAllDone = timer.status === "finished";
  const currentPart = PART_CONFIGS[timer.currentPartIndex];
  const timerColor = isAllDone
    ? "#10B981"
    : timer.isDanger
    ? "#F43F5E"
    : timer.isWarning
    ? "#F59E0B"
    : timer.currentPartColor;

  const getStatusText = () => {
    if (isAllDone) return "全パート完了！お疲れ様でした";
    if (timer.status === "idle") return "スタートボタンを押して開始";
    if (timer.partJustFinished) return `${currentPart.name} 終了 → 次のパートへ進んでください`;
    if (timer.status === "paused") return "一時停止中";
    if (timer.isDanger) return "残り時間わずか！";
    if (timer.isWarning) return "残り3分を切りました";
    return `${currentPart.name} 計測中`;
  };

  const getButtonLabel = () => {
    if (timer.status === "idle") return "スタート";
    if (timer.status === "running") return "一時停止";
    if (timer.partJustFinished) {
      const next = PART_CONFIGS[timer.currentPartIndex + 1];
      return next ? `${next.name} へ` : "完了";
    }
    if (timer.status === "paused") return "再開";
    return "完了";
  };

  const RING_SIZE = 280;
  const STROKE = 10;

  const endTimeStrings = PART_CONFIGS.map((_, i) =>
    timer.startTime || timer.status !== "idle"
      ? computePartEndTime(i, timer.currentPartIndex, timer.secondsLeft, timer.customMinutes, timer.completedParts, timer.partEndTimes)
      : "--:--"
  );

  const isTimerActive = timer.status === "running" || timer.status === "paused";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "linear-gradient(160deg, #0F172A 0%, #0D1B2A 60%, #0A1628 100%)", fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* BG overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.07, zIndex: 0 }}
      />

      {/* Settings panel overlay */}
      {showSettings && (
        <SettingsPanel
          customMinutes={timer.customMinutes}
          onChangeMinutes={timer.setCustomMinutes}
          onClose={() => setShowSettings(false)}
          disabled={isTimerActive}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="py-5 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.92)" }}>
              TOEIC
            </h1>
            <p className="text-[10px] tracking-[0.25em] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>READING TIMER</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}
              title="時間を設定"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <div className="text-right">
              <p className="text-[10px] tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>合計時間</p>
              <p className="text-lg font-bold" style={{ fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.7)" }}>
                {timer.totalMinutes}<span className="text-sm font-normal ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>分</span>
              </p>
            </div>
          </div>
        </header>

        {/* Ad banner - top (below header) */}
        <div className="px-6 mb-2">
          <AdBanner format="horizontal" />
        </div>

        {/* Overall progress bar */}
        <div className="px-6 mb-4">
          <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>全体の進捗</span>
            <span>{Math.round(timer.totalProgress * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timer.totalProgress * 100}%`, background: "linear-gradient(90deg, #38BDF8, #A78BFA)", boxShadow: "0 0 8px #38BDF840" }}
            />
          </div>
        </div>

        {/* Part step indicators */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2">
            {PART_CONFIGS.map((part, i) => {
              const isActive = i === timer.currentPartIndex && !isAllDone;
              const isDone = timer.completedParts[i] || (isAllDone && i === PART_CONFIGS.length - 1);
              const pc = PART_COLORS[i];
              return (
                <div key={part.id} className="flex items-center gap-2 flex-1">
                  <div
                    className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 transition-all duration-500"
                    style={{
                      background: isActive ? `${pc}15` : isDone ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? `${pc}50` : isDone ? "#10B98135" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500"
                      style={{
                        background: isActive ? pc : isDone ? "#10B981" : "rgba(255,255,255,0.08)",
                        color: isActive || isDone ? "#0F172A" : "rgba(255,255,255,0.3)",
                        fontFamily: "'Orbitron', monospace",
                        fontSize: "10px",
                      }}
                    >
                      {isDone ? "✓" : i + 5}
                    </div>
                    <span className="text-xs font-medium transition-all duration-500" style={{ color: isActive ? pc : isDone ? "#10B981" : "rgba(255,255,255,0.3)" }}>
                      {part.name}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "'Orbitron', monospace" }}>
                      {timer.customMinutes[i]}m
                    </span>
                  </div>
                  {i < PART_CONFIGS.length - 1 && <div className="w-3 h-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main timer area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            key={flashKey}
            className="relative flex items-center justify-center mb-8"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <ProgressRing
              progress={isAllDone ? 1 : timer.progress}
              color={timer.currentPartColor}
              size={RING_SIZE}
              strokeWidth={STROKE}
              isWarning={timer.isWarning}
              isDanger={timer.isDanger}
              isCompleted={isAllDone}
            />
            <div className="flex flex-col items-center justify-center text-center z-10 px-8">
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: isAllDone ? "#10B981" : timerColor, fontFamily: "'Orbitron', monospace" }}>
                {isAllDone ? "COMPLETE" : currentPart.name}
              </p>
              <div
                className="text-6xl font-black tabular-nums leading-none mb-3"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  color: timerColor,
                  textShadow: `0 0 24px ${timerColor}90, 0 0 48px ${timerColor}40`,
                  transition: "color 0.5s ease, text-shadow 0.5s ease",
                  letterSpacing: "-0.02em",
                }}
              >
                {isAllDone ? "00:00" : formatTime(timer.secondsLeft)}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: timer.partJustFinished ? timerColor : "rgba(255,255,255,0.38)", maxWidth: 180, fontWeight: timer.partJustFinished ? 500 : 400 }}
              >
                {getStatusText()}
              </p>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={timer.reset}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}
              title="リセット"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            {!isAllDone && (
              <button
                onClick={handleMainButton}
                className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${timerColor}ee, ${timerColor}aa)`,
                  color: "#0F172A",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxShadow: `0 4px 24px ${timerColor}45, 0 0 0 1px ${timerColor}25`,
                  minWidth: 160,
                  transition: "background 0.5s ease, box-shadow 0.5s ease, transform 0.2s ease",
                }}
              >
                {getButtonLabel()}
              </button>
            )}

            {isAllDone && (
              <button
                onClick={timer.reset}
                className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10B981ee, #10B981aa)", color: "#0F172A", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 24px #10B98145", minWidth: 160 }}
              >
                もう一度
              </button>
            )}

            {timer.status === "running" && timer.currentPartIndex < PART_CONFIGS.length - 1 && (
              <button
                onClick={timer.nextPart}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}
                title="次のパートへスキップ"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Ad banner - bottom (above part cards) */}
        <div className="px-6 mb-4">
          <AdBanner format="horizontal" />
        </div>

        {/* Part summary cards */}
        <div className="px-6 pb-8">
          <p className="text-[10px] mb-3 tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>各パートの終了時刻</p>
          <div className="grid grid-cols-3 gap-3">
            {PART_CONFIGS.map((_, i) => (
              <PartCard
                key={i}
                partIndex={i}
                isActive={i === timer.currentPartIndex && !isAllDone}
                isCompleted={timer.completedParts[i] || (isAllDone && i === PART_CONFIGS.length - 1)}
                endTimeStr={endTimeStrings[i]}
                minutes={timer.customMinutes[i]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
