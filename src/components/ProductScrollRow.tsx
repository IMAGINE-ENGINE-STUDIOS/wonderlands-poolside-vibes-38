import * as React from "react";

interface ProductScrollRowProps {
  children: React.ReactNode;
  className?: string;
}

const ProductScrollRow: React.FC<ProductScrollRowProps> = ({ children, className = "" }) => {
  const items = React.Children.toArray(children);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-auto scroll-smooth scrollbar-hide">
      <div className={`flex min-w-full snap-x snap-mandatory ${className}`}>
        {items.map((child, i) => (
          <div
            key={i}
            className="w-[calc(100vw/3)] min-w-[calc(100vw/3)] snap-start border-r border-border/60 bg-background last:border-r-0"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductScrollRow;
