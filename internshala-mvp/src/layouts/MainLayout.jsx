import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children, hideSidebar = false }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 flex w-full max-w-none">
        {/* Conditionally render Sidebar only when user is logged in */}
        {isAuthenticated && !hideSidebar && <Sidebar />}
        
        {/* Content area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
