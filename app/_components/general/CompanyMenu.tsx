"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/app/_shadcn/lib/utils";
import { selectComapnyAction } from "@/app/_lib/serverActions/company";
import { Company } from "@/app/_prisma/browser";

interface ComponentProps {
  company: Company | null;
  companies: Company[];
}

export default function CompanyMenu({ company, companies }: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();

  async function switchCompany(companyId: string) {
    await selectComapnyAction(companyId);
    router.push("/documents");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({
            variant: "secondary",
            className: "data-[state=open]:bg-hover"
          })
        )}
      >
        {company && company.name}
        {!company && dict.labels.selectCompany}
        <ChevronsUpDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>{dict.labels.companies}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {companies.map((company, key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => switchCompany(company.id)}
            >
              {company.name}
            </DropdownMenuItem>
          ))}
          {companies.length === 0 && (
            <DropdownMenuItem disabled>
              {dict.labels.noCompanies}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/companies?add=true">{dict.labels.addCompany}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/company/profile">{dict.labels.companySettings}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/companies">{dict.labels.allCompanies}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
