/**
 * Unit tests for exclude path filtering logic
 */

import { describe, expect, test } from "bun:test";
import { filterExcludedPaths } from "../../src/typecheck/worker";
import type { MappedDiagnostic } from "../../src/types";

/** Helper to create a mapped diagnostic */
function makeMappedDiag(
  originalFile: string,
  overrides?: Partial<MappedDiagnostic>,
): MappedDiagnostic {
  return {
    file: originalFile,
    line: 1,
    column: 1,
    code: 2322,
    message: "Type error",
    severity: "error",
    originalFile,
    originalLine: 1,
    originalColumn: 1,
    ...overrides,
  };
}

describe("filterExcludedPaths", () => {
  test("should return all diagnostics when exclude patterns are empty", () => {
    const diagnostics = [
      makeMappedDiag("src/lib/utils.ts"),
      makeMappedDiag("src/routes/+page.svelte"),
    ];

    const result = filterExcludedPaths(diagnostics, []);

    expect(result).toHaveLength(2);
  });

  test("should filter diagnostics matching a single glob pattern", () => {
    const diagnostics = [
      makeMappedDiag("src/lib/paraglide/messages.js"),
      makeMappedDiag("src/lib/paraglide/runtime.js"),
      makeMappedDiag("src/lib/utils.ts"),
    ];

    const result = filterExcludedPaths(diagnostics, ["src/lib/paraglide/**"]);

    expect(result).toHaveLength(1);
    expect(result[0].originalFile).toBe("src/lib/utils.ts");
  });

  test("should keep diagnostics that do not match any pattern", () => {
    const diagnostics = [
      makeMappedDiag("src/lib/components/App.svelte"),
      makeMappedDiag("src/routes/+page.svelte"),
    ];

    const result = filterExcludedPaths(diagnostics, ["src/lib/paraglide/**"]);

    expect(result).toHaveLength(2);
  });

  test("should filter diagnostics matching any of multiple patterns", () => {
    const diagnostics = [
      makeMappedDiag("src/generated/graphql.ts"),
      makeMappedDiag("src/lib/paraglide/messages.js"),
      makeMappedDiag("src/lib/components/App.svelte"),
      makeMappedDiag("src/routes/+page.svelte"),
    ];

    const result = filterExcludedPaths(diagnostics, [
      "src/generated/**",
      "src/lib/paraglide/**",
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].originalFile).toBe("src/lib/components/App.svelte");
    expect(result[1].originalFile).toBe("src/routes/+page.svelte");
  });

  test("should filter diagnostics matching an exact file path pattern", () => {
    const diagnostics = [
      makeMappedDiag("src/auto.d.ts"),
      makeMappedDiag("src/lib/utils.ts"),
    ];

    const result = filterExcludedPaths(diagnostics, ["src/auto.d.ts"]);

    expect(result).toHaveLength(1);
    expect(result[0].originalFile).toBe("src/lib/utils.ts");
  });

  test("should filter .svelte files matching exclude pattern", () => {
    const diagnostics = [
      makeMappedDiag("src/generated/Component.svelte"),
      makeMappedDiag("src/generated/Other.svelte"),
      makeMappedDiag("src/lib/Real.svelte"),
    ];

    const result = filterExcludedPaths(diagnostics, [
      "src/generated/**/*.svelte",
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].originalFile).toBe("src/lib/Real.svelte");
  });

  test("should handle empty diagnostics array", () => {
    const result = filterExcludedPaths([], ["src/lib/paraglide/**"]);

    expect(result).toHaveLength(0);
  });

  test("should filter deeply nested files with ** glob", () => {
    const diagnostics = [
      makeMappedDiag("src/lib/paraglide/messages/en.js"),
      makeMappedDiag("src/lib/paraglide/messages/ko/nested.js"),
      makeMappedDiag("src/lib/utils.ts"),
    ];

    const result = filterExcludedPaths(diagnostics, ["src/lib/paraglide/**"]);

    expect(result).toHaveLength(1);
    expect(result[0].originalFile).toBe("src/lib/utils.ts");
  });

  test("should not filter when pattern does not match path structure", () => {
    const diagnostics = [makeMappedDiag("src/lib/paraglide/messages.js")];

    const result = filterExcludedPaths(diagnostics, ["lib/paraglide/**"]);

    expect(result).toHaveLength(1);
  });

  test("should filter .js files (common use case for checkJs)", () => {
    const diagnostics = [
      makeMappedDiag("src/lib/paraglide/messages.js"),
      makeMappedDiag("src/lib/paraglide/runtime.js"),
      makeMappedDiag("src/app.js"),
    ];

    const result = filterExcludedPaths(diagnostics, [
      "src/lib/paraglide/**/*.js",
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].originalFile).toBe("src/app.js");
  });
});
