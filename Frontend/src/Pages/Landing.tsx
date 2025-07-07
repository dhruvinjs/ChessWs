
import { motion } from "framer-motion";
import {    ArrowRight } from "lucide-react";
import { Button, Card, Navbar } from "../Components";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.jpg'
import { Footer } from "../Components";
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

export function Landing() {
  const navigate = useNavigate();
    
  const testimonials = [
    { quote: "Improved my strategy and results instantly!", author: "Alex H." },
    { quote: "This platform captures the feel of real chess with a clean interface and smart gameplay. Super impressive!", author: "Charlie T."},
    { quote: "Fun, fast, and easy to use—love the 2-player matches!", author: "Bob K." },
  ];

  const features = [
    { title: "🏆 Expert Coaching", subtitle: "Get personal feedback from grandmasters." },
    { title: "⚔️ 2-Player Matches ⚔️", subtitle: "Challenge friends or find opponents online." },
  ];
   
  return (
    <div className="min-h-screen bg-[#EFEBE9] text-[#5D4037]">
      <Navbar />

        
      <div className="flex gap-6 items-center justify-center">
      <div className="flex items-center justify-center mt-16">
        <motion.img
          src={logo} 
          alt="Chess"
          className="w-96 h-auto cursor-pointer rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/game")}
        />
        </div>
      <section className="pt-24 pb-16 px-6 text-center">
        <motion.h1
          initial="hidden" whileInView="visible" variants={fadeIn} custom={0}
          className="text-5xl md:text-6xl font-bold font-serif leading-tight"
          >
          Master the Game of <span className="text-[#BF360C]">Kings</span>
        </motion.h1>
        <motion.p
          initial="hidden" whileInView="visible" variants={fadeIn} custom={1}
          className="mt-4 text-lg md:text-xl text-[#5D4037]/80 max-w-xl mx-auto"
        >
          Play online, get coached by grandmasters, and challenge friends in real-time matches.
        </motion.p>
        {/* add the jwt auth secure here */}
        <motion.div
          initial="hidden" whileInView="visible" variants={fadeIn} custom={2}
          className="mt-8 flex justify-center gap-4"
          >
          <Button
            variant="primary" size="md" text="Play Now"
            icon={<ArrowRight size={20} />}
            className="bg-[#A1887F] hover:bg-[#8D6E63]"
            onClick={() => navigate("/room")}
            />
          <Button
            variant="outline" size="lg" text="Play with bots"
            icon={<ArrowRight size={20} />}
            className="font-semibold border border-[#A1887F] text-[#A1887F] hover:bg-[#D7CCC8]"
            onClick={() => {}}
            />
        </motion.div>
      </section>
      </div>

      <section className="py-16 px-6 bg-[#D7CCC8]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden" whileInView="visible" variants={fadeIn} custom={i}
            >
              <Card className="p-4 bg-[#BCAAA4] text-[#5D4037]">
                <h3 className="font-semibold text-xl">{f.title}</h3>
                <p className="mt-2 text-[#5D4037]/80">{f.subtitle}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#EFEBE9] py-12 px-6">
        <h2 className="text-2xl font-bold text-center mb-8">What Our Players Say</h2>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" variants={fadeIn} custom={i}
              className="flex-1"
            >
              <Card className="w-full md:w-auto p-6 bg-white">
                <p className="italic text-sm mt-5">"{t.quote}"</p>
                <span className="font-semibold mt-4 block">{t.author}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#D7CCC8] text-center">
        <motion.div
          initial="hidden" whileInView="visible" variants={fadeIn} custom={0}
          className="max-w-2xl mx-auto bg-[#BCAAA4] p-8 rounded-xl"
        >
          <h3 className="text-2xl font-semibold mb-4 text-[#5D4037]">
            Ready to Improve Your Game?
          </h3>
          <p className="mb-6  text-[#5D4037]/80">
            Sign up free, start playing, and unlock grandmaster coaching.
          </p>
          <div className="flex justify-center items-center gap-4">
          <Button
          variant="primary"
          size="sm"
          text="Get Started"
          icon={<ArrowRight size={16} />}
          className="bg-[#A1887F] hover:bg-[#8D6E63] whitespace-nowrap"
          onClick={() => navigate("/game")}
        />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
