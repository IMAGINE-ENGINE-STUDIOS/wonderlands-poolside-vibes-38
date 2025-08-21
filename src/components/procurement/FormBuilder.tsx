import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  List, 
  CheckSquare, 
  AlignLeft,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface CustomField {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea';
  title: string;
  options?: string[];
  required: boolean;
}

interface FormBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

const FormBuilder = ({ fields, onChange }: FormBuilderProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: AlignLeft },
    { value: 'select', label: 'Multiple Choice', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare }
  ];

  const addField = (type: string) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      type: type as CustomField['type'],
      title: `New ${type} field`,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      required: false
    };
    onChange([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
    setEditingField(null);
  };

  const addOption = (fieldId: string) => {
    if (!newOption.trim()) return;
    
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, newOption.trim()]
      });
    }
    setNewOption('');
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onChange(newFields);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Form Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Field Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fieldTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant="outline"
                className="glass-button h-auto p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                onClick={() => addField(type.value)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Field List */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-border/30 procurement-slide-up">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="cursor-grab hover:cursor-grabbing text-muted-foreground mt-2">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Field Header */}
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {fieldTypes.find(t => t.value === field.type)?.label}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Required</Label>
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                      </div>
                      
                      <div className="flex gap-1 ml-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                        >
                          {editingField === field.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeField(field.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Field Title */}
                    {editingField === field.id ? (
                      <Input
                        value={field.title}
                        onChange={(e) => updateField(field.id, { title: e.target.value })}
                        className="font-medium"
                        placeholder="Field title"
                      />
                    ) : (
                      <h4 className="font-medium text-foreground">{field.title}</h4>
                    )}

                    {/* Field-Specific Controls */}
                    {field.type === 'select' && (
                      <div className="space-y-3">
                        <Label className="text-sm">Options</Label>
                        <div className="space-y-2">
                          {field.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="flex-1"
                                disabled={editingField !== field.id}
                              />
                              {editingField === field.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeOption(field.id, optionIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          {editingField === field.id && (
                            <div className="flex items-center gap-2">
                              <Input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                placeholder="Add new option"
                                className="flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && addOption(field.id)}
                              />
                              <Button
                                size="sm"
                                onClick={() => addOption(field.id)}
                                disabled={!newOption.trim()}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Field Preview */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                      {field.type === 'text' && (
                        <Input placeholder={field.title} disabled className="bg-background/50" />
                      )}
                      {field.type === 'textarea' && (
                        <Textarea placeholder={field.title} disabled className="bg-background/50" />
                      )}
                      {field.type === 'select' && (
                        <Select disabled>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder={`Select ${field.title}`} />
                          </SelectTrigger>
                        </Select>
                      )}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" disabled className="rounded" />
                          <Label className="text-sm">{field.title}</Label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No custom fields yet</p>
              <p className="text-sm">Add custom fields to collect specific information from proposers</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormBuilder;