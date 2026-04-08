"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useInputValue<T>(
    initialValue: T
): [T, Dispatch<SetStateAction<T>>, string, Dispatch<SetStateAction<string>>] {
    const [value, setValue] = useState(initialValue);
    const [valueError, setValueError] = useState("");
    useEffect(() => setValueError(""), [value]);

    return [value, setValue, valueError, setValueError];
}
