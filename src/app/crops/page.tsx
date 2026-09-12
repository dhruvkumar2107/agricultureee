"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Sprout, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  seedling: "bg-blue-50 text-blue-700",
  vegetative: "bg-green-50 text-green-700",
  flowering: "bg-purple-50 text-purple-700",
  fruiting: "bg-amber-50 text-amber-700",
  harvest: "bg-red-50 text-red-700",
};

export default function CropsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [crops, setCrop] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/farms")
        .then((r) => r.json())
        .then(async (d) => {
          const farms = d.farms || [];
          const allCrops: any[] = [];
          for (const farm of farms) {
            if (farm.fields) {
              for (const field of farm.fields) {
                if (field.crops) {
                  field.crops.forEach((c: any) => allCrops.push({ ...c, fieldName: field.name, farmName: farm.name }));
                }
              }
            }
          }
          setCrop(allCrops);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading crops..." className="py-20" />;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Crops</h2>
        <p className="text-sm text-stone-500 mt-1">Track crop health and growth stages</p>
      </div>

      {crops.length === 0 ? (
        <EmptyState icon={Sprout} title="No crops" description="Add crops to your fields to track them here" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop: any) => (
            <div key={crop.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Wheat className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{crop.name}</h3>
                    <p className="text-xs text-stone-400">{crop.variety}</p>
                  </div>
                </div>
                <StatusBadge status={crop.status} size="sm" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Stage</span>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", stageColors[crop.stage] || "bg-stone-50 text-stone-600")}>
                    {crop.stage}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Field</span>
                  <span className="text-stone-700 font-medium">{crop.fieldName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Farm</span>
                  <span className="text-stone-700 font-medium">{crop.farmName}</span>
                </div>
                {crop.plantedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Planted</span>
                    <span className="text-stone-700">{new Date(crop.plantedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
