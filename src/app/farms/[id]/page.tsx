"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import { Sprout, MapPin, ArrowLeft, Radio, Wheat } from "lucide-react";
import Link from "next/link";

export default function FarmDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [farm, setFarm] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetch(`/api/farms/${params.id}`)
        .then((r) => r.json())
        .then((d) => { setFarm(d.farm); setFetching(false); })
        .catch(() => setFetching(false));
    }
  }, [user, params.id]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading farm..." className="py-20" />;
  if (!user || !farm) return null;

  return (
    <div className="space-y-6">
      <Link href="/farms" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="w-4 h-4" /> Back to Farms
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <Sprout className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">{farm.name}</h2>
            {farm.location && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
                <MapPin className="w-4 h-4" /> {farm.location}
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-stone-400">
              {farm.acreage && <span>{farm.acreage} acres</span>}
              <span>Created {new Date(farm.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {farm.fields && farm.fields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.fields.map((field: any) => (
              <div key={field.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Wheat className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-800">{field.name}</h4>
                    <p className="text-xs text-stone-400">{field.cropType || "No crop"}</p>
                  </div>
                </div>
                {field.area && <p className="text-sm text-stone-500 mt-3">Area: {field.area} acres</p>}
                {field.crops && field.crops.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {field.crops.map((crop: any) => (
                      <div key={crop.id} className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">{crop.name} ({crop.variety})</span>
                        <StatusBadge status={crop.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {farm.stations && farm.stations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Stations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.stations.map((station: any) => (
              <Link key={station.id} href={`/stations/${station.id}`}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800">{station.stationId}</h4>
                      <p className="text-xs text-stone-400">{station.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={station.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
