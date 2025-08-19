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
      }, 300);
    }, 5000);

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

  // Chess pieces for decoration
  const decorativeChessPieces = ["♔", "♕", "♖", "♗", "♘", "♙"];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-amber-950/10 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-300/20 to-orange-400/20 dark:from-amber-700/20 dark:to-orange-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-orange-300/15 to-amber-400/15 dark:from-orange-700/25 dark:to-amber-800/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        
        {/* Floating chess pieces */}
        {decorativeChessPieces.map((piece, index) => (
          <div
            key={index}
            className="absolute text-6xl text-amber-200/30 dark:text-amber-700/40 animate-float select-none"
            style={{
              top: `${15 + (index * 12)}%`,
              right: `${5 + (index * 15)}%`,
              animationDelay: `${index * 0.8}s`,
              animationDuration: `${4 + index * 0.3}s`,
            }}
          >
            {piece}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full border border-amber-200 dark:border-amber-700/50 backdrop-blur-sm mb-6">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Trusted by Chess Masters Worldwide
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-amber-900 dark:text-amber-100 mb-6">
            What Players Are Saying
          </h2>
          <p className="text-xl text-amber-700 dark:text-amber-300 max-w-3xl mx-auto">
            Join thousands of satisfied players who have elevated their chess game with our platform
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            {/* Main testimonial card */}
            <div className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-amber-900/20 p-8 lg:p-12 rounded-3xl shadow-2xl border border-amber-100 dark:border-amber-800/50 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
              {/* Quote icon */}
              <div className="absolute -top-6 left-8">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg">
                  <Quote className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Testimonial content */}
              <div className={`pt-8 transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                <div className="flex items-center mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-6 w-6 text-yellow-400 fill-current mr-1"
                    />
                  ))}
                </div>

                <blockquote className="text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-8 italic">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-xl font-bold mr-4">
                    {testimonials[activeTestimonial].author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {testimonials[activeTestimonial].author}
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg rotate-45 animate-pulse opacity-60"></div>
            </div>
            <div className="absolute -left-4 bottom-8">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-bounce opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center space-x-4">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => handleTestimonialClick(index)}
              className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                index === activeTestimonial
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  index === activeTestimonial
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-400'
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
              
              {/* Active indicator */}
              {index === activeTestimonial && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2 group-hover:scale-110 transition-transform">
              50K+
            </div>
            <div className="text-amber-700 dark:text-amber-300 font-medium">Happy Players</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2 group-hover:scale-110 transition-transform">
              4.9/5
            </div>
            <div className="text-amber-700 dark:text-amber-300 font-medium flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              Average Rating
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2 group-hover:scale-110 transition-transform">
              24/7
            </div>
            <div className="text-amber-700 dark:text-amber-300 font-medium">Player Support</div>
          </div>
        </div>
      </div>

      {/* Custom CSS for float animation */}
      <div className="animate-float">♔</div>
    </section>
  );
}