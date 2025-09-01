"use client";

import { useEffect } from "react";
import { useHeader } from "@component/layout/Header";

export function usePageTitle(title: string) {
    const { setTitle } = useHeader();

    useEffect(() => {
        setTitle(title);
    }, [title, setTitle]);
}