"use client";

import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const MOCK_DATA = [
  { time: "09:00", price: 0.124 },
  { time: "10:00", price: 0.126 },
  { time: "11:00", price: 0.125 },
  { time: "12:00", price: 0.128 },
  { time: "13:00", price: 0.131 },
  { time: "14:00", price: 0.129 },
  { time: "15:00", price: 0.132 },
];

export default function PriceChart() {
  return (
    <div className="h-full w-full flex flex-col font-bold">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <div className="text-[10px] text-deep-berry/70 uppercase tracking-widest mb-1 font-black">BOUQUET: XLM / BERRY 🍓</div>
          <div className="text-xl font-black text-strawberry-red">0.132 <span className="text-[10px] text-strawberry-pink font-bold ml-1">▲ 2.4%</span></div>
        </div>
        <div className="flex gap-1">
          {["1H", "1D", "1W"].map(t => (
            <button key={t} className={`px-2 py-1 plate text-[9px] font-black transition-all rounded-lg ${t === "1D" ? "bg-strawberry-red text-white" : "bg-strawberry-cream text-strawberry-red hover:bg-soft-pink"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[150px] recessed p-2 bg-strawberry-cream/30 rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_DATA}>
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              hide 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFF0F3', borderColor: '#FFB3C1', borderRadius: '12px' }}
              itemStyle={{ color: '#FF4D6D', fontWeight: 'black', fontSize: '10px' }}
              labelStyle={{ color: '#FF85A2', fontSize: '8px' }}
            />
            <Line 
              type="stepAfter" 
              dataKey="price" 
              stroke="#FF4D6D" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#FF4D6D", stroke: "#FFF" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
