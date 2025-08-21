import StockCard from "../../../components/StockCard";
import StockChart from "@/components/stockChart";
import ProsAndCons from "@/components/ProsAndCons";
import Chat from "@/components/Chat";
import { scrapeFullStockData } from "@/lib/stocks_scraper";

type PageProps = {
  params: {
    company: string;
  };
};

const StockPage = async ({ params }: PageProps) => {
  const { company } = params;

  const company_slug = company; // or dynamically from searchParams/params
  const days = 10000;

  const data = await scrapeFullStockData(company_slug, days);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full px-4 space-y-4 "
      
    >
      <StockCard StockDate={data} />
      <div className="flex flex-row gap-x-4 w-[90vw]">
        <div className="flex flex-col gap-y-2 w-1/2">
          <StockChart rawChartData={data} />
          <ProsAndCons StockData={data} />
        </div>
        <div className="w-1/2">
          <Chat stockData={data} />
        </div>
      </div>

      {/* <PeerTable /> */}
    </div>
  );
};

export default StockPage;
