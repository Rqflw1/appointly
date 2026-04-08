import SignInForm from "@/app/_components/auth/SignInForm";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";

export default async function Page() {
  const csrfToken = await getCsrfToken();
  return <SignInForm csrfToken={csrfToken} />;
}
