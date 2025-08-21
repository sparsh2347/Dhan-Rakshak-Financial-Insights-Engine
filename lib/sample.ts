import puppeteer, { Browser, Page, HTTPRequest } from "puppeteer";

// Main combined function
export async function scrapeFullStockData(company_slug: string, days: number) {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    const requests: HTTPRequest[] = [];

    page.on("request", (req) => {
      if (req.url().includes("/api/company/")) {
        requests.push(req);
      }
    });

    const url = `https://www.screener.in/company/${company_slug}/consolidated/`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const getByXPath = async (xpath: string): Promise<string> => {
      const element = await page!.$(`xpath=${xpath}`);
      if (!element) return "";
      return page!.evaluate((el) => el.textContent?.trim() ?? "", element);
    };

    const getListByXPath = async (xpath: string): Promise<string[]> => {
      const elements = await page!.$$(`xpath=${xpath}`);
      if (!elements.length) return [];
      return Promise.all(
        elements.map((el) =>
          page!.evaluate((e) => e.textContent?.trim() ?? "", el),
        ),
      );
    };

    const data: Record<string, any> = {
      companyName: await getByXPath("/html/body/div/div[1]/h1"),
      about: await getByXPath('//*[@id="top"]/div[3]/div[1]/div[1]/div[2]/p'),
      marketCap: await getByXPath("//ul[@id='top-ratios']/li[1]//span[2]/span"),
      currPrice: await getByXPath("//ul[@id='top-ratios']/li[2]//span[2]/span"),
      high: await getByXPath("//ul[@id='top-ratios']/li[3]//span[2]/span[1]"),
      low: await getByXPath("//ul[@id='top-ratios']/li[3]//span[2]/span[2]"),
      stockPE: await getByXPath("//ul[@id='top-ratios']/li[4]//span[2]/span"),
      bookValue: await getByXPath("//ul[@id='top-ratios']/li[5]//span[2]/span"),
      dividendYield: await getByXPath(
        "//ul[@id='top-ratios']/li[6]//span[2]/span",
      ),
      ROCE: await getByXPath("//ul[@id='top-ratios']/li[7]//span[2]/span"),
      ROE: await getByXPath("//ul[@id='top-ratios']/li[8]//span[2]/span"),
      faceValue: await getByXPath("//ul[@id='top-ratios']/li[9]//span[2]/span"),
      pros: await getListByXPath('//*[@id="analysis"]/div/div[1]/ul/li'),
      cons: await getListByXPath("//*[@id='analysis']//div[2]//ul/li"),
    };

    // Extract company ID
    let companyId: string | null = null;
    for (const req of requests) {
      const match = req.url().match(/\/api\/company\/(\d+)\/chart/);
      if (match) {
        companyId = match[1];
        data["companyId"] = companyId;
        break;
      }
    }

    if (!companyId) {
      throw new Error("Company ID not found in network requests.");
    }

    // Fetch chart data and merge directly into data
    const chartData = await scrapeChartData(companyId, days);
    Object.assign(data, chartData); // Merge chartData into the main data object

    return data;
  } catch (err: any) {
    console.error("Error in full stock data scraper:", err.message);
    throw err;
  } finally {
    if (page) await page.close().catch(console.error);
    if (browser) await browser.close().catch(console.error);
  }
}

// Chart data fetcher
export async function scrapeChartData(companyId: string, days: number) {
  const url = `https://www.screener.in/api/company/${companyId}/chart/?q=Price-DMA50-DMA200-Volume&days=${days}&consolidated=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.statusText}`);
  }

  const raw = await response.json();
  const result: Record<string, any> = {
    Price: [],
    DMA50: [],
    DMA200: [],
    Volume: [],
  };

  for (const dataset of raw.datasets ?? []) {
    if (result.hasOwnProperty(dataset.metric)) {
      result[dataset.metric] = dataset.values ?? [];
    }
  }

  return result;
}
