import React, { useState } from 'react';
import { Leaf, Info, HelpCircle, Calculator, Search, Check, RefreshCw, BarChart2 } from 'lucide-react';

const SUBCATEGORY_PRICES = {
  'Beef': 500, // ₹500/kg
  'Chicken': 250, // ₹250/kg
  'Milk': 60, // ₹60/L
  'Plant Milk': 120, // ₹120/L
  'Fruit/Vegetables': 150, // ₹150/kg
  'Generic Grocery': 200, // ₹200/kg
  'Taxi/Cab': 20, // ₹20/km
  'Metro Transit': 3, // ₹3/km
  'Bus ticket': 2, // ₹2/km
  'Generic Transit': 15, // ₹15/km
  'Electricity': 8, // ₹8/kWh
  'Solar/Clean Electricity': 8, // ₹8/kWh
  'Water Utility': 0.02, // ₹0.02/L
  'Fast Fashion Clothing': 1000, // ₹1000/item
  'Eco-friendly/Organic Cotton': 1500, // ₹1500/item
  'Plastic Goods': 20, // ₹20/item
  'Generic Shopping': 500, // ₹500/item
  'Beef Restaurant Meal': 300, // ₹300/meal
  'Vegetarian Restaurant Meal': 200, // ₹200/meal
  'Coffee/Cafe': 80, // ₹80/beverage
  'Generic Dining': 300, // ₹300/meal
  'General Service': 100, // ₹100/service
  'Miscellaneous': 100
};

const EMISSION_FACTORS = {
  'Beef': 27.2, // kg CO2e/kg
  'Chicken': 6.9, // kg CO2e/kg
  'Milk': 3.1, // kg CO2e/L
  'Plant Milk': 0.9, // kg CO2e/L
  'Fruit/Vegetables': 0.3, // kg CO2e/kg
  'Generic Grocery': 2.5, // kg CO2e/kg
  'Taxi/Cab': 4.4, // kg CO2e/20km -> 0.22 kg/km
  'Metro Transit': 0.03, // kg CO2e/km
  'Bus ticket': 0.05, // kg CO2e/km
  'Generic Transit': 0.12, // kg CO2e/km
  'Electricity': 0.85, // kg CO2e/kWh
  'Solar/Clean Electricity': 0.04, // kg CO2e/kWh
  'Water Utility': 0.0003, // kg CO2e/L
  'Fast Fashion Clothing': 15.0, // kg CO2e/item
  'Eco-friendly/Organic Cotton': 4.8, // kg CO2e/item
  'Plastic Goods': 3.5, // kg CO2e/item
  'Generic Shopping': 8.0, // kg CO2e/item
  'Beef Restaurant Meal': 15.0, // kg CO2e/meal
  'Vegetarian Restaurant Meal': 1.5, // kg CO2e/meal
  'Coffee/Cafe': 0.4, // kg CO2e/beverage
  'Generic Dining': 4.5, // kg CO2e/meal
  'General Service': 1.0, // kg CO2e/service
  'Miscellaneous': 2.0
};

const UNIT_LABELS = {
  'Beef': 'kg',
  'Chicken': 'kg',
  'Milk': 'litres',
  'Plant Milk': 'litres',
  'Fruit/Vegetables': 'kg',
  'Generic Grocery': 'kg',
  'Taxi/Cab': 'km (price / ₹20)',
  'Metro Transit': 'km (price / ₹3)',
  'Bus ticket': 'km (price / ₹2)',
  'Generic Transit': 'km',
  'Electricity': 'kWh (price / ₹8)',
  'Solar/Clean Electricity': 'kWh (price / ₹8)',
  'Water Utility': 'litres (price / ₹0.02)',
  'Fast Fashion Clothing': 'items',
  'Eco-friendly/Organic Cotton': 'items',
  'Plastic Goods': 'items',
  'Generic Shopping': 'items',
  'Beef Restaurant Meal': 'meals',
  'Vegetarian Restaurant Meal': 'meals',
  'Coffee/Cafe': 'beverages',
  'Generic Dining': 'meals',
  'General Service': 'services',
  'Miscellaneous': 'units'
};

const ECOPOINTS_BANDS = [
  { minEmission: 0, maxEmission: 2, points: 90, tier: 'Excellent', color: 'text-emerald-500 bg-emerald-500/10' },
  { minEmission: 2, maxEmission: 10, points: 70, tier: 'Good', color: 'text-teal-500 bg-teal-500/10' },
  { minEmission: 10, maxEmission: 30, points: 40, tier: 'Fair', color: 'text-amber-500 bg-amber-500/10' },
  { minEmission: 30, maxEmission: 50, points: 20, tier: 'High Footprint', color: 'text-orange-500 bg-orange-500/10' },
  { minEmission: 50, maxEmission: Infinity, points: 5, tier: 'Critical', color: 'text-rose-500 bg-rose-500/10' }
];

