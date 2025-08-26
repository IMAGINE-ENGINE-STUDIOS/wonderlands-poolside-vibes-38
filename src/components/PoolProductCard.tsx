import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import ImageCard from "@/components/ImageCard";

const PoolSchema = z.object({
  model: z.string().min(2, {
    message: "Pool model must be at least 2 characters.",
  }),
  dimensions: z.string().min(2, {
    message: "Pool dimensions must be at least 2 characters.",
  }),
  depth: z.string().min(2, {
    message: "Pool depth must be at least 2 characters.",
  }),
  price: z.number().min(1, {
    message: "Pool price must be at least 1.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const FinishSchema = z.object({
  name: z.string().min(2, {
    message: "Finish name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Finish description must be at least 2 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const TileSchema = z.object({
  name: z.string().min(2, {
    message: "Tile name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Tile description must be at least 2 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const LinerSchema = z.object({
  name: z.string().min(2, {
    message: "Liner name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Liner description must be at least 2 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const PaverSchema = z.object({
  name: z.string().min(2, {
    message: "Paver name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Paver description must be at least 2 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

interface Pool {
  model: string;
  dimensions: string;
  depth: string;
  price: number;
  image: string;
}

interface Finish {
  name: string;
  description: string;
  image: string;
}

interface Tile {
  name: string;
  description: string;
  image: string;
}

interface Liner {
  name: string;
  description: string;
  image: string;
}

interface Paver {
  name: string;
  description: string;
  image: string;
}

interface ExternalPoolProps {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
}

interface PoolProductCardProps {
  pool?: ExternalPoolProps;
  onViewDetails?: (pool: ExternalPoolProps) => void;
  onRequestQuote?: (pool: ExternalPoolProps, extras?: any) => void;
  isAdmin?: boolean;
}

const PoolProductCard: React.FC<PoolProductCardProps> = ({ pool: incomingPool, onViewDetails, onRequestQuote, isAdmin }) => {
  // Default starter values for internal configurator
  const defaultPoolImage =
    "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/f0ee9d81-bffb-4340-8f6e-c2090e67204e.png";
  const defaultDimensions = "16 x 32";
  const defaultDepth = "3.5 - 7.5";

  // Use incoming pool if provided (from catalogs), otherwise fall back to defaults
  const initialPool: Pool = {
    model: incomingPool?.model || "The Laguna",
    dimensions: incomingPool?.dimensions || defaultDimensions,
    depth: incomingPool?.depth || defaultDepth,
    price: incomingPool?.price ?? 65000,
    image: incomingPool?.image || defaultPoolImage,
  };

  const [pool, setPool] = useState<Pool>(initialPool);

  const [finishes, setFinishes] = useState<Finish[]>([
    {
      name: "Pebble Brilliance",
      description:
        "A stunning finish that combines natural pebbles with vibrant glass beads for a luxurious, shimmering effect.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png",
    },
    {
      name: "Hydrazzo Classico",
      description:
        "A smooth, classic finish made from a blend of marble, white cement, and proprietary additives for exceptional durability and beauty.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png",
    },
    {
      name: "QuartzScapes",
      description:
        "A premium blend of crushed quartz and polymer-modified cement, offering a wide range of colors and a naturally non-slip surface.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png",
    },
  ]);
  const [selectedFinish, setSelectedFinish] = useState<Finish>(finishes[0]);
  const [tiles, setTiles] = useState<Tile[]>([
    {
      name: "Porcelain Mosaic",
      description:
        "Durable and elegant, these tiles come in a variety of patterns and colors, perfect for adding a touch of sophistication to your pool.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png",
    },
    {
      name: "Glass Tile Accents",
      description:
        "Add a touch of luxury with shimmering glass tiles, available in a range of colors and sizes to create stunning visual effects.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png",
    },
    {
      name: "Natural Stone Tiles",
      description:
        "Bring the beauty of nature to your pool with these unique stone tiles, offering a rustic and organic look.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png",
    },
  ]);
  const [selectedTile, setSelectedTile] = useState<Tile>(tiles[0]);
  const [liners, setLiners] = useState<Liner[]>([
    {
      name: "Heavy-Duty Vinyl Liner",
      description:
        "A durable and cost-effective option, these liners come in a variety of patterns and colors to suit any pool design.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/3929943c-2e46-426f-b155-3d79c96d7eb4.png",
    },
    {
      name: "Reinforced PVC Liner",
      description:
        "Offering enhanced strength and resistance to chemicals and UV rays, these liners are a great choice for long-lasting performance.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png",
    },
    {
      name: "Custom Patterned Liner",
      description:
        "Create a unique look with a custom-designed liner, featuring your choice of colors, patterns, and even logos.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png",
    },
  ]);
  const [selectedLiner, setSelectedLiner] = useState<Liner>(liners[0]);
  const [pavers, setPavers] = useState<Paver[]>([
    {
      name: "Travertine Pavers",
      description:
        "Elegant and durable, travertine pavers offer a natural stone look that complements any pool design.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png",
    },
    {
      name: "Concrete Pavers",
      description:
        "A versatile and cost-effective option, concrete pavers come in a variety of shapes, colors, and textures.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.png",
    },
    {
      name: "Brick Pavers",
      description:
        "Add a touch of classic charm with brick pavers, offering a timeless look and exceptional durability.",
      image:
        "https://wonderlands-poolside-vibes.lovable.app/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.png",
    },
  ]);
  const [selectedPaver, setSelectedPaver] = useState<Paver>(pavers[0]);

  const poolForm = useForm<z.infer<typeof PoolSchema>>({
    resolver: zodResolver(PoolSchema),
    defaultValues: pool,
    mode: "onChange",
  });
  const finishForm = useForm<z.infer<typeof FinishSchema>>({
    resolver: zodResolver(FinishSchema),
    defaultValues: // will be reset below
      undefined as any,
    mode: "onChange",
  });
  const tileForm = useForm<z.infer<typeof TileSchema>>({
    resolver: zodResolver(TileSchema),
    defaultValues: // will be reset below
      undefined as any,
    mode: "onChange",
  });
  const linerForm = useForm<z.infer<typeof LinerSchema>>({
    resolver: zodResolver(LinerSchema),
    defaultValues: // will be reset below
      undefined as any,
    mode: "onChange",
  });
  const paverForm = useForm<z.infer<typeof PaverSchema>>({
    resolver: zodResolver(PaverSchema),
    defaultValues: // will be reset below
      undefined as any,
    mode: "onChange",
  });

  useEffect(() => {
    poolForm.reset(pool);
  }, [pool]);

  useEffect(() => {
    finishForm.reset(selectedFinish);
  }, [selectedFinish]);

  useEffect(() => {
    tileForm.reset(selectedTile);
  }, [selectedTile]);

  useEffect(() => {
    linerForm.reset(selectedLiner);
  }, [selectedLiner]);

  useEffect(() => {
    paverForm.reset(selectedPaver);
  }, [selectedPaver]);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Ensure fully-typed objects are passed to state setters
  const handlePoolSubmit = (values: z.infer<typeof PoolSchema>) => {
    const strictValues: Pool = {
      model: values.model,
      dimensions: values.dimensions,
      depth: values.depth,
      price: Number(values.price),
      image: values.image,
    };
    setPool(strictValues);
    toast({
      title: "Success!",
      description: "Pool details have been updated.",
    });
  };

  const handleFinishSubmit = (values: z.infer<typeof FinishSchema>) => {
    const strict: Finish = {
      name: values.name,
      description: values.description,
      image: values.image,
    };
    setSelectedFinish(strict);
    const newFinishes: Finish[] = finishes.map((finish) =>
      finish.name === selectedFinish.name ? strict : finish
    );
    setFinishes(newFinishes);
    toast({
      title: "Success!",
      description: "Finish details have been updated.",
    });
  };

  const handleTileSubmit = (values: z.infer<typeof TileSchema>) => {
    const strict: Tile = {
      name: values.name,
      description: values.description,
      image: values.image,
    };
    setSelectedTile(strict);
    const newTiles: Tile[] = tiles.map((tile) =>
      tile.name === selectedTile.name ? strict : tile
    );
    setTiles(newTiles);
    toast({
      title: "Success!",
      description: "Tile details have been updated.",
    });
  };

  const handleLinerSubmit = (values: z.infer<typeof LinerSchema>) => {
    const strict: Liner = {
      name: values.name,
      description: values.description,
      image: values.image,
    };
    setSelectedLiner(strict);
    const newLiners: Liner[] = liners.map((liner) =>
      liner.name === selectedLiner.name ? strict : liner
    );
    setLiners(newLiners);
    toast({
      title: "Success!",
      description: "Liner details have been updated.",
    });
  };

  const handlePaverSubmit = (values: z.infer<typeof PaverSchema>) => {
    const strict: Paver = {
      name: values.name,
      description: values.description,
      image: values.image,
    };
    setSelectedPaver(strict);
    const newPavers: Paver[] = pavers.map((paver) =>
      paver.name === selectedPaver.name ? strict : paver
    );
    setPavers(newPavers);
    toast({
      title: "Success!",
      description: "Paver details have been updated.",
    });
  };

  const handleCreateQuote = () => {
    const id = Date.now();
    sessionStorage.setItem(
      `quote:${id}`,
      JSON.stringify({
        type: "pool",
        pool: {
          ...pool,
          finish: selectedFinish,
          tile: selectedTile,
          liner: selectedLiner,
          paver: selectedPaver,
        },
      })
    );

    // Also invoke external callback if provided (non-breaking)
    if (onRequestQuote) {
      const externalPool: ExternalPoolProps = {
        model: pool.model,
        price: pool.price,
        category: (incomingPool?.category || "standard") as ExternalPoolProps["category"],
        image: pool.image,
        dimensions: pool.dimensions,
        depth: pool.depth,
        features: incomingPool?.features || [],
      };
      onRequestQuote(externalPool, {
        finish: selectedFinish,
        tile: selectedTile,
        liner: selectedLiner,
        paver: selectedPaver,
      });
    }

    navigate(`/quote/${id}`);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Pool Product Configurator</h1>

      <Tabs defaultValue="pool" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="pool">Pool</TabsTrigger>
          <TabsTrigger value="finish">Finish</TabsTrigger>
          <TabsTrigger value="tile">Tile</TabsTrigger>
          <TabsTrigger value="liner">Liner</TabsTrigger>
          <TabsTrigger value="paver">Paver</TabsTrigger>
        </TabsList>
        <TabsContent value="pool">
          <Card>
            <CardHeader>
              <CardTitle>Pool Details</CardTitle>
              <CardDescription>
                Configure the basic details of the pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions</FormLabel>
                        <FormControl>
                          <Input placeholder="Pool Dimensions" {...field} />
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
                          <Input placeholder="Pool Depth" {...field} />
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
                          />
                        </FormControl>
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
                  <Button type="submit">Update Pool</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard
                    src={pool.image}
                    alt={pool.model}
                    className="w-full h-full object-cover"
                    enableZoom={true}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">
                  {pool.model}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="finish">
          <Card>
            <CardHeader>
              <CardTitle>Finish Details</CardTitle>
              <CardDescription>
                Configure the finish details of the pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...finishForm}>
                <form
                  onSubmit={finishForm.handleSubmit(handleFinishSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={finishForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Finish Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={finishForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Finish Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={finishForm.control}
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
                  <Button type="submit">Update Finish</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard
                    src={selectedFinish.image}
                    alt={selectedFinish.name}
                    className="w-full h-full object-cover"
                    enableZoom={false}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">
                  {selectedFinish.name}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tile">
          <Card>
            <CardHeader>
              <CardTitle>Tile Details</CardTitle>
              <CardDescription>
                Configure the tile details of the pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...tileForm}>
                <form
                  onSubmit={tileForm.handleSubmit(handleTileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={tileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tile Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tileForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tile Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tileForm.control}
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
                  <Button type="submit">Update Tile</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard
                    src={selectedTile.image}
                    alt={selectedTile.name}
                    className="w-full h-full object-cover"
                    enableZoom={false}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">
                  {selectedTile.name}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="liner">
          <Card>
            <CardHeader>
              <CardTitle>Liner Details</CardTitle>
              <CardDescription>
                Configure the liner details of the pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...linerForm}>
                <form
                  onSubmit={linerForm.handleSubmit(handleLinerSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={linerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Liner Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linerForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liner Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={linerForm.control}
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
                  <Button type="submit">Update Liner</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard
                    src={selectedLiner.image}
                    alt={selectedLiner.name}
                    className="w-full h-full object-cover"
                    enableZoom={false}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">
                  {selectedLiner.name}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="paver">
          <Card>
            <CardHeader>
              <CardTitle>Paver Details</CardTitle>
              <CardDescription>
                Configure the paver details of the pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paverForm}>
                <form
                  onSubmit={paverForm.handleSubmit(handlePaverSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={paverForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Paver Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paverForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paver Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paverForm.control}
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
                  <Button type="submit">Update Paver</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-xl overflow-hidden border bg-background">
                <div className="aspect-video">
                  <ImageCard
                    src={selectedPaver.image}
                    alt={selectedPaver.name}
                    className="w-full h-full object-cover"
                    enableZoom={false}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground py-2">
                  {selectedPaver.name}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleCreateQuote} className="mt-6">
        Create Quote
      </Button>
    </div>
  );
};

export default PoolProductCard;
