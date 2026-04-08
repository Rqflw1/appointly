import { Prisma } from "@/app/_prisma/browser";

const documentEventWithUserArgs = {
  include: { user: true }
} satisfies Prisma.DocumentEventDefaultArgs;

export type DocumentEventWithUser = Prisma.DocumentEventGetPayload<
  typeof documentEventWithUserArgs
>;
