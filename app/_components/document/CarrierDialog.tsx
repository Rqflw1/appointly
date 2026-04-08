"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { DEFAULT_COUNTRY } from "@/app/_lib/constants/general";
import { countries, Country } from "@/app/_lib/constants/countries";
import { SetState } from "@/app/_lib/types/general";
import { cn } from "@/app/_shadcn/lib/utils";
import { Label } from "@/app/_shadcn/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import CountryInput from "../input/CountryInput";
import { Input } from "@/app/_shadcn/components/ui/input";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";

interface ComponentProps {
  showCarrierInput: [boolean, SetState<boolean>];
  countryInput: [Country, SetState<Country>];
  nameInput: [string, SetState<string>, string?];
  regNumInput: [string, SetState<string>];
  driverInput: [string, SetState<string>];
  vehicleInput: [string, SetState<string>];
  vehicleNumInput: [string, SetState<string>];
  originAddressInput: [string, SetState<string>];
  destinationAddressInput: [string, SetState<string>];
}

export default function CarrierDialog({
  showCarrierInput: [showCarrierProp, setShowCarrierProp],
  countryInput: [countryProp, setCountryProp],
  nameInput: [nameProp, setNameProp],
  regNumInput: [regNumProp, setRegNumProp],
  driverInput: [drivePropr, setDriverProp],
  vehicleInput: [vehicleProp, setVehicleProp],
  vehicleNumInput: [vehicleNumProp, setVehicleNumProp],
  originAddressInput: [originAddressProp, setOriginAddressProp],
  destinationAddressInput: [destinationAddressProp, setDestinationAddressProp]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [showCarrier, setShowCarrier] = useState(true);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [name, setName] = useState("");
  const [regNum, setRegNum] = useState("");
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicleNum, setVehicleNum] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  async function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setShowCarrierProp(showCarrier);
    setCountryProp(country);
    setNameProp(name);
    setRegNumProp(regNum);
    setDriverProp(driver);
    setVehicleProp(vehicle);
    setVehicleNumProp(vehicleNum);
    setOriginAddressProp(originAddress);
    setDestinationAddressProp(destinationAddress);

    setIsOpen(false);
  }

  useEffect(() => {
    setShowCarrier(showCarrierProp);
    const country = countries.find(({ iso2 }) => iso2 === countryProp.iso2);
    setCountry(country || DEFAULT_COUNTRY);
    setName(nameProp);
    setRegNum(regNumProp);
    setDriver(drivePropr);
    setVehicle(vehicleProp);
    setVehicleNum(vehicleNumProp);
    setOriginAddress(originAddressProp);
    setDestinationAddress(destinationAddressProp);
  }, [
    isOpen,
    showCarrierProp,
    countryProp,
    nameProp,
    regNumProp,
    drivePropr,
    vehicleProp,
    vehicleNumProp,
    originAddressProp,
    destinationAddressProp
  ]);

  return (
    <div>
      <div
        className="p-8 flex flex-col gap-2 rounded-3xl border border-border hover:bg-hover"
        onClick={() => setIsOpen(true)}
      >
        <DataRow value={nameProp} placeholder={dict.labels.companyName} />
        <DataRow value={regNumProp} placeholder={dict.labels.regNumber} />
        <DataRow value={drivePropr} placeholder={dict.labels.driver} />
        <DataRow value={vehicleProp} placeholder={dict.labels.vehicleModel} />
        <DataRow
          value={vehicleNumProp}
          placeholder={dict.labels.vehicleNumber}
        />
        <DataRow
          value={originAddressProp}
          placeholder={dict.labels.originAddress}
        />
        <DataRow
          value={destinationAddressProp}
          placeholder={dict.labels.destinationAddress}
        />
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.carrier}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
              <div className="font-semibold text-foreground">
                {dict.labels.companyInformation}
              </div>
              <div>
                <Label htmlFor="country">{dict.labels.country}</Label>
                <CountryInput
                  className="mt-2"
                  selected={country}
                  onSelect={setCountry}
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
                />
              </div>
              <div>
                <Label htmlFor="regNum">{dict.labels.regNumber}</Label>
                <Input
                  id="regNum"
                  type="text"
                  className="mt-2"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
              <div className="font-semibold text-foreground">
                {dict.labels.vehicleInformation}
              </div>
              <div>
                <Label htmlFor="driver">{dict.labels.driver}</Label>
                <Input
                  id="driver"
                  type="text"
                  className="mt-2"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vehicle">{dict.labels.vehicleModel}</Label>
                <Input
                  id="vehicle"
                  type="text"
                  className="mt-2"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vehicleNum">{dict.labels.vehicleNumber}</Label>
                <Input
                  id="vehicleNum"
                  type="text"
                  className="mt-2"
                  value={vehicleNum}
                  onChange={(e) => setVehicleNum(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
              <div className="font-semibold text-foreground">
                {dict.labels.addressInformation}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="originAddress">
                    {dict.labels.originAddress}
                  </Label>
                  <Input
                    id="originAddress"
                    type="text"
                    className="mt-2"
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationAddress">
                    {dict.labels.destinationAddress}
                  </Label>
                  <Input
                    id="destinationAddress"
                    type="text"
                    className="mt-2"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showCarrier"
              checked={showCarrier}
              onCheckedChange={(value) => setShowCarrier(!!value)}
            />
            <Label htmlFor="showCarrier">{dict.labels.showCarrier}</Label>
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

interface DataRowProps {
  className?: string;
  value: string;
  placeholder: string;
}

function DataRow({ className, value, placeholder }: DataRowProps) {
  return (
    <div className={cn({ "text-secondary-foreground": !value }, className)}>
      {value || placeholder}
    </div>
  );
}
