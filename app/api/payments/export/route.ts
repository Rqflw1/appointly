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

  const payments = await prisma.payment.findMany({
    where: scopeWhere(user),
    include: { client: true },
    orderBy: { paymentDate: "desc" }
  });

  const header = ["id", "client", "amount", "method", "payment_date", "notes"];
  const rows = payments.map((payment) => [
    payment.id,
    `${payment.client.firstName} ${payment.client.lastName}`,
    payment.amount,
    payment.method,
    payment.paymentDate.toISOString(),
    payment.notes
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=payments.csv"
    }
  });
}
