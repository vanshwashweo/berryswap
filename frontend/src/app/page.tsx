import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <FeatureGrid />
      <Footer />
    </div>
  );
}
