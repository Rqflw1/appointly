"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import ImageInput from "../input/ImageInput";
import { SetState } from "@/app/_lib/types/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { LogoAction, LogoWithUrl } from "@/app/_lib/types/logo";
import ColorPicker from "../input/ColorPicker";
import { Label } from "@/app/_shadcn/components/ui/label";
import FormError from "../general/FormError";
import { colorRegex } from "@/app/_lib/validation/general";

interface ComponentProps {
  companyLogo: LogoWithUrl | null;
  logoActionInput: [LogoAction, SetState<LogoAction>];
  logoInput: [File | null, SetState<File | null>];
  previewSrcInput: [string, SetState<string>];
  colorInput: [string, SetState<string>];
}

export default function LogoDialog({
  companyLogo,
  logoActionInput: [logoActionProp, setLogoActionProp],
  logoInput: [logoProp, setLogoProp],
  previewSrcInput: [previewSrcProp, setPreviewSrcProp],
  colorInput: [colorProp, setColorProp]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [logoAction, setLogoAction] = useState<LogoAction>(LogoAction.KEEP);
  const [logo, setLogo] = useInputValue<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [color, setColor, colorError, setColorError] = useInputValue("");

  function onImageChange(value: File | null) {
    setLogoAction(value ? LogoAction.CREATE : LogoAction.DISCONNECT);
    setLogo(value);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewSrc(e.target?.result?.toString() || "");
    if (value) reader.readAsDataURL(value);
    else setPreviewSrc("");
  }

  function connectLogo(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!companyLogo) return;

    setLogoAction(LogoAction.CONNECT);
    setLogo(null);
    setPreviewSrc(companyLogo.url);
  }

  function clearLogo(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setLogoAction(LogoAction.DISCONNECT);
    setLogo(null);
    setPreviewSrc("");
  }

  function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!colorRegex.test(color)) {
      setColorError(dict.errors.invalidColor);
      return;
    }

    setLogoActionProp(logoAction);
    setLogoProp(logo);
    setPreviewSrcProp(previewSrc);
    setColorProp(color);

    setIsOpen(false);
  }

  useEffect(() => {
    setLogoAction(logoActionProp);
    setLogo(logoProp);
    setPreviewSrc(previewSrcProp);
    setColor(colorProp);
  }, [isOpen, logoActionProp, logoProp, previewSrcProp, colorProp]);

  return (
    <div>
      <div
        className="h-48 p-4 flex justify-center items-center rounded-3xl border border-border hover:bg-hover"
        onClick={() => setIsOpen(true)}
      >
        {previewSrcProp && (
          <img className="w-full h-full object-contain" src={previewSrcProp} />
        )}
        {!previewSrcProp && (
          <div className="text-secondary-foreground">{dict.labels.logo}</div>
        )}
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.logo}</DialogTitle>
          </DialogHeader>
          <div>
            <ImageInput
              file={logo}
              previewSrc={previewSrc}
              onChange={onImageChange}
            />
            <div className="ml-4 mt-2 flex gap-4">
              <Button
                variant="link"
                size="link"
                className="text-secondary-foreground"
                onClick={connectLogo}
              >
                {dict.labels.useCompanyLogo}
              </Button>
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
              <ColorPicker
                className="mt-2"
                color={color}
                onChange={setColor}
                aria-invalid={!!colorError}
              />
              <FormError error={colorError} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-36" onClick={saveData}>
              {dict.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
