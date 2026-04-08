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
import { round, toFixed } from "@/app/_lib/functions/general";
import { Item, Unit } from "@/app/_prisma/browser";
import {
  createItemsAction,
  updateItemAction
} from "@/app/_lib/serverActions/item";
import ItemForm from "./ItemForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { CreateItemModel } from "@/app/_lib/validation/item";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isCopy: boolean;
  item: Item;
  units: Unit[];
}

export default function CopyOrEditItemDialog({
  isOpen,
  setIsOpen,
  isCopy,
  item,
  units
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

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

  async function createOrUpdateRecord(e: MouseEvent<HTMLButtonElement>) {
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
    const res = isCopy
      ? await createItemsAction([model])
      : await updateItemAction(item.id, model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setSku(item.sku);
    setName(item.name);
    setDescription(item.description);
    setUnit(item.unit);
    setCurrency(item.currency);
    setBasePrice(toFixed(item.basePrice, 4));
    setDiscountRate(toFixed(item.discountRate * 100, 2));
    setDiscountValue(toFixed(item.discountValue, 2));
    setVatRate(toFixed((item.vatRate ?? NaN) * 100, 2));
    setVatValue(toFixed(item.vatValue, 2));
    setNetPrice(toFixed(item.netPrice, 4));
    setGrossPrice(toFixed(item.grossPrice, 2));
  }, [isOpen, item]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCopy ? dict.labels.addItem : dict.labels.editItem}
          </DialogTitle>
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
            onClick={createOrUpdateRecord}
          >
            {dict.labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
