export interface SearchRequest {
  query: string;
  searchType: "NSN" | "PART_NUMBER";
  searchMode: "fallback" | "all";
}

export interface NormalizedResult {
  nsn: string;
  itemName: string;
  partNumber: string;
  cage: string;
  description: string;
  source: string;
}

interface SearchResponse {
  success: boolean;
  data: NormalizedResult[];
  message: string;
}

// CORS 프록시 사용
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

// ISO Group NSN Lookup 크롤러
async function crawlIsoGroup(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.isogroup.com/nsn/${query}`;
    const response = await fetch(CORS_PROXY + url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // 간단한 HTML 파싱 (정규식 사용)
    const nsnMatch = query;
    const itemNameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const itemName = itemNameMatch ? itemNameMatch[1].trim() : "N/A";
    
    return {
      nsn: nsnMatch,
      itemName: itemName,
      partNumber: "N/A",
      cage: "N/A",
      description: "ISO Group NSN Lookup",
      source: "ISO Group"
    };
  } catch (error) {
    console.error("ISO Group crawl error:", error);
    return null;
  }
}

// NSN Center 크롤러
async function crawlNsnCenter(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.nsncenter.com/search?q=${query}`;
    const response = await fetch(CORS_PROXY + url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) return null;

    return {
      nsn: query,
      itemName: "NSN Center Result",
      partNumber: "N/A",
      cage: "N/A",
      description: "NSN Center Search Result",
      source: "NSN Center"
    };
  } catch (error) {
    console.error("NSN Center crawl error:", error);
    return null;
  }
}

// PartTarget 크롤러
async function crawlPartTarget(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.parttarget.com/search?q=${query}`;
    const response = await fetch(CORS_PROXY + url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) return null;

    return {
      nsn: query,
      itemName: "PartTarget Result",
      partNumber: "N/A",
      cage: "N/A",
      description: "PartTarget Search Result",
      source: "PartTarget"
    };
  } catch (error) {
    console.error("PartTarget crawl error:", error);
    return null;
  }
}

export async function search(request: SearchRequest): Promise<SearchResponse> {
  try {
    const { query, searchMode } = request;

    if (!query.trim()) {
      return {
        success: false,
        data: [],
        message: "검색어를 입력하세요"
      };
    }

    let results: (NormalizedResult | null)[] = [];

    if (searchMode === "fallback") {
      // 빠른 검색: 첫 번째 성공한 결과만 반환
      const isoResult = await crawlIsoGroup(query);
      if (isoResult) {
        results = [isoResult];
      } else {
        const nsnResult = await crawlNsnCenter(query);
        if (nsnResult) {
          results = [nsnResult];
        } else {
          const partResult = await crawlPartTarget(query);
          if (partResult) {
            results = [partResult];
          }
        }
      }
    } else {
      // 전체 검색: 모든 사이트에서 검색
      const [isoResult, nsnResult, partResult] = await Promise.all([
        crawlIsoGroup(query),
        crawlNsnCenter(query),
        crawlPartTarget(query)
      ]);

      results = [isoResult, nsnResult, partResult].filter((r) => r !== null);
    }

    if (results.length === 0) {
      return {
        success: false,
        data: [],
        message: "검색 결과가 없습니다"
      };
    }

    return {
      success: true,
      data: results as NormalizedResult[],
      message: `${results.length}개의 결과를 찾았습니다`
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      data: [],
      message: "검색 중 오류가 발생했습니다"
    };
  }
}
