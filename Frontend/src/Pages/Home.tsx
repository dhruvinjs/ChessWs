import { Cpu, Users, Zap } from "lucide-react";
import { FloatingPieces } from "../Components/FloatingPieces";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Home() {
  const nav = useNavigate();

  const options = [
    {
      title: "Play vs Computer",
      description:
        "Train your skills against AI opponents powered by Stockfish engine.",
      icon: <Cpu className="h-8 w-8 text-white" />,
      gradient: "from-indigo-500 to-purple-500",
      btnText: "🎮 Play Now",
      onClick: () => nav("/computer"),
    },
    {
      title: "Create or Join Room",
      description:
        "Invite friends or join a private chess room to play together.",
      icon: <Users className="h-8 w-8 text-white" />,
      gradient: "from-rose-500 to-pink-500",
      btnText: "Start",
      onClick: () => nav("/room"),
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <FloatingPieces />

      <motion.h1
        className="text-4xl sm:text-6xl font-black mb-16 text-slate-900 dark:text-white text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Welcome Back to{" "}
        <span className="text-amber-600 dark:text-amber-400">ChessVerse</span>
      </motion.h1>

      <div className="grid gap-8 sm:grid-cols-2 w-full max-w-4xl z-10 items-stretch">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="flex"
          >
            <div className="flex flex-col items-center backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 p-8 rounded-3xl border border-white dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 w-full hover:-translate-y-2">
              <div
                className={`bg-gradient-to-br ${opt.gradient} p-5 rounded-full mb-6 shadow-lg`}
              >
                {opt.icon}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                {opt.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-center mb-8 flex-grow">
                {opt.description}
              </p>

              <button
                onClick={opt.onClick}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
              >
                <span>{opt.btnText}</span>
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
