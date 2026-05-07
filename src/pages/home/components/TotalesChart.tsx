import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TotalesChartProps {
  totalSales: number;
  collected: number;
  currencySymbol?: string; 
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] shadow-xl rounded-lg p-3 text-sm">
        <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {currencySymbol} {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalesChart({ totalSales, collected, currencySymbol = "S/" }: TotalesChartProps) {
  // 1. AQUI: Cambiamos "Total Ventas" por "Total Crédito"
  const data = [
    {
      name: "Periodo actual",
      "Total Crédito": totalSales, 
      "Total Cobrado": collected,
    }
  ];

  return (
    <div className="h-[240px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={12}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b8" strokeOpacity={0.4} />
          
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888888" }} axisLine={false} tickLine={false} />
          <YAxis
            allowDecimals={false}
            tickFormatter={(value) => value > 0 ? `${currencySymbol} ${value.toLocaleString()}` : '0'}
            tick={{ fontSize: 12, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
            width={85}
          />
          
          <Tooltip 
            content={<CustomTooltip currencySymbol={currencySymbol} />} 
            cursor={{ fill: "#94a3b8", opacity: 0.1 }} 
          />
          
          <Legend 
            iconType="circle" 
            verticalAlign="top" 
            align="center" 
            wrapperStyle={{ paddingBottom: "20px", fontSize: "13px" }} 
            formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
          />
          
          <Bar dataKey="Total Crédito" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={60} />
          <Bar dataKey="Total Cobrado" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}