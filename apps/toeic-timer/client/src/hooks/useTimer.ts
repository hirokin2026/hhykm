/*
 * useTimer.ts
 * TOEIC Reading Timer - Custom Hook
 * Manages the countdown timer state for all 3 parts.
 * Supports customizable durations per part.
 * Design: Modern Minimalism × Focus-Oriented UI
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type PartId = 0 | 1 | 2;

export interface PartConfig {
  id: PartId;
  name: string;
  defaultMinutes: number;
  color: string;
}

export const PART_CONFIGS: PartConfig[] = [
  { id: 0, name: "Part 5", defaultMinutes: 12, color: "#38BDF8" },
  { id: 1, name: "Part 6", defaultMinutes: 12, color: "#10B981" },
  { id: 2, name: "Part 7", defaultMinutes: 51, color: "#A78BFA" },
];

export interface TimerState {
  currentPartIndex: number;
  secondsLeft: number;
  status: TimerStatus;
  startTime: Date | null;
  partEndTimes: (Date | null)[];
  completedParts: boolean[];
  partJustFinished: boolean;
  /** Custom durations in minutes for each part */
  customMinutes: [number, number, number];
}

export interface UseTimerReturn extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  nextPart: () => void;
  reset: () => void;
  setCustomMinutes: (partIndex: number, minutes: number) => void;
  progress: number;
  totalProgress: number;
  isWarning: boolean;
  isDanger: boolean;
  currentPartColor: string;
  totalMinutes: number;
}

function getInitialState(customMinutes: [number, number, number]): TimerState {
  return {
    currentPartIndex: 0,
    secondsLeft: customMinutes[0] * 60,
    status: "idle",
    startTime: null,
    partEndTimes: [null, null, null],
    completedParts: [false, false, false],
    partJustFinished: false,
    customMinutes,
  };
}

const DEFAULT_MINUTES: [number, number, number] = [12, 12, 51];

export function useTimer(): UseTimerReturn {
  const [state, setState] = useState<TimerState>(() =>
    getInitialState(DEFAULT_MINUTES)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.status !== "running") {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "running") return prev;
        const newSeconds = prev.secondsLeft - 1;

        if (newSeconds <= 0) {
          const newEndTimes = [...prev.partEndTimes] as (Date | null)[];
          newEndTimes[prev.currentPartIndex] = new Date();
          const newCompleted = [...prev.completedParts];
          newCompleted[prev.currentPartIndex] = true;

          const isLastPart = prev.currentPartIndex === PART_CONFIGS.length - 1;
          if (isLastPart) {
            return {
              ...prev,
              secondsLeft: 0,
              status: "finished",
              partEndTimes: newEndTimes,
              completedParts: newCompleted,
              partJustFinished: false,
            };
          }

          return {
            ...prev,
            secondsLeft: 0,
            status: "paused",
            partEndTimes: newEndTimes,
            completedParts: newCompleted,
            partJustFinished: true,
          };
        }

        return { ...prev, secondsLeft: newSeconds };
      });
    }, 1000);

    return clearTimer;
  }, [state.status, clearTimer]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "running",
      startTime: prev.startTime ?? new Date(),
      partJustFinished: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) =>
      prev.status === "running" ? { ...prev, status: "paused" } : prev
    );
  }, []);

  const resume = useCallback(() => {
    setState((prev) =>
      prev.status === "paused" && !prev.partJustFinished
        ? { ...prev, status: "running" }
        : prev
    );
  }, []);

  const nextPart = useCallback(() => {
    setState((prev) => {
      if (prev.currentPartIndex >= PART_CONFIGS.length - 1) return prev;
      const newEndTimes = [...prev.partEndTimes] as (Date | null)[];
      if (!newEndTimes[prev.currentPartIndex]) {
        newEndTimes[prev.currentPartIndex] = new Date();
      }
      const newCompleted = [...prev.completedParts];
      newCompleted[prev.currentPartIndex] = true;
      const nextIndex = (prev.currentPartIndex + 1) as PartId;
      return {
        ...prev,
        currentPartIndex: nextIndex,
        secondsLeft: prev.customMinutes[nextIndex] * 60,
        status: "running",
        partEndTimes: newEndTimes,
        completedParts: newCompleted,
        partJustFinished: false,
      };
    });
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState((prev) => getInitialState(prev.customMinutes));
  }, [clearTimer]);

  const setCustomMinutes = useCallback((partIndex: number, minutes: number) => {
    const clamped = Math.max(1, Math.min(99, minutes));
    setState((prev) => {
      const newCustomMinutes = [...prev.customMinutes] as [number, number, number];
      newCustomMinutes[partIndex] = clamped;
      // If idle, also update secondsLeft for the current part
      const newSecondsLeft =
        prev.status === "idle" && partIndex === prev.currentPartIndex
          ? clamped * 60
          : prev.secondsLeft;
      return {
        ...prev,
        customMinutes: newCustomMinutes,
        secondsLeft: newSecondsLeft,
      };
    });
  }, []);

  const currentPartColor = PART_CONFIGS[state.currentPartIndex].color;
  const totalSecondsForCurrentPart = state.customMinutes[state.currentPartIndex] * 60;
  const elapsed = totalSecondsForCurrentPart - state.secondsLeft;
  const progress = elapsed / totalSecondsForCurrentPart;

  const totalSeconds = state.customMinutes.reduce((sum, m) => sum + m * 60, 0);
  const totalElapsed =
    state.customMinutes
      .slice(0, state.currentPartIndex)
      .reduce((sum, m) => sum + m * 60, 0) + elapsed;
  const totalProgress = totalSeconds > 0 ? totalElapsed / totalSeconds : 0;

  const isWarning =
    state.secondsLeft <= 180 && state.secondsLeft > 60 && state.status === "running";
  const isDanger =
    state.secondsLeft <= 60 && state.secondsLeft > 0 && state.status === "running";

  const totalMinutes = state.customMinutes.reduce((sum, m) => sum + m, 0);

  return {
    ...state,
    start,
    pause,
    resume,
    nextPart,
    reset,
    setCustomMinutes,
    progress,
    totalProgress,
    isWarning,
    isDanger,
    currentPartColor,
    totalMinutes,
  };
}
