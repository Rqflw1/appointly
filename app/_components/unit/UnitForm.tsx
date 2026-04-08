"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import FormError from "../general/FormError";
import { Input } from "@/app/_shadcn/components/ui/input";
import { SetState } from "@/app/_lib/types/general";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";

interface ComponentProps {
  nameInput: [string, SetState<string>, string];
  descriptionInput: [string, SetState<string>];
}

export default function UnitForm({
  nameInput: [name, setName, nameError],
  descriptionInput: [description, setDescription]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
      <div>
        <Label htmlFor="name">{dict.labels.itemName}</Label>
        <Input
          id="name"
          type="text"
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!nameError}
        />
        <FormError error={nameError} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">{dict.labels.description}</Label>
        <Textarea
          id="description"
          className="mt-2 h-16"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
