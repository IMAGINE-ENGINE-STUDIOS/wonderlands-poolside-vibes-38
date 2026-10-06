import { useState } from "react";
import { Button } from "@/components/ui/button";
import SurveyQuoteTool from "./SurveyQuoteTool";
import solarRoofArray from "@/assets/solar/solar-roof-array.jpg";

const AdminQuoteTool = () => {
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const [solar, setSolar] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Quote Tool</h2>
        <p className="text-muted-foreground mb-6">
          Generate detailed pool installation quotes for customers
        </p>
        <Button 
          onClick={() => { setSolar(false); setShowQuoteTool(true); }}
          size="lg"
          className="px-8"
        >
          Open Quote Tool
        </Button>
        <Button onClick={() => { setSolar(true); setShowQuoteTool(true); }} size="lg" variant="outline" className="px-8 ml-3">
          Solar Quote
        </Button>
      </div>

      <SurveyQuoteTool
        pool={null}
        isOpen={showQuoteTool}
        onClose={() => setShowQuoteTool(false)}
        customProduct={solar ? { name: "Wonderlands Solar System", price: 0, type: "Solar", image: solarRoofArray } : undefined}
      />
    </div>
  );
};

export default AdminQuoteTool;