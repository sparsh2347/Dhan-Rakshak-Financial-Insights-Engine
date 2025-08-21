"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownLong } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
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
  percent: string;
  pros: string[];
  cons: string[];
  companyId: string;
  Price: ChartPoint[];
  DMA50: ChartPoint[];
  DMA200: ChartPoint[];
  Volume: VolumePoint[];
};

export default function Stock({ StockDate }: { StockDate: any }) {
  const [expanded, setExpanded] = useState(false);
  const data = StockDate;
  // console.log(data);

  return (
    <div className="flex flex-col items-start gap-3 text-white p-6 rounded-lg w-[90vw] min-h-[400px] bg-[#C2DEDBE5] ">
      <div className="flex flex-row justify-around w-full gap-8">
        <div className="text-5xl font-bold text-[#547970] ">
          {data.companyName}
        </div>
        <div className="text-md flex items-center gap-1">
          <p className="font-black text-2xl">₹ {data.currPrice}</p>
          <FontAwesomeIcon
            icon={faArrowDownLong}
            style={{ color: "#ff4d4d" }}
          />
          <p className=" text-red-600">{data.percent}</p>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="text-black w-[90%]"> {data.about}</div>
      </div>
      <div className="text-xl flex flex-row  justify-between w-full">
        <div className="flex-[2] h-[100%] w-full text-left text-base grid grid-rows-3 grid-cols-3 gap-x-10 gap-y-6 rounded-lg py-10 px-14 text-black">
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Market Cap: ₹ {data.marketCap} Cr
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Current Price: ₹ {data.currPrice}
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            High / Low : ₹ {data.high}/{data.low}
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Stock P/E: {data.stockPE}
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Book Value: ₹ {data.bookValue}
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Dividend Yield: {data.dividendYield}%
          </p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">ROCE: {data.ROCE}%</p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">ROE: {data.ROE}%</p>
          <p className=" bg-[#BECCCA] rounded-lg p-4">
            Face Value: ₹ {data.faceValue}
          </p>
        </div>
      </div>
    </div>
  );
}
