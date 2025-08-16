import { Button, Card, Navbar, Footer } from "../Components";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { FaArrowRight } from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { Features } from "../Components/Features";

export function Landing() {
  const navigate = useNavigate();

  const testimonials = [
    { quote: "Improved my strategy and results instantly!", author: "Alex H." },
    { quote: "This platform captures the feel of real chess with a clean interface and smart gameplay. Super impressive!", author: "Charlie T." },
    { quote: "Fun, fast, and easy to use—love the 2-player matches!", author: "Bob K." },
  ];




  return (
    <div className="min-h-screen bg-[#EFEBE9] text-[#5D4037] flex flex-col">
      <Navbar />

    <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-16">
        <img
          src={logo}
          alt="Chess"
          className="w-64 rounded-lg shadow-md cursor-pointer"
          onClick={() => navigate("/game")}
        />

        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold">
            Master the Game of <span className="text-[#BF360C]">Kings</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#5D4037]/80">
            Play online, get coached by grandmasters, and challenge friends in real-time matches.
          </p>

          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
            <Button
              variant="primary"
              size="md"
              text="Play Online"
              icon={<FaArrowRight size={18} />}
              onClick={() => navigate("/room")}
            />
            <Button
              variant="secondary"
              size="md"
              text="Create Free Room"
              icon={<MdMeetingRoom size={18} />}
              onClick={()=>{}}
              className="bg-[#A1887F] hover:bg-[#8D6E63]"

            />
          </div>
        </div>
      </div>

      <section className="py-12 bg-[#7a574a]">
        <Features/>
      </section>

      <section className="py-12 px-6">
        <h2 className="text-xl font-bold text-center mb-6">What Our Players Say</h2>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="flex-1 p-6 bg-white">
              <p className="italic text-xl text-center">"{t.quote}"</p>
              <span className="block mt-4 font-semibold text-center">{t.author}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-12 bg-[#] text-center px-6">
        <div className="max-w-xl mx-auto bg-[#7a574a] text-white p-6 rounded-lg flex justify-center items-center flex-col">
          <h3 className="text-lg font-semibold mb-2">Ready to Improve Your Game?</h3>
          <p className="mb-4 text-sm text-white">
            Sign up free, start playing, and unlock grandmaster coaching.
          </p>
          <div className="">
          <Button
            variant="primary"
            size="md"
            text="Get Started"
            icon={<FaArrowRight size={16} />}
            className="bg-[#A1887F] hover:bg-[#8D6E63]"
            onClick={() => navigate("/game")}
          />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
