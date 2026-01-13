import { Navbar } from '../Components';
import { motion } from 'framer-motion';
import { Cpu, Database, Globe, Play, ShieldCheck, Terminal, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';
export function About() {
  const floatingPieces = useMemo(() => ['♛', '♜', '♝', '♞', '♟', '♚'], []);
  const stats = [
    { label: 'Technologies', value: '6+', icon: <Cpu className="w-5 h-5" /> },
    { label: 'Total Commits', value: '50+', icon: <Terminal className="w-5 h-5" /> },
    { label: 'Dev Hours', value: '1.2K+', icon: <Zap className="w-5 h-5" /> },
  ];

  const techStack = [
    { name: 'React', icon: <Globe className="w-4 h-4" /> },
    { name: 'Node.js', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Redis', icon: <Zap className="w-4 h-4" /> },
    { name: 'PostgreSQL', icon: <Database className="w-4 h-4" /> },
    { name: 'Prisma', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'WebSockets', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Navbar Integration */}
      <Navbar variant="about" />

      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20" 
             style={{ backgroundImage: 'linear-gradient(#4f46e5 0.5px, transparent 0.5px), linear-gradient(90deg, #4f46e5 0.5px, transparent 0.5px)', backgroundSize: '80px 80px' }} />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Floating Chess Pieces Background */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
        {floatingPieces.map((piece, index) => (
          <motion.div
            key={index}
            initial={{ y: 0 }}
            animate={{ y: [0, -30, 0], x: [0, index % 2 === 0 ? 10 : -10, 0] }}
            transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
            className="absolute text-7xl font-serif text-indigo-900 dark:text-white"
            style={{ 
              top: `${10 + index * 15}%`, 
              left: `${5 + (index * 18) % 90}%`,
              opacity: 0.1
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <section className="relative z-10 pt-48 pb-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
          >
            <TrendingUp size={14} /> Modern Architecture
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Next-Gen <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-600 dark:from-indigo-400 dark:via-violet-400 dark:to-amber-400">
              Multiplayer Chess
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-12"
          >
            A high-performance gaming ecosystem built for real-time strategy, 
            seamless connectivity, and low-latency interaction.
          </motion.p>

          {/* New Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-indigo-500">{stat.icon}</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Developer Card Section */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-950 rounded-[3rem] p-8 md:p-12 overflow-hidden relative shadow-2xl"
        >
          {/* Internal Glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px]" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg">
                  👨‍💻
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Dhruvin Soni</h2>
                  <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Full-Stack Architect</p>
                </div>
              </div>

              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Passionate about pushing the boundaries of web technology. 
                Focusing on real-time systems, distributed databases, and clean, 
                intuitive user experiences.
              </p>

              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300">
                    <span className="text-indigo-400">{tech.icon}</span>
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { title: 'Real-Time Sync', desc: 'Move synchronization under 50ms.', icon: <Zap className="text-amber-400" /> },
                { title: 'Secure Scaling', desc: 'Distributed session management.', icon: <ShieldCheck className="text-emerald-400" /> },
                { title: 'Data Integrity', desc: 'Atomic PostgreSQL transactions.', icon: <Database className="text-indigo-400" /> },
              ].map((feat, i) => (
                <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex gap-4 hover:bg-white/10 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{feat.title}</h4>
                    <p className="text-slate-500 text-xs">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/30 transition-all"
          >
            <Play size={24} fill="white" />
            START PLAYING
          </motion.button>
        </div>
      </section>
    </div>
  );
}
