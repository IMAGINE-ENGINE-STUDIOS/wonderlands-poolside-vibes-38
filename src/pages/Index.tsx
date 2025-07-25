import Hero from "@/components/Hero";
import Header from "@/components/Header";
import PoolCatalog from "@/components/PoolCatalog";
import FloridaPoolElements from "@/components/FloridaPoolElements";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <Header />
      <FloridaPoolElements />
      <div className="relative z-10">
        <Hero />
        <PoolCatalog />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
