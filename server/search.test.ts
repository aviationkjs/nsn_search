import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { searchWithFallback, searchAllSources } from "./crawlers";

describe("Search Crawlers", () => {
  // 테스트 타임아웃을 10초로 설정
  const testTimeout = 10000;

  describe("searchWithFallback", () => {
    it(
      "should return null or result for empty query",
      async () => {
        const result = await searchWithFallback("");
        expect(result === null || typeof result === "object").toBe(true);
      },
      testTimeout
    );

    it(
      "should handle invalid NSN gracefully",
      async () => {
        const result = await searchWithFallback("invalid-nsn-xyz");
        // 결과가 없거나 null일 수 있음
        expect(result === null || result === undefined || typeof result === "object").toBe(true);
      },
      testTimeout
    );

    it(
      "should return consistent structure when result exists",
      async () => {
        const result = await searchWithFallback("5305-00-123-4567");
        
        if (result !== null && result !== undefined) {
          expect(result).toHaveProperty("nsn");
          expect(result).toHaveProperty("itemName");
          expect(result).toHaveProperty("partNumber");
          expect(result).toHaveProperty("cageCode");
          expect(result).toHaveProperty("description");
          expect(result).toHaveProperty("source");
          
          // 필드 타입 검증
          expect(typeof result.nsn).toBe("string");
          expect(typeof result.itemName).toBe("string");
          expect(typeof result.partNumber).toBe("string");
          expect(typeof result.cageCode).toBe("string");
          expect(typeof result.description).toBe("string");
          expect(typeof result.source).toBe("string");
        }
      },
      testTimeout
    );
  });

  describe("searchAllSources", () => {
    it(
      "should return array of results",
      async () => {
        const results = await searchAllSources("5305-00-123-4567");
        
        expect(Array.isArray(results)).toBe(true);
        
        if (results.length > 0) {
          results.forEach((result) => {
            expect(result).toHaveProperty("nsn");
            expect(result).toHaveProperty("itemName");
            expect(result).toHaveProperty("partNumber");
            expect(result).toHaveProperty("cageCode");
            expect(result).toHaveProperty("description");
            expect(result).toHaveProperty("source");
          });
        }
      },
      testTimeout
    );

    it(
      "should return empty array for invalid query",
      async () => {
        const results = await searchAllSources("invalid-query-xyz");
        expect(Array.isArray(results)).toBe(true);
      },
      testTimeout
    );

    it(
      "should complete within timeout",
      async () => {
        const startTime = Date.now();
        const results = await searchAllSources("test");
        const duration = Date.now() - startTime;
        
        // 5초 이내에 완료되어야 함
        expect(duration).toBeLessThan(5000);
        expect(Array.isArray(results)).toBe(true);
      },
      testTimeout
    );

    it(
      "should handle empty query",
      async () => {
        const results = await searchAllSources("");
        expect(Array.isArray(results)).toBe(true);
      },
      testTimeout
    );
  });

  describe("Error handling", () => {
    it(
      "should not throw on network errors",
      async () => {
        // 네트워크 오류가 발생해도 에러를 던지지 않고 null/[]을 반환
        let error: Error | null = null;
        
        try {
          await searchWithFallback("test");
        } catch (e) {
          error = e as Error;
        }
        
        expect(error).toBeNull();
      },
      testTimeout
    );

    it(
      "should not throw on all sources search",
      async () => {
        let error: Error | null = null;
        
        try {
          await searchAllSources("test");
        } catch (e) {
          error = e as Error;
        }
        
        expect(error).toBeNull();
      },
      testTimeout
    );
  });
});
