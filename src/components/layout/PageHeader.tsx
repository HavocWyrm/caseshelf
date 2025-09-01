"use client";

type PageHeaderProps = {
    pageTitle: string
};

export default function PageHeader({ pageTitle }: PageHeaderProps) {
    return (
        <header className="text-center p-4">
            <h1 className="text-4xl font-bold text-[theme(colors.foreground)]">
                {pageTitle}
            </h1>
        </header>
    );
}