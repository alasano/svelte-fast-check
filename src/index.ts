/**
 * svelte-fast-check: Fast type checker alternative to svelte-check
 *
 * Fast type checking using svelte2tsx + tsgo
 */

// Public types
export type {
  FastCheckConfig,
  CheckResult,
  Diagnostic,
  MappedDiagnostic,
  ConversionResult,
  SourceMapData,
  SvelteWarning,
} from './types';

// Re-export runner as main API
export { run as runFastCheck, type RunOptions as FastCheckOptions } from './runner';

// Re-export utilities for advanced usage
export {
  convertAllSvelteFiles,
  convertChangedFiles,
  buildSourcemapMap,
  generateTsconfig,
  getGeneratedTsconfigPath,
  ensureCacheDir,
} from './typecheck/convert';

export { parseTscOutput, countDiagnostics } from './typecheck/parser';

export { filterFalsePositives, loadTsxContents, extractTsxFiles } from './typecheck/filter';

export { mapDiagnostics, filterNegativeLines, tsxPathToOriginal } from './typecheck/mapper';

export { formatDiagnostic, printDiagnostics, printSummary, printRawDiagnostics } from './reporter';

export { collectAllSvelteWarnings, collectChangedSvelteWarnings } from './compiler/collect';
