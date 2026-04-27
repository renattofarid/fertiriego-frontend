import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TotalesChartProps {
  totalSales: number;
  collected: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] shadow-xl rounded-lg p-3 text-sm">
        <p className="font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: S/ {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalesChart({ totalSales, collected }: TotalesChartProps) {
  const data = [
    {
      name: "Periodo actual",
      "Total Ventas": totalSales, // <-- Nombre corregido
      "Total Cobrado": collected,
    }
  ];

  return (
    <div className="h-[240px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={12}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            allowDecimals={false}
            tickFormatter={(value) => value > 0 ? `S/ ${value.toLocaleString()}` : '0'}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={85}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#334155", opacity: 0.2 }} />
          <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: "20px", fontSize: "13px", color: "#d1d5db" }} />
          
          <Bar dataKey="Total Ventas" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={60} />
          <Bar dataKey="Total Cobrado" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}