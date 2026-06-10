import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendTelegramMessage, telegramMsg } from "@/lib/telegram";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const { customerName, customerPhone, customerEmail, items, shippingAddress, notes } = await req.json();

  let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { name: customerName, phone: customerPhone, email: customerEmail || null } });
  }

  const products = await prisma.product.findMany({ where: { id: { in: items.map((i: { productId: string }) => i.productId) } } });

  let subtotal = 0;
  const orderItems = items.map((item: { productId: string; quantity: number }) => {
    const product = products.find(p => p.id === item.productId)!;
    const total = product.price * item.quantity;
    subtotal += total;
    return { productId: item.productId, quantity: item.quantity, unitPrice: product.price, total };
  });

  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber, customerId: customer.id, customerName, customerPhone,
      customerEmail: customerEmail || null, subtotal, total: subtotal,
      shippingAddress: shippingAddress || null, notes: notes || null,
      items: { create: orderItems },
    },
  });

  await sendTelegramMessage(telegramMsg("NEW_ORDER", { orderNumber, name: customerName, total: subtotal.toFixed(2) }));

  return NextResponse.json(order, { status: 201 });
}
