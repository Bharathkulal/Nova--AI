import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';

const MainLayout = ({ setAuth }) => {
  return (
    <div className="relative min-h-screen bg-nova-dark text-white font-sans overflow-x-hidden flex">
      <ParticleBackground />
      <Sidebar setAuth={setAuth} />
      
      <div className="flex-1 flex flex-col md:ml-[80px] lg:ml-[280px] transition-all duration-300 relative z-10 w-full min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
