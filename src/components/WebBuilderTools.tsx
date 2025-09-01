import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, 
  Image, 
  MousePointer, 
  Package, 
  Grid3X3, 
  Layout, 
  Plus,
  Search,
  Undo,
  Redo,
  Save,
  Eye,
  Settings
} from 'lucide-react';
import { EditableElement } from '@/hooks/useWebBuilder';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  description?: string;
}

interface WebBuilderToolsProps {
  products: Product[];
  onAddElement: (element: EditableElement) => void;
  onAddSection: (sectionType: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  className?: string;
}

const WebBuilderTools: React.FC<WebBuilderToolsProps> = ({
  products = [],
  onAddElement,
  onAddSection,
  onUndo,
  onRedo,
  onSave,
  canUndo,
  canRedo,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const buttonStyles = [
    { name: 'Primary', style: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md' },
    { name: 'Secondary', style: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md' },
    { name: 'Outline', style: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md' },
    { name: 'Ghost', style: 'hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md' },
    { name: 'Link', style: 'text-primary underline-offset-4 hover:underline px-4 py-2' },
    { name: 'Rounded', style: 'bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full' },
    { name: 'Square', style: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2' }
  ];

  const sectionTypes = [
    { id: 'hero', name: 'Hero Section', description: 'Large banner with call-to-action' },
    { id: 'gallery', name: 'Product Gallery', description: 'Grid of product cards' },
    { id: 'content', name: 'Content Section', description: 'Text and images' },
    { id: 'features', name: 'Features', description: 'Feature highlights' },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews' },
    { id: 'contact', name: 'Contact Form', description: 'Contact information and form' }
  ];

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'pool', label: 'Swimming Pools' },
    { value: 'spa', label: 'Spas' },
    { value: 'liner', label: 'Pool Liners' },
    { value: 'tile', label: 'Pool Tiles' },
    { value: 'finish', label: 'Pool Finishes' },
    { value: 'cover', label: 'Pool Covers' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addTextElement = () => {
    const element: EditableElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Click to edit text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      styles: 'p-4 bg-background border border-border rounded-md text-foreground'
    };
    onAddElement(element);
  };

  const addHeadingElement = () => {
    const element: EditableElement = {
      id: `heading-${Date.now()}`,
      type: 'text',
      content: 'New Heading',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 60 },
      styles: 'text-2xl font-bold text-foreground p-4'
    };
    onAddElement(element);
  };

  const addButtonElement = (buttonStyle: typeof buttonStyles[0]) => {
    const element: EditableElement = {
      id: `button-${Date.now()}`,
      type: 'button',
      content: 'Click Me',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 40 },
      styles: buttonStyle.style
    };
    onAddElement(element);
  };

  const addProductElement = (product: Product) => {
    const element: EditableElement = {
      id: `product-${Date.now()}`,
      type: 'product',
      content: product.name,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 400 },
      productData: [product]
    };
    onAddElement(element);
  };

  const addProductGallery = () => {
    const element: EditableElement = {
      id: `gallery-${Date.now()}`,
      type: 'gallery',
      content: 'Product Gallery',
      position: { x: 100, y: 100 },
      size: { width: 800, height: 400 },
      productData: []
    };
    onAddElement(element);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Builder Tools
          </CardTitle>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={onSave}
              title="Save Changes"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="elements" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto p-3"
                onClick={addTextElement}
              >
                <Type className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Text</div>
                  <div className="text-xs text-muted-foreground">Add text block</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto p-3"
                onClick={addHeadingElement}
              >
                <Type className="h-4 w-4 font-bold" />
                <div className="text-left">
                  <div className="font-medium text-sm">Heading</div>
                  <div className="text-xs text-muted-foreground">Add heading</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto p-3"
                onClick={() => {}}
              >
                <Image className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Image</div>
                  <div className="text-xs text-muted-foreground">Upload image</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto p-3"
                onClick={addProductGallery}
              >
                <Grid3X3 className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Gallery</div>
                  <div className="text-xs text-muted-foreground">Product grid</div>
                </div>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="buttons" className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {buttonStyles.map((buttonStyle) => (
                <Button
                  key={buttonStyle.name}
                  variant="outline"
                  className="flex items-center justify-between h-auto p-3"
                  onClick={() => addButtonElement(buttonStyle)}
                >
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    <span className="font-medium text-sm">{buttonStyle.name}</span>
                  </div>
                  <div className={`px-2 py-1 text-xs ${buttonStyle.style}`}>
                    Sample
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="w-full flex items-center justify-between h-auto p-3"
                    onClick={() => addProductElement(product)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(product));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium text-sm truncate max-w-32">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${product.price?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </Button>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No products found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-4">
            <div className="space-y-2">
              {sectionTypes.map((section) => (
                <Button
                  key={section.id}
                  variant="outline"
                  className="w-full flex items-center gap-2 h-auto p-3"
                  onClick={() => onAddSection(section.id)}
                >
                  <Layout className="h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{section.name}</div>
                    <div className="text-xs text-muted-foreground">{section.description}</div>
                  </div>
                  <Plus className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WebBuilderTools;