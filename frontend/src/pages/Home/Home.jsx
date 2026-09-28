import HeroSection from "./HeroSection";
import WhyChooseSection from "./WhyChooseSection"
import About from "../About/About";
import Help from "../Help/Help";
import "./Home.css";

function Home() {
  return (
    <>
      <HeroSection />
       <WhyChooseSection />
      <div id="about"><About /></div>
      <div id="help"><Help /></div>
    </>
  );
}

export default Home;
