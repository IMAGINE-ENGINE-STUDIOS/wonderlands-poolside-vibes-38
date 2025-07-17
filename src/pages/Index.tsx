import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import FloatingElements from "@/components/FloatingElements";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <FloatingElements />
      <div className="relative z-10">
        <Hero />
        <PoolCatalog />
      </div>
    </div>
  );
};

export default Index;
