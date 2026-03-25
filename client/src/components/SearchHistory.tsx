import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface SearchHistoryProps {
  onSelectHistory?: (query: string, searchType: "NSN" | "PART_NUMBER") => void;
}

export function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          검색 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-4">
          <p className="text-sm">
            데이터베이스 없이 크롤링 기반 검색만 제공됩니다.
          </p>
          <p className="text-xs mt-2">
            검색 기록은 저장되지 않습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
