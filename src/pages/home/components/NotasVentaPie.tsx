import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface NotasVentaPieProps {
  collected: number;
  pending: number;
  currencySymbol?: string;
}

const CustomPieTooltip = ({ active, payload, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] shadow-xl rounded-lg p-3 text-sm">
        <p style={{ color: payload[0].payload.color }} className="font-semibold">
          {payload[0].name}: {currencySymbol} {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function NotasVentaPie({ collected, pending, currencySymbol= "S/"}: NotasVentaPieProps) {
  const data = [
    { name: "Total Cobrado", value: collected, color: "#3b82f6" },
    { name: "Pendiente de Cobro", value: pending, color: "#ef4444" },
  ];

  const total = collected + pending;

  return (
    <div className="h-[240px] w-full mt-4 relative">
      
      <div className="absolute top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
        <p className="text-lg font-bold text-slate-900 dark:text-white">
          {total > 0 ? `${currencySymbol} ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currencySymbol} 0.00`}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase tracking-wider mt-1">Total Crédito</p>
      </div>

      <div className="relative w-full h-full z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Legend 
              iconType="circle" 
              verticalAlign="top" 
              align="center" 
              wrapperStyle={{ paddingBottom: "20px", fontSize: "13px" }} 
              formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
            />
            <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip currencySymbol={currencySymbol}/>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}
