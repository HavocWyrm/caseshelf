import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ModalProvider } from "@/lib/helpers/ModalContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ModalProvider>
            <div className="app-container">
                <Sidebar />
                <div className="content-wrapper">
                    <Header />
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </div>
        </ModalProvider>
    );
}