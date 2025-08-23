import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Hash, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Circle, 
  Upload,
  Eye,
  Save
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormBuilderProps {
  onSave: (fields: FormField[]) => void;
  initialFields?: FormField[];
}

const FormBuilder = ({ onSave, initialFields = [] }: FormBuilderProps) => {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'number', label: 'Number Input', icon: Hash },
    { type: 'email', label: 'Email Input', icon: Type },
    { type: 'date', label: 'Date Picker', icon: Calendar },
    { type: 'textarea', label: 'Long Text', icon: FileText },
    { type: 'select', label: 'Dropdown', icon: CheckSquare },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'radio', label: 'Radio Buttons', icon: Circle },
    { type: 'file', label: 'File Upload', icon: Upload },
  ];

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: type === 'textarea' ? 'Enter detailed information...' : `Enter ${type}...`,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };
    
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
    
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    if (selectedField?.id === id) {
      setSelectedField(null);
    }
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options, `Option ${field.options.length + 1}`];
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const renderFieldPreview = (field: FormField) => {
    const fieldClass = "w-full p-2 border border-border rounded-lg";
    
    switch (field.type) {
      case 'text':
      case 'email':
        return <Input type={field.type} placeholder={field.placeholder} className={fieldClass} />;
      case 'number':
        return <Input type="number" placeholder={field.placeholder} className={fieldClass} />;
      case 'date':
        return <Input type="date" className={fieldClass} />;
      case 'textarea':
        return <Textarea placeholder={field.placeholder} className={fieldClass} rows={3} />;
      case 'select':
        return (
          <Select>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'file':
        return <Input type="file" className={fieldClass} />;
      default:
        return <Input placeholder={field.placeholder} className={fieldClass} />;
    }
  };

  return (
    <div className="h-full flex">
      <Tabs value={previewMode ? 'preview' : 'builder'} className="flex-1">
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList>
            <TabsTrigger value="builder" onClick={() => setPreviewMode(false)}>
              Builder
            </TabsTrigger>
            <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={() => onSave(fields)} className="gap-2">
            <Save className="h-4 w-4" />
            Save Form
          </Button>
        </div>

        <div className="flex flex-1">
          {!previewMode && (
            <div className="w-64 border-r p-4 space-y-4 overflow-y-auto">
              <div>
                <h3 className="font-semibold mb-3">Field Types</h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <Button
                        key={fieldType.type}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addField(fieldType.type as FormField['type'])}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {fieldType.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex">
            <div className={previewMode ? "flex-1" : "flex-1 p-4"}>
              {previewMode ? (
                <TabsContent value="preview" className="flex-1 p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Form Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No fields added yet. Switch to Builder to add fields.
                        </div>
                      ) : (
                        fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="flex items-center gap-2">
                              {field.label}
                              {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.description && (
                              <p className="text-sm text-muted-foreground">{field.description}</p>
                            )}
                            {renderFieldPreview(field)}
                          </div>
                        ))
                      )}
                      {fields.length > 0 && (
                        <Button className="w-full">Submit Form</Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ) : (
                <TabsContent value="builder" className="flex-1">
                  <div className="h-full">
                    <div className="p-4">
                      <h3 className="font-semibold mb-4">Form Fields</h3>
                      
                      {fields.length === 0 ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Click on a field type from the sidebar to add it to your form
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className={`border rounded-lg p-4 bg-background ${
                                selectedField?.id === field.id ? 'border-primary' : 'border-border'
                              }`}
                              onClick={() => setSelectedField(field)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1 text-muted-foreground hover:text-foreground cursor-grab">
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{field.label}</span>
                                      {field.required && <Badge variant="destructive">Required</Badge>}
                                      <Badge variant="outline">{field.type}</Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteField(field.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground mb-3">
                                    {field.description || field.placeholder}
                                  </div>
                                  
                                  <div className="opacity-75 pointer-events-none">
                                    {renderFieldPreview(field)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>

            {!previewMode && selectedField && (
              <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
                <h3 className="font-semibold">Field Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Field Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      placeholder="Enter field label"
                    />
                  </div>

                  <div>
                    <Label>Placeholder Text</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={selectedField.description || ''}
                      onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                      placeholder="Add field description or instructions"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedField.required}
                      onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                    />
                    <Label>Required Field</Label>
                  </div>

                  {selectedField.options && (
                    <div>
                      <Label className="mb-2 block">Options</Label>
                      <div className="space-y-2">
                        {selectedField.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteOption(selectedField.id, index)}
                              disabled={selectedField.options!.length <= 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(selectedField.id)}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default FormBuilder;