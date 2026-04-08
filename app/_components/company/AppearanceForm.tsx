"use client";

import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useRouter } from "next/navigation";
import { toastHelper } from "@/app/_lib/constants/general";
import { LogoAction, LogoWithUrl } from "@/app/_lib/types/logo";
import ImageInput from "../input/ImageInput";
import { createLogoAction } from "@/app/_lib/serverActions/logo";
import { Company } from "@/app/_prisma/browser";
import {
  detachCompanyLogoAction,
  updateCompanyColorAction
} from "@/app/_lib/serverActions/company";
import ColorPicker from "../input/ColorPicker";
import { Label } from "@/app/_shadcn/components/ui/label";
import { colorRegex } from "@/app/_lib/validation/general";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import FormError from "../general/FormError";

interface ComponentProps {
  company: Company;
  companyLogo: LogoWithUrl | null;
}

export default function AppearanceForm({
  company,
  companyLogo
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();
  const { isLoading, setIsLoading } = useFormState();

  const [logoAction, setLogoAction] = useState(LogoAction.KEEP);
  const [logo, setLogo] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [color, setColor, colorError, setColorError] = useInputValue("");

  function onImageChange(value: File | null) {
    setLogo(value);
    setLogoAction(value ? LogoAction.CREATE : LogoAction.DISCONNECT);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewSrc(e.target?.result?.toString() || "");
    if (value) reader.readAsDataURL(value);
    else setPreviewSrc("");
  }

  function clearLogo(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setLogoAction(LogoAction.DISCONNECT);
    setLogo(null);
    setPreviewSrc("");
  }

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!colorRegex.test(color)) {
      setColorError(dict.errors.invalidColor);
      return;
    }

    setIsLoading(true);

    const colorRes = await updateCompanyColorAction(color);
    if (!colorRes.ok) {
      setIsLoading(false);
      toastHelper.error(dict);
      return;
    }

    if (logoAction === LogoAction.CREATE && logo) {
      const res = await createLogoAction();

      if (res.ok && res.data) {
        await fetch(res.data, {
          method: "PUT",
          body: logo,
          headers: { "Content-Type": logo.type }
        });
        setIsLoading(false);
        toastHelper.success(dict);
      } else {
        setIsLoading(false);
        toastHelper.error(dict);
      }
    } else if (logoAction === LogoAction.DISCONNECT) {
      const res = await detachCompanyLogoAction();
      setIsLoading(false);

      if (res.ok) toastHelper.success(dict);
      else toastHelper.error(dict);
    } else {
      setIsLoading(false);
      toastHelper.success(dict);
    }

    setIsLoading(false);
    // TODO: check if refresh() from next/cache does not break img upload to object storage.
    router.refresh();
  }

  useEffect(() => {
    setLogoAction(LogoAction.KEEP);
    setLogo(null);
    setPreviewSrc(companyLogo?.url || "");
    setColor(company.color);
  }, [company]);

  return (
    <form>
      <div className="text-xl font-semibold text-foreground">
        {dict.labels.logo}
      </div>
      <div>
        <ImageInput
          id="logo"
          className="mt-4"
          file={logo}
          previewSrc={previewSrc}
          onChange={onImageChange}
        />
      </div>
      <div className="ml-4">
        <Button
          variant="link"
          size="link"
          className="text-secondary-foreground"
          onClick={clearLogo}
        >
          {dict.labels.clear}
        </Button>
      </div>
      <div className="mt-6 logo-color-picker">
        <Label htmlFor="color">{dict.labels.color}</Label>
        <ColorPicker className="mt-2" color={color} onChange={setColor} />
        <FormError className="mt-1" error={colorError} />
      </div>
      <div className="mt-6 flex gap-2">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          onClick={updateRecord}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
