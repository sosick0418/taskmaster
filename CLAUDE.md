# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

엔터프라이즈급 Task Manager 시스템. 데이터 CRUD가 빈번하고 실시간성과 데이터 무결성이 중요한 애플리케이션.
핵심 가치: 유지보수성, 확장성, 타입 안전성(End-to-End Type Safety), 개발자 경험(DX) 극대화.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
docker-compose up -d                  # Start PostgreSQL container
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma generate                   # Regenerate Prisma Client
npx prisma studio                     # Open Prisma database GUI

# Testing (설치 후)
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

## Architecture

**Tech Stack (The Modern Stack / T3 Stack 변형)**:
- Next.js 16 (App Router) - RSC 기본, Server Actions로 API 대체
- TypeScript - DB 스키마 ~ 클라이언트까지 End-to-End Type Safety
- PostgreSQL - ACID 트랜잭션 보장
- Prisma ORM - 타입 안전한 쿼리, SQL Injection 방지
- Tailwind CSS

**Directory Structure (Feature-Sliced Design)**:
```
app/
├── (auth)/           # 인증 관련 라우트 그룹 (URL 경로 제외)
├── (dashboard)/      # 보호된 라우트, 공유 레이아웃
└── api/              # Route Handlers (필요시만, Server Actions 우선)
actions/              # Server Actions (도메인별: task.ts, user.ts)
components/
├── ui/               # Atomic 컴포넌트 (Shadcn UI 등)
└── tasks/            # 도메인 특화 컴포넌트
hooks/                # 커스텀 React Hooks
lib/
├── prisma.ts         # Prisma Client 싱글톤
└── utils.ts          # 공통 유틸리티 (cn() 등)
types/                # 전역 타입 정의, Zod 스키마 추론 타입
prisma/               # schema.prisma, migrations
```

## Data Models

- `User` → `Task[]` (1:N, Cascade Delete)
- `Task` ↔ `Tag[]` (N:M)
- `Priority` enum: LOW, MEDIUM, HIGH, URGENT
- ID는 UUID 사용 (URL 유추 공격 방지)
- `@@index([userId, createdAt])` 복합 인덱스로 조회 최적화

## Key Patterns

### API Strategy
| 작업 | 기술 | 위치 |
|------|------|------|
| 데이터 조회 (Read) | RSC | Page/Layout 컴포넌트 내 직접 DB 접근 |
| 데이터 변경 (CUD) | Server Actions | `actions/` 디렉토리 |

### Server Actions 규칙
1. `'use server'` 지시어 필수
2. **인증 검증**: 함수 내부에서 `auth()` 호출 (클라이언트 전달 ID 신뢰 금지)
3. **유효성 검사**: Zod로 런타임 검증
4. **캐시 갱신**: 변경 후 `revalidatePath()` 호출

### Prisma Singleton
Hot Reload로 인한 "Too many connections" 방지를 위해 `lib/prisma.ts`에서 싱글톤 패턴 사용.

## TypeScript 설정

`tsconfig.json`에 엄격한 타입 검사 옵션 적용:
- `noUncheckedIndexedAccess: true` - 배열/객체 접근 시 undefined 가능성 체크
- `exactOptionalPropertyTypes: true` - 선택적 속성 타입 엄격 관리

## UI 컴포넌트 전략

**Shadcn UI + Tailwind CSS** 방식 채택:
- Radix UI (Headless) 기반으로 WAI-ARIA 접근성 표준 준수
- 컴포넌트 코드를 프로젝트로 복사하여 완전한 제어권 확보
- `lib/utils.ts`의 `cn()` 함수로 조건부 클래스 병합

## 낙관적 업데이트 (Optimistic Updates)

서버 응답 전 UI 즉시 갱신으로 네이티브 앱 수준의 UX 제공:
```tsx
const [optimisticState, addOptimistic] = useOptimistic(initialState, updateFn)
// 1. addOptimistic()으로 UI 즉시 업데이트
// 2. Server Action 호출 (백그라운드)
// 3. 에러 시 자동 롤백 (리렌더링 시 서버 상태로 동기화)
```

## Prisma 트랜잭션

여러 DB 작업의 원자적(Atomic) 처리가 필요할 때:
```typescript
await prisma.$transaction(async (tx) => {
  const task = await tx.task.create({ data: {...} })
  await tx.auditLog.create({ data: { action: 'CREATE', taskId: task.id } })
})
// 오류 발생 시 모든 변경사항 자동 롤백
```

## 마이그레이션 워크플로우

| 환경 | 명령어 | 용도 |
|------|--------|------|
| 개발 | `npx prisma migrate dev --name <desc>` | 마이그레이션 파일 생성 + 적용 + Client 재생성 |
| 프로토타이핑 | `npx prisma db push` | 히스토리 없이 빠른 스키마 반영 (팀 협업 시 비권장) |
| 프로덕션 | `npx prisma migrate deploy` | 미적용 마이그레이션만 적용 (CI/CD) |

## Authentication

Auth.js v5 (구 NextAuth.js) + Prisma Adapter 사용.
- JWT 전략 (Edge 호환성)
- Middleware를 통한 라우트 보호 (`middleware.ts`)
- `auth.ts`에서 중앙 집중식 설정

## Testing Strategy

- **Unit Test**: Vitest + @testing-library/react (유틸리티, 훅, 비즈니스 로직)
- **E2E Test**: Playwright (인증 플로우, CRUD 플로우, DB 무결성 검증)
- CI: GitHub Actions에서 Lint → Type Check → Unit Test → E2E Test

## Docker 배포

**Multi-stage Build**로 이미지 최적화:
1. `next.config.ts`에 `output: 'standalone'` 설정
2. 실행에 필요한 최소 파일만 포함 (이미지 크기 대폭 감소)

```dockerfile
# Builder stage
RUN npx prisma generate && npm run build

# Runner stage (최종 이미지)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

## Git Conventions

커밋 메시지는 Conventional Commits 규격을 따릅니다.
참고: https://www.conventionalcommits.org/ko/v1.0.0/

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**: feat, fix, docs, style, refactor, test, chore
