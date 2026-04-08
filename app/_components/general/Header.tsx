import Link from "next/link";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { Dictionary } from "@/app/_lib/types/general";
import { cn } from "@/app/_shadcn/lib/utils";
import LogoImage from "./LogoImage";

interface ComponentProps {
  dict: Dictionary;
}

export default async function Header({ dict }: ComponentProps) {
  return (
    <header className="max-w-12xl mx-auto h-16 px-4 flex items-center">
      <Link href="/" className="">
        <LogoImage />
      </Link>
      <div className="ml-auto">{/* <ModeToggle /> */}</div>
      <Link
        className={cn(
          buttonVariants({ variant: "secondary", className: "ml-2" })
        )}
        href="/sign-up"
      >
        {dict.labels.signUp}
      </Link>
      <Link
        className={cn(buttonVariants({ className: "ml-2" }))}
        href="/sign-in"
      >
        {dict.labels.signIn}
      </Link>
    </header>
  );
}
