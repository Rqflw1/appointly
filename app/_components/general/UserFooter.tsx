import { Dictionary } from "@/app/_lib/types/general";
import Image from "next/image";
import Link from "next/link";

interface ComponentProps {
  dict: Dictionary;
}

export default async function UserFooter({ dict }: ComponentProps) {
  return (
    <footer className="bg-dark text-dark-foreground text-xs">
      <div className="max-w-8xl mx-auto w-full h-24 px-4 flex items-center gap-6">
        <div className="relative w-[131px] h-[24px]">
          <Image src="/general/logo-light.svg" alt="Logo" fill priority />
        </div>
        <div className="flex flex-col gap-2">
          <div>info@telegroup.lv</div>
          <div>+371 67799000</div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/privacy-policy"
            className="block underline underline-offset-2"
          >
            {dict.labels.privacyPolicy}
          </Link>
          <Link
            href="/terms-of-service"
            className="block underline underline-offset-2"
          >
            {dict.labels.termsOfService}
          </Link>
        </div>
        <div className="ml-auto text-sm text-secondary-foreground">{`${
          dict.labels.allRightsReserved
        } © SIA "Telegrupa Baltijā" ${new Date().getUTCFullYear()}`}</div>
      </div>
    </footer>
  );
}
