import { auth } from "@/app/_lib/functions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findFirst({
    where: { id: session.user.id }
  });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const clients = await prisma.client.findMany({
    where: scopeWhere(user),
    orderBy: { createdAt: "desc" }
  });

  const header = [
    "id",
    "first_name",
    "last_name",
    "phone",
    "email",
    "notes",
    "created_at"
  ];
  const rows = clients.map((client) => [
    client.id,
    client.firstName,
    client.lastName,
    client.phone,
    client.email,
    client.notes,
    client.createdAt.toISOString()
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=clients.csv"
    }
  });
}
