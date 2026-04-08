"use client";

import { ChangeEvent, DragEvent, useContext, useRef } from "react";
import { Upload, X } from "lucide-react";
import { LocaleContext } from "../context/LocaleProvider";

interface ComponentProps {
  id?: string;
  file: File | null;
  previewSrc: string;
  onChange: (file: File | null) => void;
  className?: string;
}

export default function ImageInput({
  id,
  file,
  previewSrc,
  onChange,
  className
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const multiple = false;

  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    onChange(files.at(0) || null);
  };

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    onChange(files.at(0) || null);
  }

  function removeFile() {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  return (
    <div className={className}>
      <div
        className="p-8 bg-secondary rounded-3xl border-2 border-secondary-foreground border-dashed cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          hidden
          id={id || "browse"}
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept=".png,.jpg"
          onChange={onFileChange}
        />
        {previewSrc && (
          <img className="w-full h-48 object-contain" src={previewSrc} />
        )}
        {!previewSrc && (
          <div>
            <div className="flex justify-center">
              <Upload />
            </div>
            <div className="mt-2 text-sm text-center">
              {dict.labels.clickOrDragAndDrop}
            </div>
            <div className="mt-2 text-sm text-center text-secondary-foreground">{`${dict.labels.allowedFileTypes}: .png, .jpg`}</div>
          </div>
        )}
      </div>
      {file && (
        <div className="mt-2 ml-4 flex items-center gap-2 text-xs text-secondary-foreground">
          <div>{file.name}</div>
          <X
            className="shrink-0 size-4 cursor-pointer text-secondary-foreground hover:text-foreground"
            onClick={removeFile}
          />
        </div>
      )}
    </div>
  );
}
