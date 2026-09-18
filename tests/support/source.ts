import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/* Vitest runs with the project root as cwd, and resolving from
   `import.meta.url` instead goes through Vite's `/@fs/` prefix, which is not a
   real path. */
const ROOT = process.cwd();

export type SourceFile = { readonly path: string; readonly code: string };

/**
 * Every file under `dir` whose name matches, as repository-relative paths.
 *
 * The point of walking the tree rather than listing files is the one this
 * repository inherited from the application: a check that names the files it
 * inspects can only ever find what somebody remembered to add to the list, and
 * the file that breaks a rule is disproportionately the one nobody remembered.
 * Discover the population; name the exceptions.
 */
export function sourceFiles(dir: string, match = /\.(ts|tsx|css)$/): readonly SourceFile[] {
  const out: SourceFile[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (match.test(entry)) {
        out.push({
          path: relative(ROOT, full).split(sep).join("/"),
          code: readFileSync(full, "utf8"),
        });
      }
    }
  };
  walk(join(ROOT, dir));
  return out;
}

export function repoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}
