
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PoolProductCard from "@/components/PoolProductCard";

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
}

const poolSchema = z.object({
  model: z.string().min(2, {
    message: "Pool model must be at least 2 characters.",
  }),
  price: z.number().min(1, {
    message: "Pool price must be at least 1.",
  }),
  category: z.enum(['premium', 'deluxe', 'standard', 'compact']),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  dimensions: z.string().optional(),
  depth: z.string().optional(),
  features: z.array(z.string()).optional(),
  installationTimeWeeks: z.number().optional(),
  warrantyYears: z.string().optional(),
  heater: z.boolean().optional(),
  saltSystem: z.boolean().optional(),
  carbonFiber: z.boolean().optional(),
  finishes: z.array(z.string()).optional(),
  liners: z.array(z.string()).optional(),
  covers: z.array(z.string()).optional(),
});

type PoolFormData = z.infer<typeof poolSchema>;

const StandardizedProductManager = () => {
  const [editedPool, setEditedPool] = useState<Pool>({
    model: "",
    price: 0,
    category: "standard",
    image: "",
    dimensions: "",
    depth: "",
    features: [],
    galaPoints: 0,
    galaCategory: "",
    installationTimeWeeks: 0,
    warrantyYears: "",
    heater: false,
    saltSystem: false,
    carbonFiber: false,
    finishes: [],
    liners: [],
    covers: [],
  });

  const poolForm = useForm<PoolFormData>({
    resolver: zodResolver(poolSchema),
    defaultValues: {
      model: editedPool.model,
      price: editedPool.price,
      category: editedPool.category,
      image: editedPool.image || "",
      dimensions: editedPool.dimensions || "",
      depth: editedPool.depth || "",
      features: editedPool.features || [],
      installationTimeWeeks: editedPool.installationTimeWeeks || 0,
      warrantyYears: editedPool.warrantyYears || "",
      heater: editedPool.heater || false,
      saltSystem: editedPool.saltSystem || false,
      carbonFiber: editedPool.carbonFiber || false,
      finishes: editedPool.finishes || [],
      liners: editedPool.liners || [],
      covers: editedPool.covers || [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    poolForm.reset({
      model: editedPool.model,
      price: editedPool.price,
      category: editedPool.category,
      image: editedPool.image || "",
      dimensions: editedPool.dimensions || "",
      depth: editedPool.depth || "",
      features: editedPool.features || [],
      installationTimeWeeks: editedPool.installationTimeWeeks || 0,
      warrantyYears: editedPool.warrantyYears || "",
      heater: editedPool.heater || false,
      saltSystem: editedPool.saltSystem || false,
      carbonFiber: editedPool.carbonFiber || false,
      finishes: editedPool.finishes || [],
      liners: editedPool.liners || [],
      covers: editedPool.covers || [],
    });
  }, [editedPool, poolForm]);

  const { toast } = useToast();

  const handlePoolSubmit = (values: PoolFormData) => {
    const updatedPool: Pool = {
      model: values.model,
      price: values.price,
      category: values.category,
      image: values.image,
      dimensions: values.dimensions,
      depth: values.depth,
      features: values.features,
      installationTimeWeeks: values.installationTimeWeeks,
      warrantyYears: values.warrantyYears,
      heater: values.heater,
      saltSystem: values.saltSystem,
      carbonFiber: values.carbonFiber,
      finishes: values.finishes,
      liners: values.liners,
      covers: values.covers,
    };
    
    setEditedPool(updatedPool);
    toast({
      title: "Success!",
      description: "Pool details have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Standardized Product Manager</h2>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Edit Pool Details</h3>
        <Form {...poolForm}>
          <form
            onSubmit={poolForm.handleSubmit(handlePoolSubmit)}
            className="space-y-4"
          >
            <FormField
              control={poolForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Pool Model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={poolForm.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Pool Price"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={poolForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={poolForm.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={poolForm.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Pool Dimensions"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={poolForm.control}
              name="depth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depth</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Pool Depth"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Pool</Button>
          </form>
        </Form>
      </div>
      
      {/* Pool Configuration Preview */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Pool Configuration Preview</h3>
        <div className="max-w-md">
          <PoolProductCard
            pool={{
              model: editedPool.model,
              price: editedPool.price,
              category: editedPool.category,
              image: editedPool.image,
              dimensions: editedPool.dimensions,
              depth: editedPool.depth,
              features: editedPool.features
            }}
            onViewDetails={() => {}}
            onRequestQuote={() => {}}
            isAdmin={true}
          />
        </div>
      </div>
    </div>
  );
};

export default StandardizedProductManager;
