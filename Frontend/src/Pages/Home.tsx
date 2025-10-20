import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Swords, Users } from "lucide-react";
import { Button } from "../Components/Button";

export function Home() {
  const nav = useNavigate();

  const options = [
    {
      title: "Play with Bots",
      description: "Train your skills against AI opponents at different difficulty levels.",
      icon: <Cpu className="h-8 w-8 text-indigo-500 dark:text-amber-400" />,
      gradient: "from-indigo-500 to-purple-500",
      onClick: () => nav("/bot"),
    },
    {
      title: "Random Match",
      description: "Instantly find and play with another player online.",
      icon: <Swords className="h-8 w-8 text-amber-500 dark:text-amber-400" />,
      gradient: "from-amber-500 to-orange-500",
      onClick: () => nav("/game"),
    },
    {
      title: "Create or Join Room",
      description: "Invite friends or join a private chess room to play together.",
      icon: <Users className="h-8 w-8 text-rose-500 dark:text-amber-400" />,
      gradient: "from-rose-500 to-pink-500",
      onClick: () => nav("/room"),
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 flex flex-col items-center justify-center px-4 py-16">
      <motion.h1
        className="text-4xl sm:text-5xl font-bold mb-12 text-slate-900 dark:text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Welcome Back to <span className="text-amber-600 dark:text-amber-400">ChessVerse</span>
      </motion.h1>

      <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="flex flex-col items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
          >
            <div
              className={`bg-gradient-to-r ${opt.gradient} p-4 rounded-full mb-6 shadow-lg`}
            >
              {opt.icon}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
              {opt.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              {opt.description}
            </p>
            <Button
              variant="primary"
              text="Start"
              size="md"
              className="w-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
              onClick={opt.onClick}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
