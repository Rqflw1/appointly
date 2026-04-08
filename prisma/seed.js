const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@demo.local",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@demo.local",
      password: managerPassword,
      role: "MANAGER"
    }
  });

  const client1 = await prisma.client.create({
    data: {
      managerId: manager.id,
      firstName: "Anna",
      lastName: "Petrova",
      phone: "+1-202-555-0111",
      email: "anna@example.com",
      notes: "Prefers morning slots"
    }
  });
  const client2 = await prisma.client.create({
    data: {
      managerId: manager.id,
      firstName: "Dmitry",
      lastName: "Ivanov",
      phone: "+1-202-555-0112",
      email: "dmitry@example.com",
      notes: "VIP client"
    }
  });

  const service1 = await prisma.service.create({
    data: {
      managerId: manager.id,
      title: "Private lesson",
      description: "One-on-one coaching session",
      price: 45,
      durationMinutes: 60
    }
  });
  const service2 = await prisma.service.create({
    data: {
      managerId: manager.id,
      title: "Consultation",
      description: "Business consultation",
      price: 90,
      durationMinutes: 90
    }
  });

  const appointment1 = await prisma.appointment.create({
    data: {
      managerId: manager.id,
      clientId: client1.id,
      serviceId: service1.id,
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      status: "PLANNED",
      price: 45,
      paymentStatus: "UNPAID",
      notes: "Bring materials"
    }
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      managerId: manager.id,
      clientId: client2.id,
      serviceId: service2.id,
      startAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 90,
      status: "COMPLETED",
      price: 90,
      paymentStatus: "PAID",
      notes: "Follow-up needed"
    }
  });

  await prisma.payment.create({
    data: {
      managerId: manager.id,
      clientId: client2.id,
      appointmentId: appointment2.id,
      amount: 90,
      method: "CARD",
      paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Paid in full"
    }
  });

  await prisma.reminder.create({
    data: {
      managerId: manager.id,
      clientId: client1.id,
      appointmentId: appointment1.id,
      type: "APPOINTMENT",
      remindAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      status: "PENDING",
      message: "Reminder: appointment tomorrow at 10:00"
    }
  });

  console.log("Seed completed");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
