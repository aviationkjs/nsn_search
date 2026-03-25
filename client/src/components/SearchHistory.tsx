import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface SearchHistoryProps {
  onSelectHistory?: (query: string, searchType: "NSN" | "PART_NUMBER") => void;
}

export function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  const { data: history, isLoading, refetch } = trpc.searchHistory.getRecent.useQuery({
    limit: 10,
  });
  const clearMutation = trpc.searchHistory.clear.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">로딩 중...</div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        검색 기록이 없습니다
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          최근 검색
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          전체 삭제
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory?.(item.searchQuery, item.searchType)}
              className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.searchQuery}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.searchType} • {item.resultCount}개 결과
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
