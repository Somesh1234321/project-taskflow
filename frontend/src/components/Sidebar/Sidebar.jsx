import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/project.service';

const Sidebar = ({ mobileOpen, setMobileOpen, onOpenNewProjectModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        if (data && data.success) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error('Error fetching sidebar projects:', err);
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [user, location.pathname]); // re-fetch when path changes to keep sidebar in sync

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-low border-r border-outline-variant select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-outline-variant">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSchqjIsaL2fblc_pciOtvDrT8shK5ODy-YIR0b0QrTXt7MDGeLnq4Ul4sjXQqFItsVyfDOrV6q8nxZpkLFEUTWIZj93EJEpKpmtQGpY5w4GRzo8o9ehIJwVzDpOLZV81vF4tuI9dYUf1KW03Ox3doQFPuqHKP6vQYe7tRD_8Ld6_DKsuhGmAAYmPjmEJ7I424ozuEFDyzBNDcxv31hokZ4wH4duhxR3TuovMjkgypp7crfgI9mVXFOsiSap7G44SpyRw1-xgxHmWz" 
              alt="TaskFlow Logo" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary text-[24px] leading-tight">TaskFlow</h1>
            <p className="font-label-md text-label-md text-on-surface-variant text-xs">Enterprise Tier</p>
          </div>
        </div>
        <button 
          onClick={onOpenNewProjectModal}
          className="w-full bg-primary-container hover:bg-primary-fixed hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all text-on-primary-container font-label-md text-label-md py-2.5 rounded-lg flex items-center justify-center gap-2 scale-95 active:scale-90"
        >
          <span className="material-symbols-outlined text-sm font-bold">add New Project</span>
          
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        <NavLink 
          to="/dashboard"
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-variant hover:text-on-surface transition-colors ${
              isActive 
                ? 'text-primary font-bold border-r-2 border-primary bg-surface-variant/20' 
                : 'text-on-surface-variant font-body-md'
            }`
          }
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}></span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </NavLink>

        {/* Dynamic Project list / Boards section */}
        <div className="mt-4 px-3 mb-1">
          <p className="font-code-sm text-[11px] text-on-surface-variant/50 uppercase tracking-widest">Active Boards</p>
        </div>

        {projects.length === 0 ? (
          <p className="px-3 py-2 text-xs text-on-surface-variant/40 italic">No projects found</p>
        ) : (
          projects.map((proj) => (
            <NavLink
              key={proj._id}
              to={`/project/${proj._id}`}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-variant hover:text-on-surface transition-colors truncate text-sm ${
                  isActive 
                    ? 'text-primary font-semibold border-r-2 border-primary bg-surface-variant/15' 
                    : 'text-on-surface-variant'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]"></span>
              <span className="truncate text-2xl border-black">↣{proj.title}</span>
            </NavLink>
          ))
        )}

        <NavLink 
          to="/settings"
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-variant hover:text-on-surface transition-colors mt-auto ${
              isActive 
                ? 'text-primary font-bold border-r-2 border-primary bg-surface-variant/20' 
                : 'text-on-surface-variant font-body-md'
            }`
          }
        >
          
          <span className="font-label-md text-label-md ">Settings</span>
        </NavLink>
      </nav>

      {/* User Profile Avatar Footer */}
      <div className="p-4 border-t border-outline-variant flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            className="w-8 h-8 rounded-full object-cover border border-outline-variant" 
            alt="User profile" 
            src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Qwx5nvN4fAs_OIz43g9gEKT1UHx3BXH0mE3jL0trzb-6lxIehgiGiGPPHD89sUaXZxRkrl97jjdJBnaw1mtFGZn8PDtd_P2TyKase3gUs67m8_bwn0KXysi5FyLIYur4n_NJvusRx94dKhjIEPi4oba-2MVEg6B7zQ8Btt5i0NSRwB5VF_YyMdlG3bTr3WGD-tYemTN34Ruh9WgDKhCghfmF3zK77JyDuU61YutTrTXeCTofsdXcKG05oiT6FVw34Do90jyC9o4C"} 
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-label-md text-label-md text-on-surface truncate">{user?.name || 'Alex Mercer'}</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant text-[11px] truncate">{user?.email || 'alex@taskflow.ai'}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-0 bottom-0 left-0 w-64 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
