/**
 * Sourcemap-based location mapping module
 *
 * Converts error locations from .svelte.tsx files under .fast-check/tsx/
 * to original .svelte file locations under src/.
 */

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { resolve } from 'path';
import type { Diagnostic, MappedDiagnostic, SourceMapData } from './types';

/** .fast-check folder path constants */
const CACHE_ROOT = '.fast-check';
const TSX_DIR = 'tsx';

/**
 * Extract original svelte path from tsx path
 * .fast-check/tsx/src/routes/+layout.svelte.tsx -> src/routes/+layout.svelte
 */
export function tsxPathToOriginal(rootDir: string, tsxPath: string): string {
  const cachePrefix = resolve(rootDir, CACHE_ROOT, TSX_DIR) + '/';

  if (tsxPath.startsWith(cachePrefix)) {
    // Absolute path case
    const relativeTsx = tsxPath.slice(cachePrefix.length);
    return relativeTsx.replace(/\.tsx$/, '');
  }

  // Relative path case (tsc output)
  const prefix = `${CACHE_ROOT}/${TSX_DIR}/`;
  if (tsxPath.startsWith(prefix)) {
    const relativeTsx = tsxPath.slice(prefix.length);
    return relativeTsx.replace(/\.tsx$/, '');
  }

  // Cannot convert
  return tsxPath.replace(/\.tsx$/, '');
}

/**
 * Map all diagnostics to original locations
 */
export function mapDiagnostics(
  diagnostics: Diagnostic[],
  sourcemaps: Map<string, SourceMapData>,
  rootDir: string
): MappedDiagnostic[] {
  const mapped: MappedDiagnostic[] = [];

  for (const d of diagnostics) {
    const result = mapDiagnostic(d, sourcemaps, rootDir);
    if (result) {
      mapped.push(result);
    }
  }

  return mapped;
}

/**
 * Map a single diagnostic to original location
 */
function mapDiagnostic(
  d: Diagnostic,
  sourcemaps: Map<string, SourceMapData>,
  rootDir: string
): MappedDiagnostic | null {
  // Only .svelte.tsx files need mapping
  if (!d.file.endsWith('.svelte.tsx')) {
    // Regular .ts files are returned as-is
    return {
      ...d,
      originalFile: d.file,
      originalLine: d.line,
      originalColumn: d.column,
    };
  }

  // Convert tsc output path to absolute path
  const absolutePath = resolve(rootDir, d.file);
  const sourcemap = sourcemaps.get(absolutePath);

  // Calculate original svelte path
  const originalFile = tsxPathToOriginal(rootDir, d.file);

  if (!sourcemap) {
    // Without sourcemap, original location is unknown
    return {
      ...d,
      originalFile,
      originalLine: d.line,
      originalColumn: d.column,
    };
  }

  try {
    // SourceMapData is compatible with TraceMap as returned by svelte2tsx
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracer = new TraceMap(sourcemap as any);
    const original = originalPositionFor(tracer, {
      line: d.line,
      column: d.column - 1, // 0-based column
    });

    if (original.line === null || original.column === null) {
      // Mapping failed - likely generated code
      return null;
    }

    return {
      ...d,
      originalFile,
      originalLine: original.line,
      originalColumn: original.column + 1, // 1-based column
    };
  } catch {
    // On mapping failure, return null (ignore this error)
    return null;
  }
}

/**
 * Filter out negative line numbers (mapping failure cases)
 */
export function filterNegativeLines(diagnostics: MappedDiagnostic[]): MappedDiagnostic[] {
  return diagnostics.filter((d) => d.originalLine > 0 && d.originalColumn > 0);
}
