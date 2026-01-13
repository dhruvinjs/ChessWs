import { motion } from 'framer-motion';
import { Users, Monitor, UserCircle, Hash, Zap, ShieldCheck, Trophy, Target } from 'lucide-react';

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section 
      id="features"
      className="relative py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-indigo-400 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-amber-400 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-xs md:text-sm mb-4 block"
          >
            Core Capabilities
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white"
          >
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-amber-600">Chess Arena</span>
          </motion.h2>
        </div>

        {/* Bento Grid Layout - Highly Responsive Column Spanning */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[180px]"
        >
          {/* 1. Stockfish Engine - LARGE CARD */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-8 md:row-span-2 group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all min-h-[300px] md:min-h-0"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                <Monitor size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">Master the Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-md leading-relaxed">
                Challenge <strong>Stockfish</strong> in a Human vs Computer showdown. Tailor the intensity with <span className="text-indigo-500 font-medium">Easy, Medium, or Hard</span> presets to match your skill level.
              </p>
            </div>
            
            {/* Visual element for the engine */}
            <div className="absolute -bottom-6 -right-6 md:bottom-4 md:right-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Zap size={180} className="text-indigo-600" />
            </div>
          </motion.div>

          {/* 2. Profile Stats - IMPROVED UI CARD */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-4 md:row-span-2 group relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-6 md:p-8 text-white flex flex-col justify-between shadow-2xl"
          >
            <div className="z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/20">
                  <UserCircle size={24} className="text-indigo-400" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Profile Live</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Performance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Real-time tracking of your match history and win-rate.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Trophy size={14} />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Wins</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">124</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Target size={14} />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Losses</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">42</p>
                </div>
              </div>
            </div>

            {/* Visual Win Ratio Bar - Cleaner integration */}
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Win Ratio</span>
                <span className="text-sm font-black text-indigo-400 italic">74%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '74.6%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" 
                />
              </div>
            </div>
          </motion.div>

          {/* 3. Room Matchmaking - WIDE CARD */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-7 md:row-span-1 group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 md:gap-6 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shadow-sm">
              <Hash size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Private Room Codes</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Create a room, share the unique code, and play instantly with friends.</p>
            </div>
          </motion.div>

          {/* 4. Instant Matchmaking - SMALL CARD */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-12 lg:col-span-5 md:row-span-1 group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 md:gap-6 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-sm">
              <Users size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Random Match</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Jump into the global pool and find an opponent in seconds.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Trust Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
        >
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck size={18} />
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Anti-Cheat System</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Zap size={18} />
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Zero Latency Play</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}