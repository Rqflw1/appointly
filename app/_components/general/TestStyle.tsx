"use client";

import { Badge } from "@/app/_shadcn/components/ui/badge";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Input } from "@/app/_shadcn/components/ui/input";

export default function TestStyle() {
  const invalid = true;
  return (
    <div className="p-4">
      <div className="flex gap-4">
        <div className="h-8 text-center font-semibold bg-background text-foreground">
          Def
        </div>
        <div className="h-8 text-center font-semibold bg-primary text-primary-foreground">
          Prim
        </div>
        <div className="h-8 text-center font-semibold bg-secondary text-secondary-foreground">
          Sec
        </div>
        <div className="h-8 text-center font-semibold bg-accent text-accent-foreground">
          Acc
        </div>
        <div className="h-8 text-center font-semibold bg-card text-card-foreground">
          Card
        </div>
        <div className="h-8 text-center font-semibold bg-popover text-popover-foreground">
          Pop
        </div>
        <div className="h-8 text-center font-semibold bg-destructive text-foreground">
          Err
        </div>
        <div className="h-8 text-center font-semibold bg-background border border-border">
          Bor
        </div>
        <div className="h-8 text-center font-semibold bg-input ring ring-ring">
          InRing
        </div>
      </div>
      <div className="flex gap-4">
        <Badge variant="tertiary" aria-invalid={invalid}>
          Test
        </Badge>
        <Badge variant="destructive" aria-invalid={invalid}>
          Test
        </Badge>
      </div>
      <div className="flex gap-4">
        <Button disabled={invalid} variant="default">
          Test
        </Button>
        <Button disabled={invalid} variant="secondary">
          Test
        </Button>
        <Button disabled={invalid} variant="ghost">
          Test
        </Button>
        <Button disabled={invalid} variant="link">
          Test
        </Button>
        <Button disabled={invalid} variant="destructive">
          Test
        </Button>
      </div>
      <div>
        <Checkbox />
      </div>
      <div className="w-64">
        <Input type="text" />
      </div>
    </div>
  );
}
