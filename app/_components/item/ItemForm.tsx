"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import FormError from "../general/FormError";
import { Input } from "@/app/_shadcn/components/ui/input";
import { SetState } from "@/app/_lib/types/general";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import NumberInput from "../input/NumberInput";
import {
  calculatePriceProps,
  compareNumbers,
  round,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import InputWithDropdown from "../input/InputWithDropdown";
import DropdownInput from "../input/DropdownInput";
import { currencies } from "@/app/_lib/constants/currencies";
import UnitInput from "../input/UnitInput";
import { Unit } from "@/app/_prisma/browser";

interface ComponentProps {
  units: Unit[];

  skuInput: [string, SetState<string>];
  nameInput: [string, SetState<string>, string];
  descriptionInput: [string, SetState<string>];
  unitInput: [string, SetState<string>];
  currencyInput: [string, SetState<string>];
  basePriceInput: [string, SetState<string>];
  discountRateInput: [string, SetState<string>];
  discountValueInput: [string, SetState<string>];
  vatRateInput: [string, SetState<string>];
  vatValueInput: [string, SetState<string>];
  netPriceInput: [string, SetState<string>];
  grossPriceInput: [string, SetState<string>];
}

export default function ItemForm({
  units,
  skuInput: [sku, setSku],
  nameInput: [name, setName, nameError],
  descriptionInput: [description, setDescription],
  unitInput: [unit, setUnit],
  currencyInput: [currency, setCurrency],
  basePriceInput: [basePrice, setBasePrice],
  discountRateInput: [discountRate, setDiscountRate],
  discountValueInput: [discountValue, setDiscountValue],
  vatRateInput: [vatRate, setVatRate],
  vatValueInput: [vatValue, setVatValue],
  netPriceInput: [netPrice, setNetPrice],
  grossPriceInput: [grossPrice, setGrossPrice]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  function recalculateAndFormat() {
    const itemPriceProps = calculatePriceProps({
      quantity: 1,
      basePrice: parseFloat(basePrice) || 0,
      discountRate: round(parseFloat(discountRate) * 0.01, 4) || 0,
      vatRate: round(parseFloat(vatRate) * 0.01, 4)
    });

    setBasePrice(toFixed(itemPriceProps.basePrice, 4));
    setDiscountRate(toFixed(itemPriceProps.discountRate * 100, 2));
    setDiscountValue(toFixed(itemPriceProps.discountValue, 2));
    setVatRate(toFixed((itemPriceProps.vatRate ?? NaN) * 100, 2));
    setVatValue(toFixed(itemPriceProps.vatValue, 2));
    setNetPrice(toFixed(itemPriceProps.netPrice, 4));
    setGrossPrice(toFixed(itemPriceProps.grossPrice, 2));
  }

  return (
    <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
      <div>
        <Label htmlFor="sku">{dict.labels.sku}</Label>
        <Input
          id="sku"
          type="text"
          className="mt-2"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
      </div>
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
      <div>
        <Label htmlFor="unit">{dict.labels.unit}</Label>
        <UnitInput
          className="mt-2"
          units={units}
          value={unit}
          onChange={(value) => setUnit(value)}
          onSelect={(option) => setUnit(option.name)}
        />
      </div>
      <div>
        <Label htmlFor="currency">{dict.labels.currency}</Label>
        <DropdownInput
          className="mt-2 w-full"
          selected={currency}
          options={currencies}
          onChange={(option) => option && setCurrency(option)}
        />
      </div>
      <div>
        <Label htmlFor="basePrice">{dict.labels.basePrice}</Label>
        <NumberInput
          id="basePrice"
          className="mt-2"
          value={basePrice}
          onChange={(value) => setBasePrice(value)}
          onBlur={recalculateAndFormat}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountRate">{dict.labels.discountRate}</Label>
          <InputWithDropdown
            type="number"
            className="w-full mt-2"
            value={discountRate}
            options={[0, 5, 10, 15, 20, 25, 30]}
            renderValue={(value) => {
              const number = parseFloat(value);
              if (isNaN(number)) return "";
              return `${value} %`;
            }}
            renderOption={(option) => `${option} %`}
            getIsSelected={(value, _, option) =>
              compareNumbers(parseFloat(value), option)
            }
            onChange={(value) => setDiscountRate(value)}
            onSelect={(option) => setDiscountRate(toString(option))}
            onClose={recalculateAndFormat}
          />
        </div>
        <div>
          <Label>{dict.labels.discountValue}</Label>
          <NumberInput disabled className="mt-2" value={discountValue} />
        </div>
      </div>
      <div>
        <Label>{dict.labels.priceWithoutVat}</Label>
        <NumberInput disabled className="mt-2" value={netPrice} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vatRate">{dict.labels.vatRate}</Label>
          <InputWithDropdown
            type="number"
            className="w-full mt-2"
            value={vatRate}
            options={[NaN, 0, 5, 12, 21]}
            renderValue={(value) => {
              const number = parseFloat(value);
              if (isNaN(number)) return dict.labels.none;
              return `${value} %`;
            }}
            renderOption={(option) => {
              if (isNaN(option)) return dict.labels.none;
              return `${option} %`;
            }}
            getIsSelected={(value, _, option) =>
              compareNumbers(parseFloat(value), option)
            }
            onChange={(value) => setVatRate(value)}
            onSelect={(option) => setVatRate(toString(option))}
            onClose={recalculateAndFormat}
          />
        </div>
        <div>
          <Label>{dict.labels.vatValue}</Label>
          <NumberInput disabled className="mt-2" value={vatValue} />
        </div>
      </div>
      <div>
        <Label>{dict.labels.price}</Label>
        <NumberInput disabled className="mt-2" value={grossPrice} />
      </div>
    </div>
  );
}
