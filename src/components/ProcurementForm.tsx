import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, MapPin, Package, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProcurementForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    requirements: [] as string[],
    newRequirement: ''
  });
  
  const [loading, setLoading] = useState(false);

  const categories = [
    'Pool Installation', 'Spa Installation', 'Pool Maintenance', 'Pool Repair',
    'Landscaping', 'Plumbing', 'Electrical', 'Concrete Work', 'Tile Work',
    'Equipment Supply', 'Chemical Supply', 'Custom Design', 'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (formData.newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, prev.newRequirement.trim()],
        newRequirement: ''
      }));
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert job posting
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
          budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : null,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      // Insert requirements if any
      if (formData.requirements.length > 0) {
        const requirementsData = formData.requirements.map((req, index) => ({
          job_id: data.id,
          requirement_text: req,
          is_mandatory: true,
          order_index: index
        }));

        const { error: reqError } = await supabase
          .from('job_requirements')
          .insert(requirementsData);

        if (reqError) throw reqError;
      }

      toast.success('Procurement opportunity created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        location: '',
        budgetMin: '',
        budgetMax: '',
        deadline: '',
        requirements: [],
        newRequirement: ''
      });

    } catch (error) {
      console.error('Error creating procurement opportunity:', error);
      toast.error('Failed to create procurement opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Procurement Opportunity Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Pool Installation - Residential"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the project requirements, scope, and any specific details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Min Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="5000"
                  value={formData.budgetMin}
                  onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Max Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="15000"
                  value={formData.budgetMax}
                  onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Project Deadline</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Project Requirements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a requirement..."
                value={formData.newRequirement}
                onChange={(e) => handleInputChange('newRequirement', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} variant="outline">
                Add
              </Button>
            </div>
            
            {formData.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((requirement, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {requirement}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Users className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Post Opportunity
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProcurementForm;