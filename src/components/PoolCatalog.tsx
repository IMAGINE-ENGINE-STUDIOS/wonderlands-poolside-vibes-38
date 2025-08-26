
import React from "react";
import PoolProductCard from "./PoolProductCard";
import { poolModels } from "@/data/poolData";
import { spas } from "@/data/spaData";

// Export spas for other components
export { spas };

const PoolCatalog = () => {
  return (
    <section className="py-12 bg-white" data-pool-catalog-section>
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">
          Explore Our Pool Models
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poolModels.map((pool, index) => (
            <PoolProductCard
              key={pool.id || index}
              pool={{
                id: pool.id ?? pool.model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                model: pool.model,
                price: pool.price,
                category: pool.category,
                image: pool.image,
                dimensions: pool.dimensions,
                depth: pool.depth,
                features: pool.features
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoolCatalog;
