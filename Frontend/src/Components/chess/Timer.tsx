import { memo, useMemo } from "react";

interface TimerProps {
  time: number;
  label: string;
}

export const Timer = memo(
  ({ time, label }: TimerProps) => {
    const formatTime = useMemo(() => {
      const mins = Math.floor(time / 60);
      const secs = time % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, [time]);

    const colorIndicator = useMemo(
      () => (
        <div
          className={`w-4 h-4 rounded-full ${label === "White" ? "bg-white" : "bg-slate-900"} shadow-sm`}
        />
      ),
      [label]
    );

    return (
      <div className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2">
        {colorIndicator}
        <span className="font-mono text-lg font-bold text-white">
          {formatTime}
        </span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.time === nextProps.time && prevProps.label === nextProps.label;
  }
);

Timer.displayName = "Timer";
