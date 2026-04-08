"use client";

import { useEffect, useRef } from "react";

export function useWindowEvent<T extends Event = Event>(
    eventName: string,
    callback: (e: T) => void
) {
    const savedCallback = useRef<((e: T) => void) | null>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const listener = (e: any) => {
            if (savedCallback.current) savedCallback.current(e);
        };

        window.addEventListener(eventName, listener);
        return () => window.removeEventListener(eventName, listener);
    }, [eventName]);
}
