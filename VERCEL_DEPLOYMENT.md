# Vercel 배포 가이드

이 프로젝트는 Vercel을 사용하여 백엔드 없이 순수 프론트엔드 + API Routes로 배포할 수 있습니다.

## 프로젝트 구조

```
nsn_search/
├── api/                    # Vercel API Routes (크롤링 엔드포인트)
│   └── search.ts          # 검색 API 엔드포인트
├── client/                # React 프론트엔드
│   └── src/
│       ├── lib/api.ts     # API 클라이언트
│       └── pages/Home.tsx # 메인 검색 페이지
├── vercel.json            # Vercel 설정 파일
└── package.json           # 프로젝트 의존성
```

## 배포 단계

### 1단계: Vercel 가입

1. https://vercel.com 방문
2. "Sign Up" 클릭
3. GitHub 계정으로 로그인 (또는 이메일로 가입)

### 2단계: GitHub 리포지토리 연동

1. Vercel Dashboard에서 "New Project" 클릭
2. "Import Git Repository" 선택
3. GitHub에서 `aviationkjs/nsn_search` 선택
4. "Import" 클릭

### 3단계: 배포 설정

Vercel이 자동으로 다음을 감지합니다:
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **API Routes**: `api/` 폴더의 모든 TypeScript 파일

### 4단계: 배포 완료

1. "Deploy" 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포 URL 확인 (예: `https://nsn-search-xxxxx.vercel.app`)

## 기능

### 검색 API (`/api/search`)

**요청:**
```json
{
  "query": "5305-00-123-4567",
  "searchType": "NSN",
  "searchMode": "fallback"
}
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "nsn": "5305-00-123-4567",
      "itemName": "Bolt",
      "partNumber": "ABC123",
      "cage": "1A2B3",
      "description": "Steel bolt",
      "source": "ISO Group"
    }
  ],
  "message": "1개의 결과를 찾았습니다"
}
```

### 검색 모드

- **fallback**: 첫 번째 성공한 사이트의 결과만 반환 (빠름)
- **all**: 모든 사이트에서 검색하여 모든 결과 반환 (느림)

## 크롤링 사이트

1. **ISO Group NSN Lookup** - https://www.isogroup.com
2. **NSN Center** - https://www.nsncenter.com
3. **PartTarget** - https://www.parttarget.com

## 환경 변수

현재 환경 변수가 필요하지 않습니다. 모든 설정은 코드에 포함되어 있습니다.

## 문제 해결

### 배포 실패

1. GitHub 코드 확인
2. `pnpm install` 실행
3. `pnpm build` 실행 (로컬에서 테스트)
4. 오류 메시지 확인 후 수정

### API 오류

1. Vercel Logs 확인: Dashboard → Project → Deployments → Logs
2. 크롤링 사이트 접근 가능 여부 확인
3. API 요청 형식 확인

## 자동 배포

GitHub에 코드를 푸시하면 Vercel이 자동으로 배포합니다:

```bash
git add .
git commit -m "Update NSN search system"
git push origin main
```

## 커스터마이징

### 새로운 크롤링 사이트 추가

`api/search.ts`에 새로운 크롤러 함수 추가:

```typescript
async function crawlNewSite(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://example.com/search/${query}`;
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    
    // 데이터 추출 로직
    return { nsn, itemName, partNumber, cage, description, source: 'New Site' };
  } catch (error) {
    console.error('[Crawler] New Site error:', error);
    return null;
  }
}
```

### 프론트엔드 커스터마이징

`client/src/pages/Home.tsx`에서 UI 수정

## 성능 최적화

- API 타임아웃: 5초
- 최대 응답 시간: 30초
- 메모리: 1024MB

## 라이선스

MIT

## 지원

문제가 발생하면 GitHub Issues에 보고해주세요.
