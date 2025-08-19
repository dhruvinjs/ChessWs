import { Globe, Zap, Trophy } from 'lucide-react';

export function Features(){
  const features = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Multiplayer',
      description: 'Play against millions of players worldwide with our advanced matchmaking system.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Lightning Fast',
      description: 'Ultra-low latency gaming experience with real-time synchronization.'
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Tournaments',
      description: 'Join daily tournaments and compete for prizes and rankings.'
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            Everything You Need to Master Chess
          </h2>
          <p className="text-xl text-amber-600 dark:text-amber-300 max-w-3xl mx-auto">
            Our platform provides all the tools and features you need to improve your game 
            and enjoy chess at the highest level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100 dark:border-amber-800"
            >
              <div className="text-amber-700 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

