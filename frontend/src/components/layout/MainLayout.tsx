import React from 'react';
import { Navbar } from '../common/Navbar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <main className="container-fluid py-4">
                {children}
            </main>
        </div>
    );
};
