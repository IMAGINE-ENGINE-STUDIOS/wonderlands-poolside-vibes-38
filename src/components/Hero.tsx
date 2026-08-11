import * as React from "react";
const { useState } = React;
import SurveyQuoteTool from "./SurveyQuoteTool";
import AdvancedSearch from "./AdvancedSearch";
import HeroCategoryMarquee from "./HeroCategoryMarquee";
import wonderlandsLogo from "@/assets/wonderlands-logo.webp";

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  return <>
    <section className="relative w-full overflow-hidden bg-background">
      <div className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          {/* Wonderlands logo above the search bar */}
          <img
            src={wonderlandsLogo}
            alt="Wonderlands World"
            width={300}
            height={120}
            decoding="async"
            className="mb-8 h-20 w-auto object-contain md:h-28"
          />
          <div className="w-full max-w-2xl">
            <AdvancedSearch />
          </div>
        </div>
      </div>

      <HeroCategoryMarquee />
    </section>

    <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </>;
};
export default Hero;
