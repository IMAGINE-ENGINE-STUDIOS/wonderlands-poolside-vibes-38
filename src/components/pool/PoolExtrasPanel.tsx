
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Droplets, Cpu, Shield, Ruler, Sun, Thermometer, Waves, Zap, BrickWall } from "lucide-react";

// External data sources
import { poolFinishes as poolFinishesData } from "@/components/PoolFinishesSection";
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";

type FinishOption = {
  name: string;
  image: string;
  price?: number;
  collection?: string;
  category?: string;
  description?: string;
};

type SimpleOption = {
  name: string;
  image?: string;
  price: number;
  description?: string;
};

export type PoolExtrasState = {
  // toggles
  finishes: boolean;
  liners: boolean;
  tiles: boolean;
  pavers: boolean;
  screenEnclosure: boolean;
  automaticCover: boolean;
  heater: boolean;
  spa: boolean;
  tanningLedge: boolean;
  spaJets: boolean;

  // selections
  finishName: string;
  linerName: string;
  tileName: string;
  tanningLedgeName: string;

  // calculators/inputs
  paverSurfaceArea: string;         // sq ft
  enclosureSurfaceArea: string;     // sq ft
  spaJetsQty: number;

  // unit rates
  paverRate: number;                // $/sq ft
  enclosureRate: number;            // $/sq ft
};

type PoolExtrasPanelProps = {
  extras: PoolExtrasState;
  onChange: (patch: Partial<PoolExtrasState>) => void;
};

const finishOptions: FinishOption[] = poolFinishesData.map((f) => ({
  name: f.name,
  image: f.image,
  price: f.price,
  collection: f.collection,
  category: f.category,
  description: f.description,
}));

const linerOptions: SimpleOption[] = poolLiners.map((l) => ({
  name: l.name,
  image: l.image,
  price: l.price,
  description: l.description,
}));

const tileOptions: SimpleOption[] = poolTiles.map((t) => ({
  name: t.name,
  image: t.image,
  price: t.price,
  description: t.description,
}));

const tanningLedgeOptions: SimpleOption[] = (tanningLedges || []).map((t) => ({
  name: t.name,
  image: t.image,
  price: t.price ?? 0,
  description: t.description,
}));

