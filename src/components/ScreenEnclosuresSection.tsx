import React from "react";
import ImageCard from "@/components/ImageCard";

interface ScreenEnclosure {
  model: string;
  image: string;
  description: string;
}

interface ScreenEnclosuresSectionProps {
  enclosures: ScreenEnclosure[];
}

const ScreenEnclosuresSection: React.FC<ScreenEnclosuresSectionProps> = ({ enclosures }) => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center text-primary mb-8">
          Screen Enclosures
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enclosures.map((enclosure, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-md bg-card text-card-foreground"
            >
              <div className="aspect-w-4 aspect-h-3">
                <ImageCard
                  src={enclosure.image}
                  alt={enclosure.model}
                  className="w-full h-full"
                  enableZoom={false}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{enclosure.model}</h3>
                <p className="text-sm text-muted-foreground">{enclosure.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScreenEnclosuresSection;
