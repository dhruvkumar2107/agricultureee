"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Wifi, WifiOff, Zap, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  title: string;
  unreadNotifications?: number;
  isOnline?: boolean;
  simulationMode?: boolean;
  onSimulationToggle?: () => void;
}

export default function Header({
  title,
  unreadNotifications = 0,
  isOnline = true,
  simulationMode = false,
  onSimulationToggle,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="flex items-center gap-4 ml-10 lg:ml-0">
        <h1 className="text-xl font-bold text-stone-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          isOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
          <span className="relative flex h-2 w-2">
            {isOnline && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")} />
          </span>
          {isOnline ? "Online" : "Offline"}
        </div>

        {onSimulationToggle && (
          <button onClick={onSimulationToggle}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              simulationMode ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" : "bg-stone-100 text-stone-500 hover:bg-stone-200")}>
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulation</span>
          </button>
        )}

        <button className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl hover:bg-stone-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-stone-800 leading-tight">{user?.name || "User"}</p>
              <p className="text-[11px] text-stone-400 leading-tight capitalize">{user?.role || "Role"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50">
              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                <User className="w-4 h-4" />
                Profile
              </button>
              <hr className="my-1 border-stone-100" />
              <button onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
