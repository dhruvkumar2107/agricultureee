"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Radio,
  Leaf,
  Droplets,
  AlertTriangle,
  Calculator,
  Users,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Farms", href: "/farms", icon: Sprout },
  { label: "Stations", href: "/stations", icon: Radio },
  { label: "Crop Health", href: "/ai-analysis", icon: Leaf },
  { label: "Soil", href: "/soil", icon: Droplets },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "ROI Calculator", href: "/roi", icon: Calculator },
  { label: "FPO", href: "/fpo", icon: Users },
  { label: "Admin", href: "/admin", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-stone-200">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md">
          <Leaf className="w-5 h-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-stone-800 tracking-tight">AgriSentinel</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active ? "bg-green-50 text-green-700 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700")}
              title={collapsed ? item.label : undefined}>
              <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-green-600" : "text-stone-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-stone-400 truncate capitalize">{user?.role || "Role"}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-stone-200 text-stone-600 hover:text-stone-800">
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      <div className={cn("lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <button onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </div>

      <div className={cn("hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64")}>
        {sidebarContent}
      </div>
    </>
  );
}
