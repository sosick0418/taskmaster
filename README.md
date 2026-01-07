# TaskMaster

엔터프라이즈급 태스크 관리 시스템. 실시간성과 데이터 무결성을 중시하는 풀스택 애플리케이션입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)
![Test Coverage](https://img.shields.io/badge/Coverage-92%25-brightgreen?style=flat-square)

## 주요 기능

- **태스크 CRUD** - 생성, 조회, 수정, 삭제 with 낙관적 업데이트
- **서브태스크** - 계층적 태스크 관리
- **칸반 보드** - 드래그 앤 드롭으로 태스크 상태 변경
- **실시간 검색/필터** - 제목, 설명, 태그 기반 검색
- **우선순위 관리** - LOW, MEDIUM, HIGH, URGENT
- **다크 모드** - 시스템 설정 연동
- **애니메이션** - Framer Motion 기반 부드러운 전환 효과
- **반응형 디자인** - 모바일/데스크탑 최적화

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI, Framer Motion |
| **Backend** | Server Actions, Prisma ORM |
| **Database** | PostgreSQL |
| **Authentication** | Auth.js v5 (NextAuth) |
| **Testing** | Vitest, Playwright, Testing Library |

## 시작하기

### 사전 요구사항

- Node.js 20+
- Docker (PostgreSQL용)
- npm 또는 pnpm

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/taskmaster.git
cd taskmaster

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 필요한 값 입력

# PostgreSQL 컨테이너 실행
docker-compose up -d

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 시작
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

```bash
# 개발
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행

# 데이터베이스
npx prisma migrate dev --name <name>  # 마이그레이션 생성 및 적용
npx prisma generate                   # Prisma Client 재생성
npx prisma studio                     # DB GUI 실행

# 테스트
npm run test         # Vitest 단위 테스트 (watch 모드)
npm run test:run     # Vitest 단위 테스트 (단일 실행)
npm run test:e2e     # Playwright E2E 테스트
```

## 테스트 커버리지

전체 테스트 커버리지: **92.54%**

| 영역 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **All files** | 91.89% | 86.01% | 87.43% | 92.54% |
| actions | 96.59% | 87.14% | 100% | 96.53% |
| components/analytics | 100% | 89.18% | 100% | 100% |
| components/auth | 100% | 83.33% | 100% | 100% |
| components/layout | 86.53% | 94.44% | 74.07% | 88.88% |
| components/notifications | 88.88% | 70.96% | 84.21% | 88.23% |
| components/shared | 100% | 96.87% | 100% | 100% |
| components/tasks | 88.53% | 83.37% | 82.56% | 89.28% |
| components/ui | 98.82% | 95.74% | 98.43% | 98.80% |
| hooks | 91.83% | 100% | 80% | 91.83% |
| lib | 100% | 66.66% | 100% | 100% |
| lib/validations | 100% | 100% | 100% | 100% |

### 테스트 구조

```
__tests__/
├── actions/           # Server Actions 테스트
│   ├── tasks.test.ts
│   └── subtasks.test.ts
├── components/
│   ├── tasks/         # 태스크 컴포넌트 테스트
│   │   ├── task-board.test.tsx
│   │   ├── task-card.test.tsx
│   │   ├── task-filters.test.tsx
│   │   ├── task-form.test.tsx
│   │   ├── task-list-view.test.tsx
│   │   └── subtask-list.test.tsx
│   └── ui/            # UI 컴포넌트 테스트
tests/                 # Playwright E2E 테스트
├── auth/              # 인증 플로우
├── tasks/             # 태스크 CRUD
├── kanban/            # 칸반 보드
├── filters/           # 검색/필터
└── edge-cases/        # 엣지 케이스
```

## 프로젝트 구조

```
taskmaster/
├── app/
│   ├── (auth)/           # 인증 관련 라우트
│   ├── (dashboard)/      # 보호된 라우트
│   └── api/              # Route Handlers
├── actions/              # Server Actions
├── components/
│   ├── ui/               # Shadcn UI 컴포넌트
│   ├── tasks/            # 태스크 관련 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   └── shared/           # 공통 컴포넌트
├── hooks/                # 커스텀 React Hooks
├── lib/
│   ├── prisma.ts         # Prisma Client 싱글톤
│   ├── utils.ts          # 유틸리티 함수
│   └── validations/      # Zod 스키마
├── types/                # TypeScript 타입 정의
└── prisma/
    ├── schema.prisma     # 데이터베이스 스키마
    └── migrations/       # 마이그레이션 파일
```

## 환경 변수

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmaster"

# Auth.js
AUTH_SECRET="your-auth-secret"
AUTH_GITHUB_ID="github-oauth-client-id"
AUTH_GITHUB_SECRET="github-oauth-client-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 배포

### Docker

```bash
# 이미지 빌드
docker build -t taskmaster .

# 컨테이너 실행
docker run -p 3000:3000 taskmaster
```

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/taskmaster)

## 라이선스

MIT License
