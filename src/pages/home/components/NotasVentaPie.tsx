import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface NotasVentaPieProps {
  collected: number;
  pending: number;
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] shadow-xl rounded-lg p-3 text-sm">
        <p style={{ color: payload[0].payload.color }} className="font-semibold">
          {payload[0].name}: S/ {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function NotasVentaPie({ collected, pending }: NotasVentaPieProps) {
  const data = [
    { name: "Total Cobrado", value: collected, color: "#3b82f6" },
    { name: "Pendiente de Cobro", value: pending, color: "#ef4444" },
  ];

  const total = collected + pending;

  return (
    <div className="h-[240px] w-full mt-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: "20px", fontSize: "13px", color: "#d1d5db" }} />
          <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-lg font-bold text-white">
          {total > 0 ? `S/ ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "S/ 0.00"}
        </p>
        {/* <-- AQUI LE CAMBIAMOS A "TOTAL VENTAS" PARA QUE ALVARO Y EL CLIENTE ESTÉN FELICES --> */}
        <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Total Ventas</p>
      </div>
    </div>
  );
}