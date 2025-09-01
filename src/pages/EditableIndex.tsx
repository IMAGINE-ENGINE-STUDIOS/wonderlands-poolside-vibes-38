import { useContext } from "react";
import { useWebBuilderContext } from "@/hooks/useWebBuilder";
import EditableSection from "@/components/EditableSection";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import SpaCatalog from "@/components/SpaCatalog";
import TanningLedgeSection from "@/components/TanningLedgeSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
import Footer from "@/components/Footer";

const EditableIndex = () => {
  const builderContext = useWebBuilderContext();

  const handleSectionMove = (sectionId: string, direction: 'up' | 'down') => {
    builderContext.moveSection(sectionId, direction);
  };

  const handleSectionDelete = (sectionId: string) => {
    builderContext.deleteElement(sectionId);
  };

  const handleSectionEdit = (sectionId: string) => {
    const section = builderContext.elements.find(el => el.id === sectionId);
    if (section) {
      builderContext.selectElement(section);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <EditableSection
        sectionId="hero"
        sectionTitle="Hero Section"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('hero', direction)}
        onDelete={() => handleSectionDelete('hero')}
        onEdit={() => handleSectionEdit('hero')}
      >
        <Hero />
      </EditableSection>

      <div id="pools" />
      <EditableSection
        sectionId="pools"
        sectionTitle="Pool Catalog"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('pools', direction)}
        onDelete={() => handleSectionDelete('pools')}
        onEdit={() => handleSectionEdit('pools')}
      >
        <PoolCatalog />
      </EditableSection>

      <div id="spas" />
      <EditableSection
        sectionId="spas"
        sectionTitle="Spa Catalog"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('spas', direction)}
        onDelete={() => handleSectionDelete('spas')}
        onEdit={() => handleSectionEdit('spas')}
      >
        <SpaCatalog />
      </EditableSection>

      <EditableSection
        sectionId="tanning-ledge"
        sectionTitle="Tanning Ledge"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('tanning-ledge', direction)}
        onDelete={() => handleSectionDelete('tanning-ledge')}
        onEdit={() => handleSectionEdit('tanning-ledge')}
      >
        <TanningLedgeSection />
      </EditableSection>

      <div id="finishes" />
      <EditableSection
        sectionId="finishes"
        sectionTitle="Pool Finishes"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('finishes', direction)}
        onDelete={() => handleSectionDelete('finishes')}
        onEdit={() => handleSectionEdit('finishes')}
      >
        <PoolFinishesSection />
      </EditableSection>

      <div id="liners" />
      <EditableSection
        sectionId="liners"
        sectionTitle="Pool Liners"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('liners', direction)}
        onDelete={() => handleSectionDelete('liners')}
        onEdit={() => handleSectionEdit('liners')}
      >
        <LinersSection />
      </EditableSection>

      <div id="screen-enclosures" />
      <EditableSection
        sectionId="screen-enclosures"
        sectionTitle="Screen Enclosures"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('screen-enclosures', direction)}
        onDelete={() => handleSectionDelete('screen-enclosures')}
        onEdit={() => handleSectionEdit('screen-enclosures')}
      >
        <ScreenEnclosureSection />
      </EditableSection>

      <div id="pavers" />
      <EditableSection
        sectionId="pavers"
        sectionTitle="Pavers"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('pavers', direction)}
        onDelete={() => handleSectionDelete('pavers')}
        onEdit={() => handleSectionEdit('pavers')}
      >
        <PaversSection />
      </EditableSection>

      <div id="covers" />
      <EditableSection
        sectionId="covers"
        sectionTitle="Automatic Covers"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('covers', direction)}
        onDelete={() => handleSectionDelete('covers')}
        onEdit={() => handleSectionEdit('covers')}
      >
        <AutomaticCoversSection />
      </EditableSection>

      <EditableSection
        sectionId="footer"
        sectionTitle="Footer"
        isBuilderMode={builderContext.isBuilderMode}
        onMove={(direction) => handleSectionMove('footer', direction)}
        onDelete={() => handleSectionDelete('footer')}
        onEdit={() => handleSectionEdit('footer')}
      >
        <Footer />
      </EditableSection>
    </div>
  );
};

export default EditableIndex;