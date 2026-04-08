"use client";

import { useState } from "react";

export function useFormState() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    return { isLoading, setIsLoading, error, setError };
}
