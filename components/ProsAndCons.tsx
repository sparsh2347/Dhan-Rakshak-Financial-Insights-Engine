type ChartPoint = [string, string]; // e.g. ["2025-07-21", "1584.30"]
type VolumePoint = [string, number, { delivery: number }];

type StockData = {
  companyName: string;
  about: string;
  marketCap: string;
  currPrice: string;
  high: string;
  low: string;
  stockPE: string;
  bookValue: string;
  dividendYield: string;
  ROCE: string;
  ROE: string;
  faceValue: string;
  pros: string[];
  cons: string[];
  companyId: string;
  Price: ChartPoint[];
  DMA50: ChartPoint[];
  DMA200: ChartPoint[];
  Volume: VolumePoint[];
};

const ProsAndCons = ({ StockData }: { StockData: any }) => {
  return (
    <div className="w-full min-h-[200px] rounded-lg">
      <div className="flex flex-col gap-2">
        <div className="h-[80%] w-full rounded-md border bg-green-400/30 p-4">
          <h2 className="text-black font-semibold tracking-wide mb-2">PROS</h2>
          <ul className="list-disc pl-5 text-gray-900 space-y-1 text-[15px]">
            {StockData.pros.map((point: string, i: number) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="h-[80%] w-full rounded-md border bg-red-600/30 p-4">
          <h2 className="text-black font-semibold tracking-wide mb-2">CONS</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 text-[15px]">
            {StockData.cons.map((point: string, i: number) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default ProsAndCons;
