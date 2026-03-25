import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { searchWithFallback, searchAllSources } from "./crawlers";
// DB 기능 제거 - 크롤링만 사용

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

          // 검색 기록 저장 기능 제거

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

          // 검색 기록 저장 기능 제거

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


});

export type AppRouter = typeof appRouter;
