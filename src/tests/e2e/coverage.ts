import { type Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function collectCoverage(page: Page) {
  // Start coverage collection
  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();

  return {
    stop: async () => {
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();

      // Filter coverage to only include source files
      const sourceCoverage = jsCoverage.filter(
        (entry) =>
          entry.url.includes('localhost:4173') &&
          (entry.url.includes('/src/') || entry.url.includes('/assets/'))
      );

      // Create coverage directory
      const coverageDir = join(process.cwd(), 'coverage');
      mkdirSync(coverageDir, { recursive: true });

      // Save raw coverage data
      writeFileSync(
        join(coverageDir, 'playwright-coverage.json'),
        JSON.stringify(
          {
            js: sourceCoverage,
            css: cssCoverage,
          },
          null,
          2
        )
      );

      return { js: sourceCoverage, css: cssCoverage };
    },
  };
}

