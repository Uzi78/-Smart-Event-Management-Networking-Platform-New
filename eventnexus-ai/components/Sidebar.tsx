
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { UserRole } from '../types';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (id: string) => void;
  userRole: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, userRole, isOpen, setIsOpen }) => {
  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-theme-surface border-r border-theme-border transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-10 px-2 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">N</div>
              <h1 className="text-xl font-black text-theme-text tracking-tighter">EventNexus</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-theme-sub">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5 custom-scrollbar overflow-y-auto">
            <p className="text-[10px] font-bold text-theme-sub uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>
            {filteredNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${currentTab === item.id 
                    ? 'bg-indigo-600/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.05)]' 
                    : 'text-theme-sub hover:bg-theme-border hover:text-theme-text'}
                `}
              >
                <span className={currentTab === item.id ? 'text-indigo-500' : 'text-theme-sub'}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-theme-border">
            <div className="p-3 bg-theme-border rounded-xl border border-theme-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/20 overflow-hidden flex items-center justify-center">
                  <img src="https://picsum.photos/seed/alex/100" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-theme-text truncate">Alex Rivera</p>
                  <p className="text-[10px] font-bold text-theme-sub truncate uppercase tracking-widest">Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
