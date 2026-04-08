import Link from "next/link";
import ModeToggle from "./ModeToggle";
import { Dictionary } from "@/app/_lib/types/general";
import UserNavBar from "./UserNavBar";
import UserMenu from "./UserMenu";
import CompanyMenu from "./CompanyMenu";
import Notifications from "./Notifications";
import LogoImage from "./LogoImage";
import { Company, User } from "@/app/_prisma/browser";

interface ComponentProps {
  dict: Dictionary;
  user: User;
  company: Company | null;
  companies: Company[];
}

export default function UserHeader({
  dict,
  user,
  company,
  companies
}: ComponentProps) {
  return (
    <header className="max-w-8xl mx-auto w-full min-h-20 px-4 flex items-center">
      <Link href="/" className="">
        <LogoImage />
      </Link>
      <div className="ml-auto">
        <UserNavBar />
      </div>
      <div className="ml-auto">{/* <ModeToggle /> */}</div>
      <div className="ml-2">
        <Notifications />
      </div>
      <div className="ml-2">
        <CompanyMenu company={company} companies={companies} />
      </div>
      <div className="ml-2">
        <UserMenu dict={dict} user={user} />
      </div>
    </header>
  );
}
