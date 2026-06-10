export const REPAIR_STATUSES = [
  { value: "RECEIVED",       label: "Received",        color: "bg-blue-500" },
  { value: "DIAGNOSED",      label: "Diagnosed",       color: "bg-yellow-500" },
  { value: "AWAITING_PARTS", label: "Awaiting Parts",  color: "bg-orange-500" },
  { value: "IN_REPAIR",      label: "In Repair",       color: "bg-purple-500" },
  { value: "READY",          label: "Ready",           color: "bg-green-500" },
  { value: "COLLECTED",      label: "Collected",       color: "bg-gray-500" },
  { value: "CANCELLED",      label: "Cancelled",       color: "bg-red-500" },
] as const;

export const DEVICE_BRANDS = [
  "Apple", "Samsung", "Google", "OnePlus", "Huawei",
  "Xiaomi", "Sony", "Motorola", "Nokia", "Other",
];

export const REPAIR_TYPES = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port",
  "Camera Repair",
  "Speaker / Microphone",
  "Water Damage",
  "Back Glass",
  "Software Issue",
  "Data Recovery",
  "Other",
];

export const PRODUCT_CATEGORIES = [
  "Screens",
  "Batteries",
  "Charging",
  "Cases & Covers",
  "Screen Protectors",
  "Audio",
  "Tools",
  "Other",
];

export const GOOGLE_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL || "https://g.page/r/your-google-review-link";
