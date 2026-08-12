import { drivewayGates } from "@/data/drivewayGates";
import DrivewayGateProductCard from "./DrivewayGateProductCard";
import ProductScrollRow from "./ProductScrollRow";

const DrivewayGateSection = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Driveway Gates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium steel driveway gates designed for durability and easy installation. Transform your property entrance with our elegant and secure gate solutions.
          </p>
        </div>

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
