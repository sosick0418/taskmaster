# Tidying 기법 가이드
> based on Kent Beck, *Tidy First?*

## 1. Tidying이란 무엇인가

**Tidying은 리팩터링이 아니다.**

Tidying은 새로운 기능을 추가하거나 설계를 바꾸기 전에,  
**코드를 읽기 쉽게 정돈하는 아주 작고 완벽하게 안전한 변경**이다.

- 동작 변경 ❌
- 설계 변경 ❌
- 가독성·구조 개선 ⭕
- 테스트 없이도 안전 ⭕
- diff만 봐도 의도가 보임 ⭕


## 2. Kent Beck의 핵심 철학

### Behavior Before Structure
> 실행 결과는 절대 바꾸지 말고, 구조만 정리한다.

- 결과가 1비트라도 바뀔 가능성이 있으면 Tidying이 아니다
- 테스트가 없어도 안전해야 한다


### Small, Reversible Changes
> 언제든 되돌릴 수 있는 변경만 한다.

- 한 커밋 = 하나의 Tidying
- 리뷰어가 즉시 “안전하다”라고 판단 가능해야 한다


### Make the Next Change Obvious
> Tidying은 다음 변경을 쉽게 만들기 위한 준비 작업이다.

- Tidying 자체가 목적이 아님
- 이후 기능 추가나 리팩터링을 더 쉽게 만든다


## 3. 팀 공통 Tidying 판단 기준

다음 질문에 모두 **YES**라면 Tidying이다.

- 이 커밋이 로직을 바꿀 가능성이 0%인가?
- diff를 30초 안에 이해할 수 있는가?
- 코드의 의도가 이전보다 더 잘 보이는가?
- 하나의 커밋으로 독립적인가?


## 4. 대표 Tidying 기법

> ⚠️ 모든 기법은 **동작 불변**을 전제로 한다.

### Guard Clauses
- 중첩된 `if`를 조기 반환으로 평탄화
- 흐름을 위에서 아래로 단순하게 만듦

### Dead Code / Comments Removal
- 사용되지 않는 코드 삭제
- 코드 그대로 읽으면 알 수 있는 주석 제거

### Explaining Variables
- 복잡한 조건이나 표현식을 의미 있는 변수로 추출
- “무슨 조건인가?”를 이름으로 설명

### Normalize Symmetries
- 유사한 로직을 유사한 형태로 맞춤
- 읽는 사람이 패턴을 인식하기 쉽게 함

### Reading Order
- 읽히는 순서대로 함수, 상수, 헬퍼 배치
- 상위 개념 → 하위 세부 구현 순서 유지

### Extract Helper (No Logic Change)
- 명확한 목적의 코드 블록을 작은 함수로 분리
- 이름 자체가 설명이 되도록 작성

### Explaining Comments
- **왜 이렇게 했는지**를 설명하는 주석만 추가
- *무엇을 하는지는 코드로 표현*


## 5. 팀의 Tidying 커밋 규칙

- 하루에 하나의 Tidying 커밋
- 반드시 기능 커밋과 분리
- “겸사겸사” 변경 금지
- PR 제목만 봐도 Tidying임이 드러나야 함

예)
- `tidy: flatten conditional with guard clauses`
- `tidy: remove unused helper and comments`


## 6. 한 줄 요약

> **Tidying은 코드를 더 똑똑하게 만드는 일이 아니라,  
> 더 읽기 쉽게 만드는 일이다.**
