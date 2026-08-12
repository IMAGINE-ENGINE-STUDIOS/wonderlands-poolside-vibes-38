import { drivewayGates } from "@/data/drivewayGates";
import DrivewayGateProductCard from "./DrivewayGateProductCard";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";

const DrivewayGateSection = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <EditorialSectionHeader
          eyebrow="Volume XII — Entrance"
          title="Driveway Gates"
          description="Premium steel gates built for durability and a composed property entrance."
        />

        <ProductScrollRow className="mb-8">
          {drivewayGates.map((gate, index) => (
            <DrivewayGateProductCard key={`${gate.model}-${gate.baseDimensions}-${index}`} gate={gate} />
          ))}
        </ProductScrollRow>
      </div>
    </section>
  );
};

export default DrivewayGateSection;