const OptionCard = ({
  selected,
  title,
  subtitle,
  price,
  image,
  onClick,
  accent = "primary",
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  price?: number;
  image?: string;
  onClick: () => void;
  accent?: "primary" | "teal" | "secondary";
}) => {
  const accentBorder =
    accent === "primary"
      ? "border-primary bg-primary/10"
      : accent === "teal"
      ? "border-teal bg-teal/10"
      : "border-secondary bg-secondary/10";

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
        selected ? accentBorder : "border-border"
      }`}
      onClick={onClick}
    >
      <div className="w-full h-16 rounded-md mb-2 overflow-hidden bg-muted">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
      <p className="text-xs font-medium text-center">{title}</p>
      {!!subtitle && <p className="text-[10px] text-muted-foreground text-center mt-1">{subtitle}</p>}
      {typeof price === "number" && price > 0 && (
        <p className="text-[10px] text-foreground font-semibold text-center mt-1">+${price.toLocaleString()}</p>
      )}
    </div>
  );
};

const PoolExtrasPanel: React.FC<PoolExtrasPanelProps> = ({ extras, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <Separator />

      {/* Toggles row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.finishes} onCheckedChange={(v) => onChange({ finishes: !!v })} />
          <span className="flex items-center gap-1"><Droplets size={14} className="text-primary" /> Finishes</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.liners} onCheckedChange={(v) => onChange({ liners: !!v, tiles: !!extras.tiles && !v })} />
          <span className="flex items-center gap-1"><Shield size={14} className="text-secondary" /> Liners</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.tiles} onCheckedChange={(v) => onChange({ tiles: !!v, liners: !!extras.liners && !v })} />
          <span className="flex items-center gap-1"><Cpu size={14} className="text-coral" /> Tiles</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.pavers} onCheckedChange={(v) => onChange({ pavers: !!v })} />
          <span className="flex items-center gap-1"><BrickWall size={14} className="text-muted-foreground" /> Pavers</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.screenEnclosure} onCheckedChange={(v) => onChange({ screenEnclosure: !!v })} />
          <span className="flex items-center gap-1"><Sun size={14} className="text-foreground" /> Screen Enclosure</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.automaticCover} onCheckedChange={(v) => onChange({ automaticCover: !!v })} />
          <span className="flex items-center gap-1"><Waves size={14} className="text-primary" /> Automatic Cover</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.heater} onCheckedChange={(v) => onChange({ heater: !!v })} />
          <span className="flex items-center gap-1"><Thermometer size={14} className="text-teal" /> Heater</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.spa} onCheckedChange={(v) => onChange({ spa: !!v })} />
          <span className="flex items-center gap-1"><Waves size={14} className="text-primary" /> Add Spa</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.tanningLedge} onCheckedChange={(v) => onChange({ tanningLedge: !!v })} />
          <span className="flex items-center gap-1"><Sun size={14} className="text-amber-500" /> Tanning Ledge</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={extras.spaJets} onCheckedChange={(v) => onChange({ spaJets: !!v })} />
          <span className="flex items-center gap-1"><Zap size={14} className="text-primary" /> Spa Jets</span>
        </label>
      </div>

      {/* Finishes */}
      {extras.finishes && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Droplets size={16} />
            <h4 className="font-semibold">Finishes</h4>
            <Badge variant="secondary" className="text-[10px]">Select one</Badge>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {finishOptions.map((finish, idx) => (
                <CarouselItem key={`finish-${finish.name}-${idx}`} className="pl-1 basis-1/2 sm:basis-1/3">
                  <OptionCard
                    selected={extras.finishName === finish.name}
                    title={finish.name}
                    subtitle={finish.collection}
                    price={finish.price}
                    image={finish.image}
                    onClick={() => onChange({ finishName: finish.name })}
                    accent="primary"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      )}

      {/* Liners */}
      {extras.liners && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <h4 className="font-semibold">Liners</h4>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {linerOptions.map((liner) => (
                <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3">
                  <OptionCard
                    selected={extras.linerName === liner.name}
                    title={liner.name}
                    price={liner.price}
                    image={liner.image}
                    onClick={() => onChange({ linerName: liner.name })}
                    accent="secondary"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      )}

      {/* Tiles */}
      {extras.tiles && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu size={16} />
            <h4 className="font-semibold">Tiles</h4>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {tileOptions.map((tile) => (
                <CarouselItem key={tile.name} className="pl-1 basis-1/2 sm:basis-1/3">
                  <OptionCard
                    selected={extras.tileName === tile.name}
                    title={tile.name}
                    price={tile.price}
                    image={tile.image}
                    onClick={() => onChange({ tileName: tile.name })}
                    accent="teal"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      )}

      {/* Pavers calculator */}
      {extras.pavers && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BrickWall size={16} />
            <h4 className="font-semibold">Pavers Surface Area</h4>
            <Badge variant="outline" className="text-[10px]">Rate ${extras.paverRate}/sq ft</Badge>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Surface Area (sq ft)</label>
            <Input
              type="number"
              placeholder="Enter paver surface area"
              value={extras.paverSurfaceArea}
              onChange={(e) => onChange({ paverSurfaceArea: e.target.value })}
            />
            {extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea)) && (
              <div className="text-xs text-green-600 font-medium mt-1">
                Calculated Cost: $
                {(parseFloat(extras.paverSurfaceArea) * extras.paverRate).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen Enclosure calculator */}
      {extras.screenEnclosure && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sun size={16} />
            <h4 className="font-semibold">Screen Enclosure Area</h4>
            <Badge variant="outline" className="text-[10px]">Rate ${extras.enclosureRate}/sq ft</Badge>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Covered Area (sq ft)</label>
            <Input
              type="number"
              placeholder="Enter enclosure covered area"
              value={extras.enclosureSurfaceArea}
              onChange={(e) => onChange({ enclosureSurfaceArea: e.target.value })}
            />
            {extras.enclosureSurfaceArea && !isNaN(parseFloat(extras.enclosureSurfaceArea)) && (
              <div className="text-xs text-green-600 font-medium mt-1">
                Calculated Cost: $
                {(parseFloat(extras.enclosureSurfaceArea) * extras.enclosureRate).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tanning Ledge */}
      {extras.tanningLedge && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sun size={16} />
            <h4 className="font-semibold">Tanning Ledge</h4>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {tanningLedgeOptions.map((opt) => (
                <CarouselItem key={opt.name} className="pl-1 basis-1/2 sm:basis-1/3">
                  <OptionCard
                    selected={extras.tanningLedgeName === opt.name}
                    title={opt.name}
                    price={opt.price}
                    image={opt.image}
                    onClick={() => onChange({ tanningLedgeName: opt.name })}
                    accent="secondary"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      )}

      {/* Spa Jets */}
      {extras.spaJets && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap size={16} />
            <h4 className="font-semibold">Spa Jets Quantity</h4>
            <Badge variant="outline" className="text-[10px]">+${(1800 * (extras.spaJetsQty || 1)).toLocaleString()}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange({ spaJetsQty: Math.max(1, (extras.spaJetsQty || 1) - 1) })}
            >
              -
            </Button>
            <span className="font-semibold">{extras.spaJetsQty || 1}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange({ spaJetsQty: (extras.spaJetsQty || 1) + 1 })}
            >
              +
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolExtrasPanel;

