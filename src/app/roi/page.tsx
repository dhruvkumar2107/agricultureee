"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Sprout } from "lucide-react";

export default function ROIPage() {
  const [form, setForm] = useState({
    acreage: 10,
    cropType: "tomato",
    investmentPerAcre: 50000,
    expectedYield: 20,
    pricePerQuintal: 3000,
    soilHealthImprovement: 15,
    waterSavings: 20,
    laborSavings: 10,
  });

  const update = (field: string, value: number | string) => setForm((prev) => ({ ...prev, [field]: value }));

  const totalInvestment = form.acreage * form.investmentPerAcre;
  const expectedRevenue = form.acreage * form.expectedYield * form.pricePerQuintal;
  const savingsFromSoil = totalInvestment * (form.soilHealthImprovement / 100);
  const savingsFromWater = totalInvestment * (form.waterSavings / 100);
  const savingsFromLabor = totalInvestment * (form.laborSavings / 100);
  const totalSavings = savingsFromSoil + savingsFromWater + savingsFromLabor;
  const netProfit = expectedRevenue - totalInvestment + totalSavings;
  const roi = totalInvestment > 0 ? ((netProfit / totalInvestment) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">ROI Calculator</h2>
        <p className="text-sm text-stone-500 mt-1">Calculate return on investment for smart agriculture</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Farm Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Acreage</label>
                <input type="number" value={form.acreage} onChange={(e) => update("acreage", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Crop Type</label>
                <select value={form.cropType} onChange={(e) => update("cropType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="tomato">Tomato</option>
                  <option value="potato">Potato</option>
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="cotton">Cotton</option>
                  <option value="chilli">Chilli</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Investment per Acre (₹)</label>
                <input type="number" value={form.investmentPerAcre} onChange={(e) => update("investmentPerAcre", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Expected Yield (quintals/acre)</label>
                <input type="number" value={form.expectedYield} onChange={(e) => update("expectedYield", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Price per Quintal (₹)</label>
                <input type="number" value={form.pricePerQuintal} onChange={(e) => update("pricePerQuintal", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Smart Agriculture Savings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Soil Health Improvement (%)</label>
                <input type="number" value={form.soilHealthImprovement} onChange={(e) => update("soilHealthImprovement", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Water Savings (%)</label>
                <input type="number" value={form.waterSavings} onChange={(e) => update("waterSavings", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Labor Savings (%)</label>
                <input type="number" value={form.laborSavings} onChange={(e) => update("laborSavings", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm text-center">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mx-auto">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm text-stone-500 mt-3">ROI</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{roi}%</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-stone-400" />
              <h4 className="font-semibold text-stone-800">Breakdown</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Total Investment</span><span className="font-medium text-stone-700">₹{totalInvestment.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Expected Revenue</span><span className="font-medium text-stone-700">₹{expectedRevenue.toLocaleString()}</span></div>
              <hr className="border-stone-100" />
              <div className="flex justify-between"><span className="text-stone-500">Soil Health Savings</span><span className="font-medium text-green-600">₹{Math.round(savingsFromSoil).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Water Savings</span><span className="font-medium text-green-600">₹{Math.round(savingsFromWater).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Labor Savings</span><span className="font-medium text-green-600">₹{Math.round(savingsFromLabor).toLocaleString()}</span></div>
              <hr className="border-stone-100" />
              <div className="flex justify-between"><span className="text-stone-500">Total Savings</span><span className="font-medium text-green-600">₹{Math.round(totalSavings).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold"><span className="text-stone-700">Net Profit</span><span className="text-green-600">₹{Math.round(netProfit).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
