"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Settings, User, Bell, Shield, Globe, Save } from "lucide-react";
import NotificationToast from "@/components/NotificationToast";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    language: "en",
    theme: "light",
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading settings..." className="py-20" />;
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {saved && <NotificationToast message="Settings saved successfully!" type="success" onClose={() => setSaved(false)} />}

      <div>
        <h2 className="text-2xl font-bold text-stone-800">Settings</h2>
        <p className="text-sm text-stone-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-semibold text-stone-800">Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
            <input type="text" defaultValue={user.name} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
            <input type="email" defaultValue={user.email} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Role</label>
            <input type="text" defaultValue={user.role} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 capitalize" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Phone</label>
            <input type="text" defaultValue={user.phone || "Not set"} readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-semibold text-stone-800">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "notifications", label: "Push Notifications", desc: "Receive push notifications for alerts" },
            { key: "emailAlerts", label: "Email Alerts", desc: "Get alert summaries via email" },
            { key: "smsAlerts", label: "SMS Alerts", desc: "Critical alerts via SMS" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-stone-700">{item.label}</p>
                <p className="text-xs text-stone-400">{item.desc}</p>
              </div>
              <button onClick={() => setSettings((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? "bg-green-600" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-semibold text-stone-800">Preferences</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Language</label>
            <select value={settings.language} onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="te">Telugu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Timezone</label>
            <select value={settings.timezone} onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="Asia/Kolkata">IST (UTC+5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <Save className="w-4 h-4" /> Save Settings
        </button>
        <button onClick={logout}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}
