import type { Package } from "./definitions";

export const packages: Package[] = [
  {
    slug: "12-hours",
    name: "12 Hours",
    price: 800,
    description: "Perfect for a day of work or study.",
    details: ["High-speed internet", "Single device connection"],
    imageId: "bronze-package",
  },
  {
    slug: "1-day",
    name: "1 Day",
    price: 1000,
    description: "24 hours of uninterrupted connectivity.",
    details: ["High-speed internet", "Up to 2 devices"],
    imageId: "silver-package",
  },
  {
    slug: "1-week",
    name: "1 Week",
    price: 4000,
    description: "A full week of reliable internet access.",
    details: ["Unlimited data", "Up to 3 devices"],
    imageId: "gold-package",
  },
  {
    slug: "1-month",
    name: "1 Month",
    price: 18000,
    description: "Your internet solution for the whole month.",
    details: ["Unlimited data", "Up to 5 devices", "Priority support"],
    imageId: "gold-package",
  },
  {
    slug: "monthly-membership",
    name: "Monthly Membership",
    price: 15000,
    description: "Best value for long-term users.",
    details: ["Unlimited data", "Up to 5 devices", "24/7 priority support"],
    imageId: "silver-package",
  },
];
