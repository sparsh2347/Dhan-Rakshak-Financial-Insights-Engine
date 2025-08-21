"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";

type ChartData = {
  Price: [string, string][];
  DMA50: [string, string][];
  DMA200: [string, string][];
  Volume: [string, number, { delivery: number }][];
};

export default function Chart({ company }: { company: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chart?companyId=1489&days=365`) // Replace with dynamic companyId if needed
      .then((res) => res.json())
      .then((json) => {
        const chartData = json.chartData as ChartData;

        // Combine into single array of objects
        const combined = chartData.Price.map(([date, price], idx) => ({
          date,
          price: parseFloat(price.replace(/,/g, "")),
          dma50: parseFloat(chartData.DMA50[idx][1].replace(/,/g, "")),
          dma200: parseFloat(chartData.DMA200[idx][1].replace(/,/g, "")),
          volume: chartData.Volume[idx][1],
          delivery: chartData.Volume[idx][2].delivery,
        }));

        setData(combined);
        setLoading(false);
      });
  }, [company]);

  if (loading) return <div>Loading chart...</div>;

  return (
    <div className="flex  w-[80%] h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" hide />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(val) => `₹ ${val.toFixed(2)}`}
            tick={{ fill: "#ccc" }}
            label={{
              value: "Price on NSE",
              angle: 90,
              position: "insideRight",
              fill: "#ccc",
              offset: 10,
              style: { textAnchor: "middle" },
            }}
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            tick={{ fill: "#ccc" }}
            label={{
              value: "Volume",
              angle: -90,
              position: "insideLeft",
              fill: "#ccc",
              offset: 10,
              style: { textAnchor: "middle" },
            }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: "#1f1f1f", color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />

          <Bar
            yAxisId="right"
            dataKey="volume"
            fill="#b0c4de"
            name="Volume"
            barSize={20}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
            name="Price"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="dma50"
            stroke="#82ca9d"
            dot={false}
            name="50 DMA"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="dma200"
            stroke="#ff7300"
            dot={false}
            name="200 DMA"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
