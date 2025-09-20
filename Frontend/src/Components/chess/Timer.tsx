import { memo, useMemo } from "react"
import { motion } from "framer-motion"

interface TimerProps {
  time: number // remaining seconds from backend
  maxTime: number // max seconds for progress
  label: string // "White" / "Black"
  colors: { bg: string; fill: string }
}

export const Timer = memo(
  ({ time, maxTime, label, colors }: TimerProps) => {
    const progress = useMemo(() => Math.max(0, (time / maxTime) * 100), [time, maxTime])

    const formatTime = useMemo(() => {
      const mins = Math.floor(time / 60)
      const secs = time % 60
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }, [time])

    const colorIndicator = useMemo(
      () => <div className={`w-5 h-5 rounded-full ${label === "White" ? "bg-white" : "bg-slate-800"} shadow-sm`} />,
      [label],
    )

    return (
      <motion.div
        className={`relative w-full p-3 ${colors.bg} rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
          {colorIndicator}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>

        <div className="flex-1 h-4 rounded-full overflow-hidden mx-0 sm:mx-4 bg-slate-200 dark:bg-slate-600">
          <motion.div
            className={`h-4 ${colors.fill} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <span className="font-mono text-sm sm:text-lg font-bold text-slate-900 dark:text-white w-full sm:w-auto text-right sm:text-left">
          {formatTime}
        </span>
      </motion.div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.time === nextProps.time &&
      prevProps.maxTime === nextProps.maxTime &&
      prevProps.label === nextProps.label &&
      prevProps.colors.bg === nextProps.colors.bg &&
      prevProps.colors.fill === nextProps.colors.fill
    )
  },
)

Timer.displayName = "Timer"
