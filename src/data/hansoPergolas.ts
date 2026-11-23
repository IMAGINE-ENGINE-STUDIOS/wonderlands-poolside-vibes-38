// Hansø pergolas and awning — partner lines carried by Wonderlands World.
// Models, sizes and prices are the hansohome.com list prices printed in the
// Hansø partner price list (Q4 2026) and the Hansø Pergola Comparison 2026.
// Trade prices are confidential to the partner agreement and never appear here.

import proPlusImg from "@/assets/hanso/hanso-pro-plus.webp";
import proPlusImg2 from "@/assets/hanso/hanso-pro-plus-2.webp";
import horizonImg from "@/assets/hanso/hanso-horizon.webp";
import horizonImg2 from "@/assets/hanso/hanso-horizon-2.webp";
import apexImg from "@/assets/hanso/hanso-apex.webp";
import apexImg2 from "@/assets/hanso/hanso-apex-2.webp";
import awningImg from "@/assets/hanso/hanso-awning.webp";

export interface HansoSize {
  label: string;
  price: number;
}

export interface HansoLine {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  images: string[];
  specs: string[];
  finishes: string;
  warranty: string;
  sizes: HansoSize[];
}

export const hansoLines: HansoLine[] = [
  {
    id: "hanso-pro-plus",
    name: "Pro+",
    brand: "Hansø",
    tagline: "The original, Gen 4",
    description:
      "The original Hansø pergola. Its louvers turn by hand crank, so there is no motor and nothing to charge. The frame is 6063 T5 aluminum with a three layer powder coat, and it stands freestanding or wall mounted in your yard.",
    images: [proPlusImg, proPlusImg2],
    specs: ["Hand crank louvers", "120 mph wind rated, properly mounted", "25 psf snow load"],
    finishes: "Dark Gray or White",
    warranty: "10 year warranty",
    sizes: [
      { label: "10 × 10 ft", price: 6120 },
      { label: "10 × 13 ft", price: 7587 },
      { label: "13 × 13 ft", price: 10387 },
      { label: "13 × 19 ft", price: 13320 },
    ],
  },
  {
    id: "hanso-horizon",
    name: "Horizon",
    brand: "Hansø",
    tagline: "The smart flagship, Gen 5",
    description:
      "The smart flagship. Its motorized roof opens to 135 degrees and answers to your phone, the remote, Alexa, Google Home or HomeKit, and SoftGlow LED lighting in two colors is built into the frame. The frame is 6063 T6 aerospace grade aluminum.",
    images: [horizonImg, horizonImg2],
    specs: ["Motorized roof, phone remote or voice", "Up to 165 mph wind rated, louvers closed", "Up to 60 psf snow load", "SoftGlow dual color LED built in"],
    finishes: "Dark Gray or White",
    warranty: "10 year warranty",
    sizes: [
      { label: "10 × 10 ft", price: 7488 },
      { label: "10 × 13 ft", price: 9363 },
      { label: "10 × 19 ft", price: 13113 },
      { label: "13 × 13 ft", price: 15113 },
      { label: "13 × 19 ft", price: 17238 },
    ],
  },
  {
    id: "hanso-apex",
    name: "Apex",
    brand: "Hansø",
    tagline: "Premium, Gen 5",
    description:
      "The premium Hansø and the largest of the three. Twelve sizes run up to 13 by 26 feet, the motorized roof answers to phone, remote or voice, and SoftGlow LED is built into every louver. The frame is 6063 T6 aerospace grade aluminum.",
    images: [apexImg, apexImg2],
    specs: ["Motorized roof, phone remote or voice", "167 mph wind rated, louvers closed", "65 psf snow load", "SoftGlow LED in every louver"],
    finishes: "Dark Gray, White or Matte Black",
    warranty: "10 year warranty",
    sizes: [
      { label: "10 × 10 ft", price: 11950 },
      { label: "10 × 13 ft", price: 14950 },
      { label: "10 × 16 ft", price: 15950 },
      { label: "10 × 19 ft", price: 18950 },
      { label: "10 × 26 ft", price: 23950 },
      { label: "12 × 16 ft", price: 18950 },
      { label: "12 × 19 ft", price: 21950 },
      { label: "13 × 13 ft", price: 15950 },
      { label: "13 × 16 ft", price: 19950 },
      { label: "13 × 19 ft", price: 21950 },
      { label: "13 × 23 ft", price: 25950 },
      { label: "13 × 26 ft", price: 27950 },
    ],
  },
  {
    id: "hanso-awning",
    name: "Awning",
    brand: "Hansø",
    tagline: "Electric retractable, full cassette",
    description:
      "An electric retractable awning in a full cassette that seals the fabric, the arms and the motor away when it closes. The Sauleda marine grade acrylic blocks up to 97 percent of UV, and it mounts to a wall, ceiling or soffit. An optional sensor retracts it on its own when the wind reaches 18 mph.",
    images: [awningImg],
    specs: ["Electric retractable, full cassette", "25 mph wind rated, fully extended", "Sauleda acrylic, up to 97 percent UV block"],
    finishes: "Full cassette, wall ceiling or soffit mount",
    warranty: "Covered by the Hansø warranty",
    sizes: [
      { label: "10 × 7 ft", price: 3797 },
      { label: "13 × 10 ft", price: 4510 },
      { label: "16 × 10 ft", price: 5082 },
      { label: "20 × 10 ft", price: 5796 },
    ],
  },
];
