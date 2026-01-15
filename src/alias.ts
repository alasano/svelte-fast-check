/**
 * SvelteKit alias conversion utilities
 *
 * Converts svelte.config.js kit.alias format to TypeScript paths format
 */

/** File extensions that indicate a path points to a specific file */
const FILE_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs", ".json"];

/**
 * Check if a path points to a specific file (has file extension)
 */
function isFilePath(path: string): boolean {
  return FILE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

/**
 * Normalize alias path for tsconfig
 * - Absolute paths (/...) are kept as-is
 * - Relative paths starting with ./ have the prefix removed
 * - Other paths get './..' prefix (relative to .fast-check/)
 */
function normalizePath(value: string): string {
  // Absolute path - use as-is
  if (value.startsWith("/")) {
    return value;
  }
  // Already relative with ./
  if (value.startsWith("./")) {
    return `./.${value}`; // ./src -> ./../src (remove leading .)
  }
  // Already relative with ../
  if (value.startsWith("../")) {
    return `./${value}`; // ../src -> ./../src
  }
  // Normal path like 'src/shared'
  return `./../${value}`;
}

/**
 * Convert SvelteKit alias config to TypeScript paths format
 *
 * SvelteKit alias format: { shared: 'src/shared' }
 * TypeScript paths format: { shared: ['./../src/shared'], 'shared/*': ['./../src/shared/*'] }
 *
 * The './..' prefix is needed because paths are relative to .fast-check/tsconfig.json
 */
export function convertSvelteKitAlias(
  alias: Record<string, string> | undefined,
): Record<string, string[]> {
  if (!alias) return {};

  const paths: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(alias)) {
    const tsconfigPath = normalizePath(value);

    // Add the base alias
    paths[key] = [tsconfigPath];

    // Add glob pattern for directory aliases (not files, not already glob)
    if (!key.endsWith("/*") && !isFilePath(value)) {
      const globKey = `${key}/*`;
      // Only add if not already defined in the original alias
      if (!(globKey in alias)) {
        paths[globKey] = [`${tsconfigPath}/*`];
      }
    }
  }

  return paths;
}
