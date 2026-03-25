import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { searchWithFallback, searchAllSources } from "./crawlers";
import { saveSearchHistory, getUserSearchHistory, clearUserSearchHistory } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * NSN 및 Part Number 검색
   */
  search: router({
    /**
     * 단일 사이트 폴백으로 검색 (첫 번째 성공 결과 반환)
     */
    byQuery: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1, "검색어를 입력하세요"),
          searchType: z.enum(["NSN", "PART_NUMBER"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await searchWithFallback(input.query);

          // 검색 기록 저장
          if (ctx.user?.id) {
            await saveSearchHistory({
              userId: ctx.user.id,
              searchType: input.searchType,
              searchQuery: input.query,
              results: result ? JSON.stringify([result]) : null,
              resultCount: result ? 1 : 0,
            });
          }

          return {
            success: true,
            data: result,
            message: result ? "검색 성공" : "검색 결과를 찾을 수 없습니다",
          };
        } catch (error) {
          console.error("[Search] Error:", error);
          return {
            success: false,
            data: null,
            message: "검색 중 오류가 발생했습니다",
          };
        }
      }),

    /**
     * 모든 사이트에서 검색 (모든 결과 반환)
     */
    allSources: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1, "검색어를 입력하세요"),
          searchType: z.enum(["NSN", "PART_NUMBER"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const results = await searchAllSources(input.query);

          // 검색 기록 저장
          if (ctx.user?.id) {
            await saveSearchHistory({
              userId: ctx.user.id,
              searchType: input.searchType,
              searchQuery: input.query,
              results: results.length > 0 ? JSON.stringify(results) : null,
              resultCount: results.length,
            });
          }

          return {
            success: true,
            data: results,
            message: results.length > 0 ? `${results.length}개의 결과를 찾았습니다` : "검색 결과를 찾을 수 없습니다",
          };
        } catch (error) {
          console.error("[Search] Error:", error);
          return {
            success: false,
            data: [],
            message: "검색 중 오류가 발생했습니다",
          };
        }
      }),
  }),

  /**
   * 검색 기록 관리
   */
  searchHistory: router({
    /**
     * 사용자의 최근 검색 기록 조회
     */
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user?.id) {
          return [];
        }

        const history = await getUserSearchHistory(ctx.user.id, input.limit);
        return history.map((item) => ({
          id: item.id,
          searchType: item.searchType,
          searchQuery: item.searchQuery,
          resultCount: item.resultCount,
          createdAt: item.createdAt,
        }));
      }),

    /**
     * 검색 기록 전체 삭제
     */
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user?.id) {
        return { success: false, message: "인증되지 않은 사용자입니다" };
      }

      await clearUserSearchHistory(ctx.user.id);
      return { success: true, message: "검색 기록이 삭제되었습니다" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
