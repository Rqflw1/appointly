import SignUpForm from "@/app/_components/auth/SignUpForm";
import { DEFAULT_LANGUAGE } from "@/app/_lib/constants/general";
import { getDictionary } from "@/app/_lib/functions/general";

export default async function SignUpPage() {
  const dict = getDictionary(DEFAULT_LANGUAGE);

  return (
    <main className="max-w-sm mx-auto px-4 py-8">
      <div className="text-2xl font-bold text-center">{dict.labels.signUp}</div>
      <div className="mt-8">
        <SignUpForm />
      </div>
    </main>
  );
}
