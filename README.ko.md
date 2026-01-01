# svelte-fast-check

`svelte-check`보다 최대 24배 빠른 타입 체커입니다. svelte2tsx + tsgo 기반으로 동작합니다.

[English](./README.md)

## 모티베이션

프로젝트가 커지면서 `svelte-check`가 느려졌습니다. incremental 빌드와 typescript-go 지원이 필요했는데, `svelte-check`가 고려해야 할 것들(Language Server 호환성 등)이 많아 공식 지원까지는 시간이 걸릴 것 같아 직접 만들었습니다.

참고:

- [incremental 빌드 지원 요청](https://github.com/sveltejs/language-tools/issues/2131) (2023~)
- [typescript-go 지원 요청](https://github.com/sveltejs/language-tools/issues/2733) (Blocked)

## 벤치마크

Watnee의 melting 프로젝트 기준, M4 Pro에서 측정했습니다.

**프로젝트 규모:**

- Svelte: 282개 파일 (63k lines)
- TypeScript: 741개 파일 (119k lines)

| 항목                                     | 시간  | 비교          |
| ---------------------------------------- | ----- | ------------- |
| `svelte-check`                           | 14.4s | baseline      |
| `svelte-fast-check`                      | 2.6s  | **5.5x 빠름** |
| `svelte-fast-check --incremental` (cold) | 6.0s  | 2.4x 빠름     |
| `svelte-fast-check --incremental` (warm) | 0.6s  | **24x 빠름**  |

> warm 상태에서는 0.6초만에 타입 체크가 완료되어, 저장할 때마다 실행해도 부담이 없습니다.

## 설치

```bash
npm install -D svelte-fast-check
# or
bun add -D svelte-fast-check
```

## 사용법

```bash
# 기본 실행
npx svelte-fast-check

# Incremental 모드 (권장)
npx svelte-fast-check --incremental

# bun으로 실행하면 더 빠릅니다
bun svelte-fast-check --incremental
```

### CLI 옵션

| 옵션              | 단축 | 설명                                                       |
| ----------------- | ---- | ---------------------------------------------------------- |
| `--incremental`   | `-i` | 변경된 파일만 변환하고, tsgo incremental 빌드를 사용합니다 |
| `--raw`           | `-r` | 필터링/매핑 없이 원시 출력을 표시합니다                    |
| `--config <path>` | `-c` | 설정 파일 경로를 지정합니다                                |

## 설정

대부분의 경우 설정 없이 동작합니다. `tsconfig.json`에서 `paths`와 `exclude`를 자동으로 읽어옵니다.

커스텀 설정이 필요한 경우 `svelte-fast-check.config.ts` 파일을 생성하세요:

```typescript
import type { FastCheckConfig } from 'svelte-fast-check';

export default {
  srcDir: './src',
  exclude: ['../src/**/*.test.ts'],
} satisfies FastCheckConfig;
```

## 동작 원리

```
.svelte 파일들
     ↓
[svelte2tsx] 병렬 변환
     ↓
.svelte.tsx 파일들 (.fast-check/tsx/)
     ↓
[tsgo] 타입 체크
     ↓
에러 목록
     ↓
[필터링] svelte2tsx 생성 코드의 false positive 제거
     ↓
[매핑] sourcemap으로 원본 .svelte 위치로 변환
     ↓
최종 결과 출력
```

### 캐시 구조

```
.fast-check/
├── tsx/           # 변환된 .svelte.tsx 파일
├── maps/          # sourcemap 파일
├── tsconfig.json  # 생성된 tsconfig
└── .tsbuildinfo   # tsgo incremental 빌드 정보
```

## 목적이 아닌 것

`svelte-fast-check`는 타입 체크만 빠르게 하는 것이 목표입니다. 다음 기능은 지원하지 않습니다:

- **Svelte 컴파일러 경고** - `state_referenced_locally`, `css-unused-selector` 등 Svelte 전용 진단
- **CSS 진단** - 스타일 관련 검사
- **Language Server** - IDE 자동완성, hover 정보, go to definition 등
- **Watch 모드** - 파일 변경 감지 및 자동 재실행

이런 기능이 필요하다면 `svelte-check`나 `svelte-language-server`를 사용하세요.

## 제한사항

- **tsgo는 아직 preview 단계입니다** - TypeScript 팀에서 개발 중인 실험적 기능입니다. 프로덕션 CI에서는 주의해서 사용하세요.
- **일부 false positive가 있을 수 있습니다** - svelte2tsx 변환 과정에서 발생하는 오탐지를 필터링하지만, 완벽하지 않을 수 있습니다.

## svelte-check와 함께 사용하기

개발 중에는 `svelte-fast-check`로 빠른 피드백을 받고, CI에서는 `svelte-check`로 정확한 검증을 하는 것을 권장합니다:

```json
{
  "scripts": {
    "check": "svelte-fast-check --incremental",
    "check:ci": "svelte-check"
  }
}
```

## 크레딧

[svelte-language-tools](https://github.com/sveltejs/language-tools)의 [svelte2tsx](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)와 [svelte-check](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check)를 기반으로 합니다.

## 라이선스

MIT License

Copyright (c) 2025 Song Jaehak (astralhpi)

---

Built at [melting.chat](https://melting.chat)
