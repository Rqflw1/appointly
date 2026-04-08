"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import UnitForm from "./UnitForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { CreateUnitModel } from "@/app/_lib/types/unit";
import { createUnitAction } from "@/app/_lib/serverActions/unit";

export default function NewUnitDialog() {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useFormState();

  const [name, setName, nameError, setNameError] = useInputValue("");
  const [description, setDescription] = useInputValue("");

  async function createRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!name) setNameError(dict.errors.nameIsRequired);

    if (!name) return;

    const model: CreateUnitModel = {
      name,
      description
    };

    setIsLoading(true);
    const res = await createUnitAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setName("");
    setDescription("");
  }, [isOpen]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.addUnit}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addUnit}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <UnitForm
              nameInput={[name, setName, nameError]}
              descriptionInput={[description, setDescription]}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="w-36"
              onClick={createRecord}
            >
              {dict.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
