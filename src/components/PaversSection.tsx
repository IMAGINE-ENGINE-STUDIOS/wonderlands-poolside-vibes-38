import { paverTypes } from "@/data/paverData";
import PaverProductCard from "./PaverProductCard";

const PaversSection = () => {
  // Get collections from the data
  const appianPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('appian')
  );
  
  const catalinaGranaPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('catalina-grana')
  );

  const catalinaPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('catalina') && !paver.id.toLowerCase().includes('catalina-grana')
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Premium Pool Pavers
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Transform your pool area with our premium paver collections, featuring multiple styles and finishes.
          </p>
        </div>

        {/* Appian Collection */}
        {appianPavers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-coral">Appian Collection</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium concrete pavers with multiple style options. Perfect for pool decks, patios, and walkways.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {appianPavers.map((paver) => (
                <PaverProductCard 
                  key={paver.id} 
                  paver={paver}
                />
              ))}
            </div>
          </div>
        )}

        {/* Catalina Grana Collection */}
        {catalinaGranaPavers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-teal">Catalina Grana Collection</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Contemporary Grana collection with refined textures and sophisticated styling. Ideal for modern pool environments.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalinaGranaPavers.map((paver) => (
                <PaverProductCard 
                  key={paver.id} 
                  paver={paver}
                />
              ))}
            </div>
          </div>
        )}

        {/* Catalina Collection */}
        {catalinaPavers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-primary">Catalina Collection</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Classic Catalina collection with elegant patterns and durable construction. Perfect for any pool area.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalinaPavers.map((paver) => (
                <PaverProductCard 
                  key={paver.id} 
                  paver={paver}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaversSection;