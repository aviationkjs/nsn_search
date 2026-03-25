import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { NormalizedResult } from "../../../server/crawlers";

interface ResultCardProps {
  result: NormalizedResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `NSN: ${result.nsn}
Item Name: ${result.itemName}
Part Number: ${result.partNumber}
CAGE Code: ${result.cageCode}
Description: ${result.description}
Source: ${result.source}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{result.itemName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              NSN: <span className="font-mono">{result.nsn}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="ml-2"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              Part Number
            </label>
            <p className="text-sm font-mono">{result.partNumber}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              CAGE Code
            </label>
            <p className="text-sm font-mono">{result.cageCode}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Description
          </label>
          <p className="text-sm">{result.description}</p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Source: <span className="font-semibold">{result.source}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
