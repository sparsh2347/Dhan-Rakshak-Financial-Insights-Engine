export async function scrapeChartData(companyId: string, days: number) {
  try {
    const response = await fetch(
      `https://www.screener.in/api/company/${companyId}/chart/?q=Price-DMA50-DMA200-Volume&days=${days}&consolidated=true`,
    );
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
      if (Object.prototype.hasOwnProperty.call(result, dataset.metric)) {
        result[dataset.metric] = dataset.values ?? [];
      }
    }

    return result;
  } catch (error: any) {
    console.error("Chart data fetch error:", error.message);
    throw error;
  }
}
