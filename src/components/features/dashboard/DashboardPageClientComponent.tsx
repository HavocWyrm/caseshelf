"use client";

import { usePageTitle } from "@component/layout/hooks/usePageTitle";
import DashboardCard from "@component/features/dashboard/DashboardCard";
import { CollectionItemType } from "@/generated/prisma";

interface DashboardPageClientProps {
    groupedByType: Record<CollectionItemType, number>;
}

export default function DashboardPageClient({ groupedByType }: DashboardPageClientProps) {
    usePageTitle("CaseShelf");

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                {(Object.entries(groupedByType) as [CollectionItemType, number][]).map(
                    ([itemType, itemCount]) => (
                        <DashboardCard
                            key={itemType}
                            itemType={itemType}
                        />
                    ),
                )}
            </div>
        </div>
    );
}