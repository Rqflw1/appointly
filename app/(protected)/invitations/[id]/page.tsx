import InvitationButtons from "@/app/_components/invitation/InvitationButtons";
import { getDictionary, getParam } from "@/app/_lib/functions/general";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";

interface ComponentProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvitationPage({ params }: ComponentProps) {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const dict = getDictionary(user.language);

  const invitationId = getParam(await params, "id").at(0) || "";
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId },
    include: { company: true }
  });
  if (!invitation) notFound();

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8">
      <div className="text-3xl font-semibold text-center">
        {dict.labels.invitation}
      </div>
      <div className="mt-8 text-center">
        {dict.texts.youHaveBeenInvited(
          invitation.company.name,
          dict.userAccessLevel[invitation.role]
        )}
      </div>
      <div className="mt-16">
        <InvitationButtons invitation={invitation} />
      </div>
    </main>
  );
}
