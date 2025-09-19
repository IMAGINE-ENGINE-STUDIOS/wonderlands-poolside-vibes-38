import { useState } from "react";
import { Button } from "@/components/ui/button";
import SurveyQuoteTool from "./SurveyQuoteTool";

const AdminQuoteTool = () => {
  const [showQuoteTool, setShowQuoteTool] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Quote Tool</h2>
        <p className="text-muted-foreground mb-6">
          Generate detailed pool installation quotes for customers
        </p>
        <Button 
          onClick={() => setShowQuoteTool(true)}
          size="lg"
          className="px-8"
        >
          Open Quote Tool
        </Button>
      </div>

      <SurveyQuoteTool
        pool={null}
        isOpen={showQuoteTool}
        onClose={() => setShowQuoteTool(false)}
      />
    </div>
  );
};

export default AdminQuoteTool;