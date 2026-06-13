import { NextRequest, NextResponse } from "next/server";

const DEMO_CUSTOMERS = [
  { id: "demo-c1", name: "James Whitfield",  phone: "07700 900123", email: "james.whitfield@email.com",  createdAt: new Date(Date.now() - 13 * 86400000).toISOString(), _count: { repairJobs: 2, orders: 0 } },
  { id: "demo-c2", name: "Priya Sharma",     phone: "07700 900456", email: "priya.sharma@email.com",     createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c3", name: "Daniel O'Brien",   phone: "07700 900789", email: "daniel.obrien@email.com",    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c4", name: "Sophie Nguyen",    phone: "07700 900321", email: "sophie.nguyen@email.com",    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), _count: { repairJobs: 2, orders: 0 } },
  { id: "demo-c5", name: "Aisha Patel",      phone: "07700 900987", email: "aisha.patel@email.com",      createdAt: new Date(Date.now() - 7  * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c6", name: "Tom Gallagher",    phone: "07700 900147", email: "tom.gallagher@email.com",    createdAt: new Date(Date.now() - 6  * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c7", name: "Chloe Martinez",   phone: "07700 900258", email: "chloe.martinez@email.com",   createdAt: new Date(Date.now() - 5  * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c8", name: "Ryan Fletcher",    phone: "07700 900369", email: "ryan.fletcher@email.com",    createdAt: new Date(Date.now() - 3  * 86400000).toISOString(), _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c9", name: "Noah Chambers",    phone: "07700 900704", email: null,                          createdAt: new Date().toISOString(),                            _count: { repairJobs: 1, orders: 0 } },
  { id: "demo-c10",name: "Imogen Clarke",    phone: "07700 900815", email: null,                          createdAt: new Date().toISOString(),                            _count: { repairJobs: 1, orders: 0 } },
];

export async function GET(req: NextRequest) {
  const search = new URL(req.url).searchParams.get("search");
  try {
    const { prisma } = await import("@/lib/prisma");
    const customers = await prisma.customer.findMany({
      where: search ? { OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]} : undefined,
      include: { _count: { select: { repairJobs: true, orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    if (customers.length === 0) {
      let demo = DEMO_CUSTOMERS;
      if (search) {
        const q = search.toLowerCase();
        demo = demo.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email ?? "").toLowerCase().includes(q));
      }
      return NextResponse.json(demo);
    }
    return NextResponse.json(customers);
  } catch {
    let demo = DEMO_CUSTOMERS;
    if (search) {
      const q = search.toLowerCase();
      demo = demo.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email ?? "").toLowerCase().includes(q));
    }
    return NextResponse.json(demo);
  }
}
