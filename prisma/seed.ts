import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pricingRules = [
    { deviceBrand: "Apple", repairType: "Screen Replacement", minPrice: 79, maxPrice: 149 },
    { deviceBrand: "Apple", deviceModel: "iPhone 15 Pro Max", repairType: "Screen Replacement", minPrice: 139, maxPrice: 179 },
    { deviceBrand: "Apple", repairType: "Battery Replacement", minPrice: 49, maxPrice: 79 },
    { deviceBrand: "Apple", repairType: "Charging Port", minPrice: 39, maxPrice: 69 },
    { deviceBrand: "Apple", repairType: "Camera Repair", minPrice: 59, maxPrice: 129 },
    { deviceBrand: "Apple", repairType: "Water Damage", minPrice: 49, maxPrice: 99 },
    { deviceBrand: "Samsung", repairType: "Screen Replacement", minPrice: 69, maxPrice: 139 },
    { deviceBrand: "Samsung", repairType: "Battery Replacement", minPrice: 39, maxPrice: 69 },
    { deviceBrand: "Samsung", repairType: "Charging Port", minPrice: 29, maxPrice: 59 },
    { deviceBrand: "Samsung", repairType: "Camera Repair", minPrice: 49, maxPrice: 99 },
    { deviceBrand: "Google", repairType: "Screen Replacement", minPrice: 79, maxPrice: 129 },
    { deviceBrand: "Google", repairType: "Battery Replacement", minPrice: 49, maxPrice: 79 },
    { deviceBrand: "OnePlus", repairType: "Screen Replacement", minPrice: 69, maxPrice: 119 },
    { deviceBrand: "Other", repairType: "Screen Replacement", minPrice: 39, maxPrice: 99 },
    { deviceBrand: "Other", repairType: "Battery Replacement", minPrice: 29, maxPrice: 59 },
    { deviceBrand: "Other", repairType: "Water Damage", minPrice: 39, maxPrice: 89 },
    { deviceBrand: "Other", repairType: "Data Recovery", minPrice: 49, maxPrice: 149 },
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.create({ data: rule });
  }

  const products = [
    { sku: "SCR-IP15-BLK-OEM", name: "iPhone 15 Screen (OEM)", category: "Screens", brand: "Apple", compatibleWith: "iPhone 15", condition: "OEM", price: 89.99, costPrice: 42.00, stockQty: 5 },
    { sku: "BAT-IP15-STD", name: "iPhone 15 Battery", category: "Batteries", brand: "Apple", compatibleWith: "iPhone 15", condition: "OEM", price: 34.99, costPrice: 14.00, stockQty: 8 },
    { sku: "CASE-IP15-CLR", name: "iPhone 15 Clear Case", category: "Cases & Covers", compatibleWith: "iPhone 15", condition: "NEW", price: 12.99, costPrice: 3.50, stockQty: 20 },
    { sku: "SCR-SAM-S24-BLK-OEM", name: "Samsung Galaxy S24 Screen (OEM)", category: "Screens", brand: "Samsung", compatibleWith: "Galaxy S24", condition: "OEM", price: 79.99, costPrice: 38.00, stockQty: 3 },
    { sku: "CHG-USBC-65W", name: "65W USB-C Fast Charger", category: "Charging", condition: "NEW", price: 19.99, costPrice: 7.00, stockQty: 15 },
    { sku: "SP-IP15-TEMP", name: "iPhone 15 Tempered Glass (2-pack)", category: "Screen Protectors", compatibleWith: "iPhone 15", condition: "NEW", price: 9.99, costPrice: 2.50, stockQty: 30 },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ Seed data inserted");
}

main().catch(console.error).finally(() => prisma.$disconnect());