export default function EcoGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('Beef');
  const [inputPrice, setInputPrice] = useState('500');

  // Calculator logic
  const avgPrice = SUBCATEGORY_PRICES[selectedSubCat];
  const emissionFactor = EMISSION_FACTORS[selectedSubCat];
  const unitLabel = UNIT_LABELS[selectedSubCat];
  
  const parsedPrice = parseFloat(inputPrice) || 0;
  const calculatedQuantity = parsedPrice / avgPrice;
  const calculatedEmission = parseFloat((calculatedQuantity * emissionFactor).toFixed(2));
  const calculatedScore = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-0.05 * calculatedEmission))));
  
  // Find allotted points
  const matchedBand = ECOPOINTS_BANDS.find(band => 
    calculatedEmission >= band.minEmission && calculatedEmission <= band.maxEmission
  ) || ECOPOINTS_BANDS[ECOPOINTS_BANDS.length - 1];

  // Filter items in list
  const filteredSubCats = Object.keys(SUBCATEGORY_PRICES).filter(sub =>
    sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            Sustainability Guide & Carbon Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Discover the mathematics behind the EcoPoints scoring system, explore environmental emission factors, and dynamically simulate impact.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shrink-0">
          <Info className="w-4 h-4" />
          Verified Databases (FAO, Agribalyse, IEA)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Calculator & Documentation */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive Calculator Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm uppercase tracking-wider">
              <Calculator className="w-5 h-5" />
              Interactive Impact Calculator
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Product/Service Category
                </label>
                <select
                  value={selectedSubCat}
                  onChange={(e) => setSelectedSubCat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(SUBCATEGORY_PRICES).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Transaction Amount (INR / ₹)
                </label>
                <input
                  type="number"
                  value={inputPrice}
                  onChange={(e) => setInputPrice(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Calculations Output Dashboard */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Qty</span>
                <span className="block text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
                  {calculatedQuantity.toFixed(2)} {unitLabel.split(' ')[0]}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Footprint Magnitude</span>
                <span className="block text-base font-black text-rose-500 mt-1">
                  {calculatedEmission.toFixed(2)} kg CO₂e
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon Score</span>
                <span className="block text-base font-bold text-emerald-500 mt-1">
                  {calculatedScore}/100
                </span>
              </div>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-lg py-1 border border-emerald-500/10">
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">EcoPoints Awarded</span>
                <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {matchedBand.points} Pts
                </span>
              </div>
            </div>

            {/* Quick documentation inside calculator */}
            <div className="text-[11px] leading-relaxed text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-500 dark:text-slate-300">Calculation Path:</span> A spent of ₹{parsedPrice} on <span className="underline">{selectedSubCat}</span> is divided by the average rate of ₹{avgPrice} to estimate a usage of {calculatedQuantity.toFixed(2)} {unitLabel.split(' ')[0]}. Multiplying by the verified LCA factor ({emissionFactor} kg CO₂e/{unitLabel.split(' ')[0]}) produces the magnitude of <span className="font-semibold">{calculatedEmission} kg CO₂e</span>. This magnitude falls into the <span className={`px-1.5 py-0.5 rounded ${matchedBand.color} font-bold`}>{matchedBand.tier}</span> band, yielding exactly <span className="font-bold text-emerald-500">{matchedBand.points} EcoPoints</span>.
            </div>
          </div>

          {/* Formulas and math docs */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Mathematical Formula Reference</h3>
            
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">1. Carbon Footprint Magnitude ($C_m$)</span>
                <p>Calculated dynamically based on category prices and emission coefficients:</p>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-emerald-600 dark:text-emerald-400 text-center border border-slate-100 dark:border-slate-800 my-2">
                  Quantity = Price / AverageSubCategoryPrice <br />
                  CarbonEmissionKg (Cm) = Quantity * EmissionFactor
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">2. Carbon Footprint Score ($S_{cf}$)</span>
                <p>An exponential decay function converts any unbounded emission magnitude ($C_m$) into a 1–100 score, scaling emissions gracefully without linear clipping:</p>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded font-mono text-emerald-600 dark:text-emerald-400 text-center border border-slate-100 dark:border-slate-800 my-2">
                  Sc = Math.round( 100 * e^(-0.05 * Cm) )
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Bandwidth Tables & Factors */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Predefined Bandwidth Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm uppercase tracking-wider">
              <BarChart2 className="w-5 h-5" />
              EcoPoints Bandwidth Mapping
            </div>
            
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-150 dark:border-slate-800 font-bold">
                    <th className="py-2.5 px-3">CO₂ Magnitude</th>
                    <th className="py-2.5 px-3">Points</th>
                    <th className="py-2.5 px-3 text-right">Impact Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                  {ECOPOINTS_BANDS.map((band, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-2.5 px-3 font-medium">
                        {band.maxEmission === Infinity ? `> ${band.minEmission} kg` : `${band.minEmission} - ${band.maxEmission} kg`}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-500">
                        {band.points} Pts
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${band.color}`}>
                          {band.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Carbon Factors Search List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                Carbon Factors Registry
              </span>
              <div className="relative w-40 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter factors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-150 dark:border-slate-800/60 p-2 rounded-xl no-scrollbar">
              {filteredSubCats.map(sub => (
                <div 
                  key={sub}
                  onClick={() => setSelectedSubCat(sub)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedSubCat === sub 
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs">
                    <span className="block font-medium">{sub}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      Avg Rate: ₹{SUBCATEGORY_PRICES[sub]} / {UNIT_LABELS[sub].split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 shrink-0">
                    {EMISSION_FACTORS[sub]} CO₂e
                  </span>
                </div>
              ))}
              {filteredSubCats.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-6">
                  No matching carbon factors found.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
