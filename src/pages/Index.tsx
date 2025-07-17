import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import FloridaPoolElements from "@/components/FloridaPoolElements";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <FloridaPoolElements />
      <div className="relative z-10">
        <Hero />
        <PoolCatalog />
      </div>
    </div>
  );
};

export default Index;
