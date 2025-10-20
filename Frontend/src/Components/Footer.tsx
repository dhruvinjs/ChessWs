import { motion } from "framer-motion"
import { FaGithub } from "react-icons/fa"
import { BsTwitterX } from "react-icons/bs"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-slate-100 
                 dark:from-black dark:via-gray-900 dark:to-amber-950 text-slate-800 dark:text-white 
                 py-16 px-6 transition-colors duration-500"
    >
      {/* Ambient glowing background orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/15 blur-3xl rounded-full"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/20 dark:bg-orange-600/20 blur-3xl rounded-full"
        animate={{
          x: [0, -40, 40, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      {/* Main content */}
      <motion.div
        className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Brand */}
        <motion.span
          className="font-bold text-4xl tracking-wide flex items-center gap-2 
                     bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 
                     dark:from-amber-300 dark:via-orange-300 dark:to-red-300 
                     bg-clip-text text-transparent drop-shadow-lg"
          whileHover={{
            scale: 1.05,
            textShadow: "0px 0px 12px rgba(255,200,90,0.8)",
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          ♟ Chess Masters
        </motion.span>

        {/* Social Icons */}
        <motion.div
          className="flex gap-8 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.a
            href="https://github.com/dhruvinjs/ChessWs"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.25, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group"
          >
            <FaGithub className="h-8 w-8 text-slate-800 dark:text-amber-300 group-hover:text-amber-500 transition-colors duration-300" />
          </motion.a>

          <motion.a
            href="https://x.com/dhruvin1800"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.25, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group"
          >
            <BsTwitterX className="h-7 w-7 text-slate-700 dark:text-orange-300 group-hover:text-orange-500 transition-colors duration-300" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Animated divider */}
      <motion.div
        className="w-full h-[1px] bg-gradient-to-r from-amber-400/50 via-orange-400/40 to-red-400/40 dark:from-amber-500/50 dark:via-orange-500/40 dark:to-red-500/40 my-8"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Footer text */}
      <motion.p
        className="text-center text-sm opacity-90 tracking-wide relative z-10 text-slate-700 dark:text-slate-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        © {currentYear}{" "}
        <span className="font-semibold text-amber-700 dark:text-amber-300">Chess Masters</span>.{" "}
        Built with ♟, strategy, and creativity.
      </motion.p>

      {/* Floating decorative piece */}
      <motion.div
        className="absolute text-6xl text-amber-400/20 dark:text-amber-400/30 bottom-8 left-8 select-none"
        animate={{ y: [0, -12, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ♕
      </motion.div>
    </footer>
  )
}
