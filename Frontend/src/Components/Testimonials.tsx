import { Star, Quote, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

export function Testimonials() {
  const testimonials = useMemo(
    () => [
      {
        quote: "Improved my strategy and results instantly!",
        author: "Alex H.",
        role: "Chess Enthusiast",
      },
      {
        quote:
          "This platform captures the feel of real chess with a clean interface and smart gameplay. Super impressive!",
        author: "Charlie T.",
        role: "Tournament Player",
      },
      {
        quote: "Fun, fast, and easy to use—love the 2-player matches!",
        author: "Bob K.",
        role: "Casual Player",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  // Auto-change every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Framer Motion variants for clean entry/exit
  const variants = {
    enter: { opacity: 0, y: 30 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/25 to-amber-400/25 dark:from-indigo-700/20 dark:to-amber-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-amber-300/20 dark:from-indigo-800/20 dark:to-amber-700/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-amber-100 dark:from-indigo-900/50 dark:to-amber-900/40 rounded-full border border-indigo-200 dark:border-indigo-800/50 backdrop-blur-sm mb-6">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
            Trusted by Chess Masters Worldwide
          </span>
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-10">
          What Players Are Saying
        </h2>

        {/* Testimonial Container */}
        <div className="relative max-w-3xl mx-auto h-[340px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 px-8 py-10 sm:px-10 sm:py-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between"
            >
              {/* Quote Icon */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-amber-500 p-4 rounded-2xl shadow-lg">
                  <Quote className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center mb-4 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-amber-400 fill-current mx-0.5"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic max-w-2xl mx-auto">
                “{testimonials[index].quote}”
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center mt-10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-amber-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-0 sm:mr-4 mb-4 sm:mb-0 shadow-md">
                  {testimonials[index].author.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {testimonials[index].author}
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {testimonials[index].role}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Navigation */}
        <div className="mt-10 flex justify-center space-x-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-gradient-to-r from-indigo-500 to-amber-500 scale-125"
                  : "bg-slate-400/40 hover:bg-slate-500/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
