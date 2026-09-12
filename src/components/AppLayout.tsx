"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import SimulationPanel from "@/components/SimulationPanel";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/farms": "Farms",
  "/stations": "Stations",
  "/ai-analysis": "AI Crop Health Analysis",
  "/soil": "Soil Monitoring",
  "/alerts": "Alerts",
  "/roi": "ROI Calculator",
  "/fpo": "FPO Dashboard",
  "/admin": "Admin Panel",
  "/settings": "Settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [simOpen, setSimOpen] = useState(false);

  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || "AgriSentinel";

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <OfflineBanner />
        <Header
          title={title}
          isOnline={true}
          simulationMode={simOpen}
          onSimulationToggle={() => setSimOpen(!simOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <SimulationPanel isOpen={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
