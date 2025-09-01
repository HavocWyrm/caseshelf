"use client";

import { createContext, useContext } from 'react';

interface HeaderContextType {
    title: string;
    setTitle: (title: string) => void;
}

export const HeaderContext = createContext<HeaderContextType | null>(null);

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
}

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="header-content">
                <h1 className="header-title">{title}</h1>
            </div>
        </header>
    );
}