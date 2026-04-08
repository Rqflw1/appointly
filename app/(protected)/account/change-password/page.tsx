import AccountNav from "@/app/_components/account/AccountNav";
import ChangePasswordForm from "@/app/_components/account/ChangePasswordForm";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { redirect } from "next/navigation";
import { getFullName } from "@/app/_lib/functions/user";

export default async function CompanyProfilePage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <div className="text-3xl font-semibold">{getFullName(user)}</div>
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
