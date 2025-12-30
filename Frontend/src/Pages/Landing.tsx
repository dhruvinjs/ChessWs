import { Navbar, Footer, Hero, Testimonials } from '../Components';
import { Features } from '../Components/Features';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#EFEBE9] text-[#5D4037] flex flex-col scroll-smooth">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}
