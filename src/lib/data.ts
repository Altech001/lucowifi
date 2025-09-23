import type { Package } from "./definitions";

export const packages: Package[] = [
  {
    slug: "bronze-wave",
    name: "Bronze Wave",
    price: 5,
    description: "Perfect for light browsing and social media.",
    details: ["5 GB Data", "7-Day Validity", "Up to 10 Mbps Speed"],
    imageId: "bronze-package",
  },
  {
    slug: "silver-surge",
    name: "Silver Surge",
    price: 10,
    description: "Ideal for streaming music and casual video watching.",
    details: ["15 GB Data", "14-Day Validity", "Up to 25 Mbps Speed"],
    imageId: "silver-package",
  },
  {
    slug: "gold-rush",
    name: "Gold Rush",
    price: 20,
    description: "Best for HD streaming, gaming, and heavy usage.",
    details: ["50 GB Data", "30-Day Validity", "Up to 50 Mbps Speed"],
    imageId: "gold-package",
  },
];
