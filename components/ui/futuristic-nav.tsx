"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Calendar as Home, 
  User as Minhas, 
  Music as Bandas, 
  Settings as Ajustes,
  ShieldAlert as Admin
} from "lucide-react";
import { useAuth } from "../../App";

interface NavItem {
  id: number;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const LumaBar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const items: NavItem[] = [
    { id: 0, icon: <Home size={24} />, label: "Agenda", path: "/" },
    { id: 1, icon: <Minhas size={24} />, label: "Minhas", path: "/scales" },
    { id: 2, icon: <Bandas size={24} />, label: "Bandas", path: "/bands" },
    { id: 3, icon: <Ajustes size={24} />, label: "Ajustes", path: "/settings" },
  ];

  if (user?.role === 'admin') {
    items.push({ id: 4, icon: <Admin size={24} />, label: "Admin", path: "/admin" });
  }

  // Find active index based on current path
  const activeIndex = items.findIndex(item => 
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 pointer-events-none">
      <div className="relative flex items-center justify-center gap-2 sm:gap-4 bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-full px-4 py-2 shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden pointer-events-auto">
        
        {/* Active Indicator Glow */}
        {activeIndex !== -1 && (
          <motion.div
            layoutId="active-indicator"
            className="absolute w-12 h-12 bg-gradient-to-r from-mint to-blue-400 rounded-full blur-2xl -z-10"
            animate={{
              left: `${(activeIndex / items.length) * 100 + (100 / items.length / 2)}%`,
              translateX: "-50%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.div key={item.id} className="relative flex flex-col items-center group">
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 
                  transition-colors z-10 rounded-2xl
                  ${isActive ? 'text-navy dark:text-mint' : 'text-gray-400 dark:text-white/40 hover:text-navy dark:hover:text-white'}
                `}
              >
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    y: isActive ? -2 : 0
                  }}
                >
                  {item.icon}
                </motion.div>

                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-mint/20 dark:bg-mint/10 rounded-2xl -z-10"
                  />
                )}
              </NavLink>

              {/* Label (Visible on hover or active on larger screens) */}
              <span className="absolute bottom-full mb-3 px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-navy text-white dark:bg-mint dark:text-navy opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LumaBar;
