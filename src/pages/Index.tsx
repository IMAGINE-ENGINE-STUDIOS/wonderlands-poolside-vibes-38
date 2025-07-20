import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import FloridaPoolElements from "@/components/FloridaPoolElements";
import Footer from "@/components/Footer";
import { GalaGoodsLogin } from "@/components/GalaGoodsLogin";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <GalaGoodsLogin />
      <FloridaPoolElements />
      <div className="relative z-10">
        <Hero />
        <PoolCatalog />
        <LinersSection />
        <AutomaticCoversSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
