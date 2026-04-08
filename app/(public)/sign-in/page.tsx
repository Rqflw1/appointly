import SignInForm from "@/app/_components/auth/SignInForm";
import { DEFAULT_LANGUAGE } from "@/app/_lib/constants/general";
import { getDictionary } from "@/app/_lib/functions/general";

interface ComponentProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignInPage({ searchParams }: ComponentProps) {
  const dict = getDictionary(DEFAULT_LANGUAGE);

  return (
    <main className="max-w-sm mx-auto px-4 py-8">
      <div className="text-2xl font-bold text-center">{dict.labels.signIn}</div>
      <div className="mt-8">
        <SignInForm />
      </div>
    </main>
  );
}
