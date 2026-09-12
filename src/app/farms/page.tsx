"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Sprout, MapPin, Plus, ArrowRight } from "lucide-react";

export default function FarmsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [farms, setFarms] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/farms")
        .then((r) => r.json())
        .then((d) => { setFarms(d.farms || []); setFetching(false); })
        .catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading farms..." className="py-20" />;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">My Farms</h2>
          <p className="text-sm text-stone-500 mt-1">Manage your farms and fields</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <EmptyState icon={Sprout} title="No farms yet" description="Add your first farm to start monitoring" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm: any) => (
            <Link key={farm.id} href={`/farms/${farm.id}`}
              className="group bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mt-4">{farm.name}</h3>
              {farm.location && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-stone-500">
                  <MapPin className="w-4 h-4" />
                  {farm.location}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                {farm.acreage && <span>{farm.acreage} acres</span>}
                {farm.fields && <span>{farm.fields.length} fields</span>}
                {farm.stations && <span>{farm.stations.length} stations</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
