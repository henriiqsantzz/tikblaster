import React from 'react';
import Sidebar from '@/components/sidebar';
import TopBar from '@/components/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#faf5f7' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-[calc(100%-224px)] lg:ml-56">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
