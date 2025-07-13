"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        Modal.setAppElement("body");
    }, []);

    return <>{children}</>;
}