import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children, hideSidebar = false }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col mesh-bg transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex w-full max-w-none">
        {/* Left sidebar — only for authenticated users and when not hidden */}
        {isAuthenticated && !hideSidebar && <Sidebar />}

        {/* Main content */}
        <main className={`flex-1 min-w-0 ${hideSidebar ? '' : 'px-4 sm:px-6 lg:px-8 py-6 lg:py-8'}`}>
          <div className={hideSidebar ? 'h-full' : 'max-w-screen-xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
