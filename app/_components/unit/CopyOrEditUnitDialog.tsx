"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect
} from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import { Unit } from "@/app/_prisma/browser";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { CreateUnitModel } from "@/app/_lib/types/unit";
import {
  createUnitAction,
  updateUnitAction
} from "@/app/_lib/serverActions/unit";
import UnitForm from "./UnitForm";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isCopy: boolean;
  unit: Unit;
}

export default function CopyOrEditUnitDialog({
  isOpen,
  setIsOpen,
  isCopy,
  unit
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [name, setName, nameError, setNameError] = useInputValue("");
  const [description, setDescription] = useInputValue("");

  async function createOrUpdateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!name) setNameError(dict.errors.nameIsRequired);

    if (!name) return;

    const model: CreateUnitModel = {
      name,
      description
    };

    setIsLoading(true);
    const res = isCopy
      ? await createUnitAction(model)
      : await updateUnitAction(unit.id, model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setName(unit.name);
    setDescription(unit.description);
  }, [isOpen, unit]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCopy ? dict.labels.addUnit : dict.labels.editUnit}
          </DialogTitle>
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
            onClick={createOrUpdateRecord}
          >
            {dict.labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
