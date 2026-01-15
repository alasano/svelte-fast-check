/**
 * Unit tests for SvelteKit alias conversion
 */

import { describe, expect, test } from "bun:test";
import { convertSvelteKitAlias } from "../../src/alias";

describe("convertSvelteKitAlias", () => {
  test("should convert simple alias to TypeScript paths format", () => {
    const alias = { shared: "src/shared" };
    const paths = convertSvelteKitAlias(alias);

    expect(paths).toEqual({
      shared: ["./../src/shared"],
      "shared/*": ["./../src/shared/*"],
    });
  });

  test("should handle multiple aliases", () => {
    const alias = {
      shared: "src/shared",
      utils: "src/utils",
    };
    const paths = convertSvelteKitAlias(alias);

    expect(paths).toEqual({
      shared: ["./../src/shared"],
      "shared/*": ["./../src/shared/*"],
      utils: ["./../src/utils"],
      "utils/*": ["./../src/utils/*"],
    });
  });

  test("should handle alias with $ prefix", () => {
    const alias = { $shared: "src/shared" };
    const paths = convertSvelteKitAlias(alias);

    expect(paths).toEqual({
      $shared: ["./../src/shared"],
      "$shared/*": ["./../src/shared/*"],
    });
  });

  test("should not duplicate glob pattern if already present", () => {
    const alias = {
      shared: "src/shared",
      "shared/*": "src/shared/*",
    };
    const paths = convertSvelteKitAlias(alias);

    // shared/* should not be duplicated
    expect(paths.shared).toEqual(["./../src/shared"]);
    expect(paths["shared/*"]).toEqual(["./../src/shared/*"]);
  });

  test("should handle alias pointing to specific file", () => {
    const alias = { ioc: "src/ioc/index.ts" };
    const paths = convertSvelteKitAlias(alias);

    // File paths should not get glob pattern added
    expect(paths).toEqual({
      ioc: ["./../src/ioc/index.ts"],
    });
  });

  test("should return empty object for empty alias", () => {
    const paths = convertSvelteKitAlias({});
    expect(paths).toEqual({});
  });

  test("should return empty object for undefined alias", () => {
    const paths = convertSvelteKitAlias(undefined);
    expect(paths).toEqual({});
  });

  test("should handle path with ./ prefix", () => {
    const alias = { shared: "./src/shared" };
    const paths = convertSvelteKitAlias(alias);

    expect(paths).toEqual({
      shared: ["./../src/shared"],
      "shared/*": ["./../src/shared/*"],
    });
  });

  test("should handle path with ../ prefix", () => {
    const alias = { shared: "../src/shared" };
    const paths = convertSvelteKitAlias(alias);

    expect(paths).toEqual({
      shared: ["./../src/shared"],
      "shared/*": ["./../src/shared/*"],
    });
  });

  test("should handle absolute path", () => {
    const alias = { shared: "/absolute/path" };
    const paths = convertSvelteKitAlias(alias);

    // Absolute paths should be kept as-is
    expect(paths).toEqual({
      shared: ["/absolute/path"],
      "shared/*": ["/absolute/path/*"],
    });
  });
});
