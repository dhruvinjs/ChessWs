import { motion } from "framer-motion";
import { Globe, Zap, Trophy } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Global Multiplayer",
      description:
        "Play against millions of players worldwide with our advanced matchmaking system.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Lightning Fast",
      description:
        "Experience ultra-low latency and real-time move synchronization for seamless gameplay.",
    },
    {
      icon: <Trophy className="h-10 w-10" />,
      title: "Track Your Progress",
      description:
        "Climb the leaderboard and analyze your performance with detailed stats and history.",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-hidden transition-colors duration-300"
    >
      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-amber-400/20 dark:from-indigo-700/20 dark:to-amber-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-amber-300/15 dark:from-indigo-800/25 dark:to-amber-700/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-amber-100 dark:from-indigo-900/50 dark:to-amber-900/40 rounded-full border border-indigo-200 dark:border-indigo-800/50 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              Powerful Features, Beautifully Crafted
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Master Chess
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            From real-time gameplay to detailed analytics, our features are built for players who
            take chess seriously.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index, duration: 0.8 }}
              className="group relative p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/20"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
