import { drivewayGates } from "@/data/drivewayGates";
import DrivewayGateProductCard from "./DrivewayGateProductCard";
import RacebandBanner from "./RacebandBanner";

const DrivewayGateSection = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <RacebandBanner title="Driveway Gates" subtitle="Premium steel gates — durability and easy installation" variant="primary" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {drivewayGates.map((gate, index) => (
            <DrivewayGateProductCard key={`${gate.model}-${gate.baseDimensions}-${index}`} gate={gate} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DrivewayGateSection;
