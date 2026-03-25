import axios, { AxiosError } from "axios";

/**
 * 정규화된 검색 결과 타입
 */
export interface NormalizedResult {
  nsn: string;
  itemName: string;
  partNumber: string;
  cageCode: string;
  description: string;
  source: string;
}

/**
 * 크롤러 기본 설정
 */
const CRAWL_TIMEOUT = 5000; // 5초
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

const axiosInstance = axios.create({
  timeout: CRAWL_TIMEOUT,
  headers: {
    "User-Agent": USER_AGENT,
  },
});

/**
 * ISO Group NSN Lookup 크롤러
 */
async function crawlISOGroup(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.isogroup.com/nsn/${encodeURIComponent(query)}`;
    const response = await axiosInstance.get(url);
    const html = response.data;

    // 간단한 정규식 기반 파싱 (실제 사이트 구조에 맞게 조정 필요)
    const nsnMatch = html.match(/NSN:\s*([0-9\-]+)/i);
    const itemMatch = html.match(/Item Name:\s*([^<]+)/i);
    const partMatch = html.match(/Part Number:\s*([^<]+)/i);
    const cageMatch = html.match(/CAGE:\s*([^<]+)/i);
    const descMatch = html.match(/Description:\s*([^<]+)/i);

    if (nsnMatch) {
      return {
        nsn: nsnMatch[1]?.trim() || query,
        itemName: itemMatch ? itemMatch[1].trim() : "N/A",
        partNumber: partMatch ? partMatch[1].trim() : "N/A",
        cageCode: cageMatch ? cageMatch[1].trim() : "N/A",
        description: descMatch ? descMatch[1].trim() : "N/A",
        source: "ISO Group",
      };
    }
  } catch (error) {
    console.warn("[Crawler] ISO Group error:", error instanceof AxiosError ? error.message : error);
  }
  return null;
}

/**
 * NSN Center 크롤러
 */
async function crawlNSNCenter(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.nsncenter.com/search?q=${encodeURIComponent(query)}`;
    const response = await axiosInstance.get(url);
    const html = response.data;

    // 간단한 정규식 기반 파싱
    const nsnMatch = html.match(/NSN:\s*([0-9\-]+)/i);
    const itemMatch = html.match(/Item:\s*([^<]+)/i);
    const partMatch = html.match(/Part:\s*([^<]+)/i);
    const cageMatch = html.match(/CAGE:\s*([^<]+)/i);
    const descMatch = html.match(/Description:\s*([^<]+)/i);

    if (nsnMatch) {
      return {
        nsn: nsnMatch[1]?.trim() || query,
        itemName: itemMatch ? itemMatch[1].trim() : "N/A",
        partNumber: partMatch ? partMatch[1].trim() : "N/A",
        cageCode: cageMatch ? cageMatch[1].trim() : "N/A",
        description: descMatch ? descMatch[1].trim() : "N/A",
        source: "NSN Center",
      };
    }
  } catch (error) {
    console.warn("[Crawler] NSN Center error:", error instanceof AxiosError ? error.message : error);
  }
  return null;
}

/**
 * PartTarget 크롤러
 */
async function crawlPartTarget(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.parttarget.com/search?q=${encodeURIComponent(query)}`;
    const response = await axiosInstance.get(url);
    const html = response.data;

    // 간단한 정규식 기반 파싱
    const nsnMatch = html.match(/NSN:\s*([0-9\-]+)/i);
    const itemMatch = html.match(/Name:\s*([^<]+)/i);
    const partMatch = html.match(/Part Number:\s*([^<]+)/i);
    const cageMatch = html.match(/CAGE:\s*([^<]+)/i);
    const descMatch = html.match(/Description:\s*([^<]+)/i);

    if (nsnMatch) {
      return {
        nsn: nsnMatch[1]?.trim() || query,
        itemName: itemMatch ? itemMatch[1].trim() : "N/A",
        partNumber: partMatch ? partMatch[1].trim() : "N/A",
        cageCode: cageMatch ? cageMatch[1].trim() : "N/A",
        description: descMatch ? descMatch[1].trim() : "N/A",
        source: "PartTarget",
      };
    }
  } catch (error) {
    console.warn("[Crawler] PartTarget error:", error instanceof AxiosError ? error.message : error);
  }
  return null;
}

/**
 * 다중 사이트 폴백 검색 엔진
 * 첫 번째 성공한 결과를 반환하고, 모두 실패하면 null 반환
 */
export async function searchWithFallback(query: string): Promise<NormalizedResult | null> {
  const crawlers = [crawlISOGroup, crawlNSNCenter, crawlPartTarget];

  for (const crawler of crawlers) {
    try {
      const result = await crawler(query);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn("[SearchEngine] Crawler failed, trying next:", error);
    }
  }

  // 모든 크롤러 실패
  console.error("[SearchEngine] All crawlers failed for query:", query);
  return null;
}

/**
 * 여러 결과를 동시에 검색 (모든 사이트에서 데이터 수집)
 */
export async function searchAllSources(query: string): Promise<NormalizedResult[]> {
  const crawlers = [crawlISOGroup, crawlNSNCenter, crawlPartTarget];
  const results = await Promise.allSettled(
    crawlers.map((crawler) => crawler(query))
  );

  return results
    .filter((result) => result.status === "fulfilled" && result.value !== null)
    .map((result) => (result as PromiseFulfilledResult<NormalizedResult>).value);
}
