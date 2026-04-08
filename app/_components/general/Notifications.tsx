"use client";

import { useState } from "react";
import { Toggle } from "@/app/_shadcn/components/ui/toggle";
import { Bell } from "lucide-react";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Toggle
      variant="secondary"
      size="icon"
      pressed={isOpen}
      onPressedChange={(value) => setIsOpen(value)}
    >
      <Bell />
    </Toggle>
  );
}
