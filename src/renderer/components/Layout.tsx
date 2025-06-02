import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSettings, FiHome, FiImage } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors ${
          isActive ? 'bg-[var(--bg-tertiary)]' : ''
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">IconForge AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <NavItem 
            icon={<FiHome className="w-5 h-5" />}
            label="Home"
            to="/"
          />
          <NavItem 
            icon={<FiImage className="w-5 h-5" />}
            label="My Icons"
            to="/my-icons"
          />
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors w-full"
        >
          <FiSettings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;