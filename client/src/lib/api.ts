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

export async function search(request: SearchRequest): Promise<SearchResponse> {
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search API error:", error);
    return {
      success: false,
      data: [],
      message: "검색 중 오류가 발생했습니다",
    };
  }
}
