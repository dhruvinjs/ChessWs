import { Star, Quote, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    { 
      quote: "Improved my strategy and results instantly!", 
      author: "Alex H.",
      rating: 5,
      role: "Chess Enthusiast"
    },
    { 
      quote: "This platform captures the feel of real chess with a clean interface and smart gameplay. Super impressive!", 
      author: "Charlie T.",
      rating: 5,
      role: "Tournament Player"
    },
    { 
      quote: "Fun, fast, and easy to use—love the 2-player matches!", 
      author: "Bob K.",
      rating: 5,
      role: "Casual Player"
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 400);
    }, 5500);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleTestimonialClick = (index: number) => {
    if (index !== activeTestimonial) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTestimonial(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const decorativeChessPieces = ["♔", "♕", "♖", "♗", "♘", "♙"];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-amber-400/20 dark:from-indigo-700/20 dark:to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-amber-300/15 dark:from-indigo-800/25 dark:to-amber-700/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>

        {/* Floating chess pieces */}
        {decorativeChessPieces.map((piece, index) => (
          <div
            key={index}
            className="absolute text-6xl text-indigo-300/25 dark:text-indigo-600/30 animate-float-slow select-none"
            style={{
              top: `${10 + index * 12}%`,
              left: `${10 + (index * 10)}%`,
              animationDelay: `${index * 1.2}s`,
              animationDuration: `${6 + index * 0.5}s`,
            }}
          >
            {piece}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-amber-100 dark:from-indigo-900/50 dark:to-amber-900/40 rounded-full border border-indigo-200 dark:border-indigo-800/50 backdrop-blur-sm mb-6">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              Trusted by Chess Masters Worldwide
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            What Players Are Saying
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Join thousands of satisfied players who have elevated their chess game with our platform
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 lg:p-12 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all duration-500 hover:shadow-3xl">
              {/* Quote icon */}
              <div className="absolute -top-6 left-8">
                <div className="bg-gradient-to-r from-indigo-500 to-amber-500 p-4 rounded-2xl shadow-lg">
                  <Quote className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Animated quote content */}
              <div className={`pt-8 transform transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-6 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'}`}>
                <div className="flex items-center mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-amber-400 fill-current mr-1" />
                  ))}
                </div>

                <blockquote className="text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-8 italic">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-amber-400 rounded-2xl flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                    {testimonials[activeTestimonial].author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {testimonials[activeTestimonial].author}
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle glowing shapes */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-amber-400 rounded-lg rotate-45 animate-pulse opacity-60"></div>
            </div>
            <div className="absolute -left-4 bottom-8">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-300 to-amber-300 rounded-full animate-bounce opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center space-x-4">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => handleTestimonialClick(index)}
              className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                index === activeTestimonial
                  ? 'bg-gradient-to-r from-indigo-500 to-amber-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  index === activeTestimonial
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-r from-indigo-100 to-amber-100 dark:from-indigo-900/50 dark:to-amber-900/50 text-indigo-700 dark:text-indigo-400'
                }`}>
                  {testimonial.author.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-sm">{testimonial.author}</div>
                  <div className={`text-xs ${
                    index === activeTestimonial ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {index === activeTestimonial && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
              50K+
            </div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium">Happy Players</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
              4.9/5
            </div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
              Average Rating
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
              24/7
            </div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium">Player Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
