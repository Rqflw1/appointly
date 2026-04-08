import SignUpForm from "@/app/_components/auth/SignUpForm";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";

export default async function Page() {
  const csrfToken = await getCsrfToken();
  return <SignUpForm csrfToken={csrfToken} />;
}
