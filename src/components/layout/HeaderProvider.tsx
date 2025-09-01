"use client";

import { useState, ReactNode } from "react";
import { HeaderContext } from "./Header";
import Header from "./Header";

interface HeaderProviderProps {
  children: ReactNode;
}

export default function HeaderProvider({ children }: HeaderProviderProps) {
  const [title, setTitle] = useState('CaseShelf');

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      <Header title={title} />
      <main className="main-content">
        {children}
      </main>
    </HeaderContext.Provider>
  );
}