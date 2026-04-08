"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import {
  DEFAULT_CURRENCY,
  DEFAULT_VAT_RATE,
  toastHelper
} from "@/app/_lib/constants/general";
import { round, toFixed } from "@/app/_lib/functions/general";
import { createItemsAction } from "@/app/_lib/serverActions/item";
import ItemForm from "./ItemForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { Company, Unit } from "@/app/_prisma/browser";
import { CreateItemModel } from "@/app/_lib/validation/item";

interface ComponentProps {
  company: Company;
  units: Unit[];
}

export default function NewItemDialog({ company, units }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useFormState();

  const [sku, setSku] = useInputValue("");
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [description, setDescription] = useInputValue("");
  const [unit, setUnit] = useInputValue("");
  const [currency, setCurrency] = useInputValue("");
  const [basePrice, setBasePrice] = useInputValue("");
  const [discountRate, setDiscountRate] = useInputValue("");
  const [discountValue, setDiscountValue] = useInputValue("");
  const [vatRate, setVatRate] = useInputValue("");
  const [vatValue, setVatValue] = useInputValue("");
  const [netPrice, setNetPrice] = useInputValue("");
  const [grossPrice, setGrossPrice] = useInputValue("");

  async function createRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!name) setNameError(dict.errors.nameIsRequired);

    if (!name) return;

    const model: CreateItemModel = {
      sku,
      name,
      description,
      unit,
      quantity: 1,
      currency,
      basePrice: round(parseFloat(basePrice), 4),
      discountRate: round(parseFloat(discountRate) * 0.01, 4),
      discountValue: round(parseFloat(discountValue), 4),
      vatRate: round(parseFloat(vatRate) * 0.01, 4),
      vatValue: round(parseFloat(vatValue), 2),
      netPrice: round(parseFloat(netPrice), 4),
      grossPrice: round(parseFloat(grossPrice), 2),
      baseTotal: round(parseFloat(basePrice), 2),
      discountTotal: round(parseFloat(discountValue), 2),
      netTotal: round(parseFloat(netPrice), 2),
      vatTotal: round(parseFloat(vatValue), 2),
      grossTotal: round(parseFloat(grossPrice), 2)
    };

    setIsLoading(true);
    const res = await createItemsAction([model]);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setSku("");
    setName("");
    setDescription("");
    setUnit("");
    setCurrency(company.currency || DEFAULT_CURRENCY);
    setBasePrice("");
    setDiscountRate("0");
    setDiscountValue("");
    setVatRate(toFixed((company.vatRate ?? DEFAULT_VAT_RATE) * 100, 2));
    setVatValue("");
    setNetPrice("");
    setGrossPrice("");
  }, [isOpen, company]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.addItem}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addItem}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <ItemForm
              units={units}
              skuInput={[sku, setSku]}
              nameInput={[name, setName, nameError]}
              descriptionInput={[description, setDescription]}
              unitInput={[unit, setUnit]}
              currencyInput={[currency, setCurrency]}
              basePriceInput={[basePrice, setBasePrice]}
              discountRateInput={[discountRate, setDiscountRate]}
              discountValueInput={[discountValue, setDiscountValue]}
              vatRateInput={[vatRate, setVatRate]}
              vatValueInput={[vatValue, setVatValue]}
              netPriceInput={[netPrice, setNetPrice]}
              grossPriceInput={[grossPrice, setGrossPrice]}
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
