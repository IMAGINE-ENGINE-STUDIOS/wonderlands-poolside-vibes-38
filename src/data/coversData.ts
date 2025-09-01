// Automatic pool covers data

export interface AutomaticCover {
  name: string;
  price: number;
  type: 'solar' | 'safety' | 'thermal' | 'hybrid';
  material: string;
  motorType: string;
  warranty: string;
  features: string[];
  benefits: string[];
  installation: string;
  image: string;
}

export const automaticCovers: AutomaticCover[] = [
  {
    name: "Eclipse",
    price: 16000,
    type: 'safety',
    material: "High-grade PVC",
    motorType: "DC Motor",
    warranty: "10 years",
    features: ["Dual track system", "Emergency manual override", "Auto-close sensors", "LED status indicators"],
    benefits: ["Advanced safety features", "Quiet operation", "Weather resistant"],
    installation: "2-3 days",
    image: "/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png"
  },
  {
    name: "CS3000",
    price: 24000,
    type: 'hybrid',
    material: "Multi-layer vinyl",
    motorType: "AC Motor",
    warranty: "15 years",
    features: ["Smart automation", "Variable speed control", "Weather sensors", "Remote monitoring"],
    benefits: ["Commercial grade reliability", "Energy efficient", "Low maintenance"],
    installation: "3-4 days",
    image: "/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png"
  },
  {
    name: "Infinity 4000",
    price: 32000,
    type: 'hybrid',
    material: "Premium composite",
    motorType: "Smart Motor",
    warranty: "20 years",
    features: ["AI-powered automation", "Solar integration", "App control", "Predictive maintenance"],
    benefits: ["Ultimate performance", "Maximum energy savings", "Smart home integration"],
    installation: "4-5 days",
    image: "/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png"
  },
  {
    name: "Atom",
    price: 19000,
    type: 'thermal',
    material: "Insulated fabric",
    motorType: "DC Motor",
    warranty: "12 years",
    features: ["Compact design", "Quick deployment", "Temperature sensors", "Timer controls"],
    benefits: ["Space efficient", "Fast operation", "Energy saving"],
    installation: "2 days",
    image: "/lovable-uploads/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png"
  },
  {
    name: "Aquamatic Quantum",
    price: 35000,
    type: 'hybrid',
    material: "Advanced polymer",
    motorType: "Smart Variable Motor",
    warranty: "25 years",
    features: ["Quantum automation", "Self-diagnostic system", "Voice control", "Mobile app"],
    benefits: ["Next-gen technology", "Predictive maintenance", "Ultimate convenience"],
    installation: "5-6 days",
    image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png"
  },
  {
    name: "AquaSafe Pro",
    price: 21000,
    type: 'safety',
    material: "Reinforced vinyl",
    motorType: "AC Motor",
    warranty: "15 years",
    features: ["Triple safety locks", "Key switch operation", "Battery backup", "Safety sensors"],
    benefits: ["Maximum safety", "Child protection", "Reliable operation"],
    installation: "3 days",
    image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png"
  },
  {
    name: "Solar Fusion",
    price: 18000,
    type: 'solar',
    material: "Solar fabric",
    motorType: "Solar Motor",
    warranty: "12 years",
    features: ["Solar powered", "Eco-friendly", "Heat retention", "UV protection"],
    benefits: ["Zero energy cost", "Environmentally friendly", "Extends swim season"],
    installation: "2-3 days",
    image: "/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png"
  },
  {
    name: "ThermaMax",
    price: 22000,
    type: 'thermal',
    material: "Insulated composite",
    motorType: "Variable Speed Motor",
    warranty: "18 years",
    features: ["Maximum insulation", "Temperature retention", "Smart controls", "Weather tracking"],
    benefits: ["Reduces heating costs", "Maintains water temperature", "Weather adaptive"],
    installation: "3-4 days",
    image: "/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png"
  }
];