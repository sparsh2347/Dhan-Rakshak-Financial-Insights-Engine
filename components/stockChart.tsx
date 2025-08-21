"use client";
import { format } from "date-fns";
import { useMemo, useState } from "react";
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
} from "recharts";

type ChartDataPoint = {
  date: string;
  price: number;
  dma50: number;
  dma200: number;
  volume: number;
  delivery: number;
};

const durationOptions: Record<string, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
  All: Infinity,
};

export default function StockChart({ rawChartData }: { rawChartData: any }) {
  const formattedData: ChartDataPoint[] = rawChartData.Price.map(
    ([date, price]: [string, string], index: number) => ({
      date,
      price: parseFloat(price),
      dma50: parseFloat(rawChartData.DMA50[index][1]),
      dma200: parseFloat(rawChartData.DMA200[index][1]),
      volume: rawChartData.Volume[index][1],
      delivery: rawChartData.Volume[index][2].delivery,
    }),
  );

  const [selectedDuration, setSelectedDuration] = useState("1Y");

  const filteredData = useMemo(() => {
    const days = durationOptions[selectedDuration];
    if (days === Infinity) return formattedData;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return formattedData.filter((d) => new Date(d.date) >= cutoffDate);
  }, [formattedData, selectedDuration]);

  const maxVolume = Math.max(...filteredData.map((d) => d.volume || 0));
  const allPrices = filteredData.flatMap((d) => [
    d.price ?? 0,
    d.dma50 ?? 0,
    d.dma200 ?? 0,
  ]);

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full">
      <h2 className="text-xl font-semibold text-center mb-4 text-black">
        Stock Price & Moving Averages
      </h2>

      {/* Duration Picker */}
      <div className="flex justify-center gap-2 mb-4">
        {Object.keys(durationOptions).map((duration) => (
          <button
            key={duration}
            className={`px-3 py-1 rounded-full border text-sm ${
              selectedDuration === duration
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => setSelectedDuration(duration)}
          >
            {duration}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* X Axis */}
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) => format(new Date(dateStr), "dd MMM")}
            interval="preserveStartEnd"
            minTickGap={30}
            tick={{ fontSize: 12 }}
          />

          {/* Y Axis - Volume */}
          <YAxis
            yAxisId="left"
            domain={[0, Math.ceil(maxVolume * 1.1)]}
            tickFormatter={(v) => `${v / 1000}k`}
            label={{
              value: "Volume",
              angle: -90,
              position: "insideLeft",
              dy: -10,
              fill: "#666",
            }}
          />

          {/* Y Axis - Price */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)]}
            tickFormatter={(v) => `₹${v}`}
            label={{
              value: "Price",
              angle: -90,
              position: "insideRight",
              dx: 20,
              fill: "#666",
            }}
          />

          <Tooltip />
          <Legend />

          {/* Volume Bars */}
          <Bar
            yAxisId="left"
            dataKey="volume"
            fill="#d0e3fa"
            name="Volume"
            barSize={10}
            barCategoryGap="10%"
            barGap={2}
          />

          {/* Stock Price Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="price"
            stroke="#3366cc"
            strokeWidth={2}
            dot={false}
            name="Price on NSE"
          />

          {/* 50 DMA Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dma50"
            stroke="#f9a825"
            strokeWidth={2}
            dot={false}
            name="50 DMA"
          />

          {/* 200 DMA Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dma200"
            stroke="#455a64"
            strokeWidth={2}
            dot={false}
            name="200 DMA"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
