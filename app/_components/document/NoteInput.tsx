"use client";

import { useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import { SetState } from "@/app/_lib/types/general";

interface ComponentProps {
  noteInput: [string, SetState<string>];
}

export default function NoteInput({
  noteInput: [noteProp, setNoteProp]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [note, setNote] = useInputValue("");

  useEffect(() => setNote(noteProp), [noteProp]);

  return (
    <Textarea
      placeholder={dict.labels.note}
      className="h-32"
      value={note}
      onChange={(e) => setNote(e.target.value)}
      onBlur={() => setNoteProp(note)}
    />
  );
}
