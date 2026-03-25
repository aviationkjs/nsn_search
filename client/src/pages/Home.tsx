import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import { search } from "@/lib/api";
import type { NormalizedResult } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"NSN" | "PART_NUMBER">("NSN");
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [searchMode, setSearchMode] = useState<"fallback" | "all">("fallback");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      alert("검색어를 입력하세요");
      return;
    }

    setIsLoading(true);
    try {
      const response = await search({
        query: searchQuery,
        searchType,
        searchMode,
      });

      if (response.success) {
        setResults(response.data);
      } else {
        alert(response.message);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("검색 중 오류가 발생했습니다");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">NSN Search System</h1>
          <p className="text-slate-600 mt-2">
            NSN 또는 Part Number를 입력하여 부품 정보를 검색하세요
          </p>
        </div>

        {/* 검색 영역 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 검색 타입 선택 */}
            <div className="flex gap-2">
              <Button
                variant={searchType === "NSN" ? "default" : "outline"}
                onClick={() => setSearchType("NSN")}
              >
                NSN
              </Button>
              <Button
                variant={searchType === "PART_NUMBER" ? "default" : "outline"}
                onClick={() => setSearchType("PART_NUMBER")}
              >
                Part Number
              </Button>
            </div>

            {/* 검색 모드 선택 */}
            <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "fallback" | "all")}>
              <TabsList>
                <TabsTrigger value="fallback">빠른 검색 (첫 결과)</TabsTrigger>
                <TabsTrigger value="all">전체 검색 (모든 사이트)</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 검색 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder={`${searchType === "NSN" ? "NSN (예: 5305-00-123-4567)" : "Part Number (예: ABC123)"}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={() => handleSearch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 검색 결과 */}
        <div>
          {results.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                검색 결과 ({results.length}개)
              </h2>
              {results.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </div>
          ) : query ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {isLoading ? "검색 중..." : "검색 결과가 없습니다"}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                검색어를 입력하여 시작하세요
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
