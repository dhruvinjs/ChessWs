
import { Navbar } from "../Components"
import { motion } from "framer-motion"
import { useMemo } from "react"
export function About() {
  const floatingPieces = useMemo(() => ["♛", "♜", "♝", "♞", "♟", "♚"], [])

  const floatingPieceStyles = useMemo(
    () =>
      floatingPieces.map((_, index) => ({
        top: `${15 + index * 12}%`,
        left: `${5 + index * 15}%`,
        animationDelay: `${index * 0.7}s`,
        animationDuration: `${6 + index * 0.5}s`,
      })),
    [floatingPieces]
  )

  const stats = [
    { label: "Technologies Mastered", value: "6+" },
    { label: "Commits", value: "500+" },
    { label: "Hours", value: "1.2K+" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 transition-colors duration-300 relative overflow-hidden">
      <Navbar />

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-300/40 to-orange-400/40 dark:from-amber-600/50 dark:to-orange-700/50 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-20 -left-32 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-amber-400/30 dark:from-amber-700/60 dark:to-yellow-700/60 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {floatingPieces.map((piece, index) => (
          <motion.div
            key={piece + index}
            className="absolute text-4xl text-amber-600/20 dark:text-amber-400/40 select-none"
            style={floatingPieceStyles[index]}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.4 }}
          >
            {piece}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-100/50 to-orange-100/30 dark:from-amber-900/30 dark:to-orange-900/20 overflow-hidden pt-32 sm:pt-40 lg:pt-48 pb-20">
        <div className="absolute inset-0 bg-[url('/chess-pieces-pattern.jpg')] opacity-5"></div>
        <div className="relative flex flex-col justify-center px-6 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6"
          >
            <span className="text-slate-900 dark:text-white">Multiplayer</span>
            <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Chess Game
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12"
          >
            Real-time gameplay with modern web technologies
          </motion.p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="text-center group cursor-pointer"
              >
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Features */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Real-Time", desc: "WebSocket-powered instant moves" },
              { title: "Fast Cache", desc: "Redis for lightning-fast performance" },
              { title: "Scalable", desc: "Node.js + PostgreSQL + Prisma" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.3 }}
                viewport={{ once: true }}
                className="group bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50 hover:shadow-2xl hover:border-amber-400/70 dark:hover:border-amber-600/70 transition-all duration-300 hover:scale-105 cursor-pointer hover:-translate-y-2"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {card.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-gradient-to-br from-amber-100/60 to-orange-100/40 dark:from-amber-950/60 dark:to-orange-950/40 py-12">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl"
          >
            <span className="text-4xl text-white">👨‍💻</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Built by <span className="text-amber-700 dark:text-amber-400">Dhruvin Soni</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8"
          >
            Passionate full-stack developer exploring real-time applications and modern web technologies through
            interactive gaming experiences.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["React", "Node.js", "Redis", "PostgreSQL", "Prisma", "WebSockets"].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="px-4 py-2 bg-amber-800 dark:bg-amber-700 text-white rounded-full text-sm font-medium shadow-sm"
              >
                {tech}
              </motion.span>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            🎮 Play Now
          </motion.button>
        </div>
      </section>
    </div>
  )
}
