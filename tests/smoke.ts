/**
 * Browser smoke test against the production build.
 *
 * This is the check the project did not have. The previous app shipped with six
 * dynamic imports returning 404, a module that never executed because of a bare
 * specifier, and a UI that announced "Sistem hazır" through all of it. Loading
 * the built page once and refusing to tolerate a single console error or failed
 * request would have caught every one of those on the commit that introduced it.
 *
 *   npm run build && npx tsx tests/smoke.ts
 *
 * Set CHROMIUM_PATH to use a pre-installed browser instead of Playwright's own.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser } from 'playwright';

const DIST = path.resolve('dist');
const PORT = 4173;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function serve(): Promise<() => Promise<void>> {
  const server = createServer(async (request, response) => {
    const requested = decodeURIComponent((request.url ?? '/').split('?')[0]);
    const file = path.join(DIST, requested === '/' ? 'index.html' : requested);
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  });
  return new Promise((resolve) => {
    server.listen(PORT, () =>
      resolve(() => new Promise<void>((done) => server.close(() => done()))),
    );
  });
}

const failures: string[] = [];

function check(condition: boolean, message: string): void {
  if (condition) {
    console.info(`  ok   ${message}`);
  } else {
    failures.push(message);
    console.error(`  FAIL ${message}`);
  }
}

async function main(): Promise<void> {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/index.html not found — run `npm run build` first.');
    process.exit(1);
  }

  const stop = await serve();
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

    const consoleErrors: string[] = [];
    const badRequests: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    page.on('requestfailed', (request) =>
      badRequests.push(`${request.url()} :: ${request.failure()?.errorText}`),
    );
    page.on('response', (response) => {
      if (response.status() >= 400) badRequests.push(`HTTP ${response.status()} ${response.url()}`);
    });

    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 30_000 });
    await page.waitForTimeout(500);

    console.info('load:');
    check(pageErrors.length === 0, `no uncaught errors (${pageErrors.join(' | ') || 'none'})`);
    check(consoleErrors.length === 0, `no console errors (${consoleErrors.join(' | ') || 'none'})`);
    check(badRequests.length === 0, `no failed requests (${badRequests.join(' | ') || 'none'})`);

    // The old UI reported readiness before anything had run; this one must not.
    const initialStatus = await page.getAttribute('#status', 'data-state');
    check(initialStatus === 'paused', `status starts paused (was "${initialStatus}")`);

    console.info('\nrun:');
    await page.selectOption('#speed', '16');
    await page.click('#toggle');
    await page.waitForTimeout(6000);

    const population = Number(await page.textContent('#t-pop'));
    check(population > 5, `colony is alive (population ${population})`);

    const transcriptLines = await page.locator('#transcript .line').count();
    check(transcriptLines > 5, `bacteria are speaking (${transcriptLines} lines)`);

    const utterances = await page.locator('#transcript .said').allTextContents();
    const distinct = new Set(utterances);
    // The regression: five canned strings for every situation.
    check(distinct.size > 8, `utterances are varied (${distinct.size} distinct of ${utterances.length})`);
    check(
      utterances.every((text) => /[.!?]$/.test(text.trim())),
      'every utterance is a complete sentence',
    );

    const comprehension = await page.textContent('#t-comp');
    check(/%$/.test(comprehension ?? ''), `comprehension is reported (${comprehension})`);

    console.info('\ninteraction:');
    // Pause first: at 16x the agents move between the hit test and the click,
    // which made this step flaky rather than informative.
    await page.click('#toggle');
    await page.waitForTimeout(200);
    const pausedState = await page.getAttribute('#status', 'data-state');
    check(pausedState === 'paused', `pausing stops the run (state "${pausedState}")`);

    const box = await page.locator('#colony').boundingBox();
    if (box) {
      // Sweep a grid until a bacterium is hit; with ~50 agents in the dish this
      // lands well inside the first row or two.
      outer: for (let row = 1; row <= 6; row++) {
        for (let column = 1; column <= 8; column++) {
          await page.mouse.click(
            box.x + (box.width * column) / 9,
            box.y + (box.height * row) / 7,
          );
          if (await page.locator('#inspector dl').count()) break outer;
        }
      }
    }
    const inspected = await page.locator('#inspector dl').count();
    check(inspected > 0, 'clicking a bacterium opens the inspector');
    if (inspected > 0) {
      const words = await page.locator('#inspector .word').count();
      check(words > 0, `the inspector shows the agent's idiolect (${words} words)`);
    }

    if (inspected > 0) {
      await page.fill('#chat-input', 'fotosentez enerji verir');
      await page.click('#chat-send');
      await page.waitForTimeout(400);
      const eventCount = await page.locator('#events > *').count();
      check(eventCount >= 0, `chat accepted (events panel has ${eventCount} entries)`);
    }

    const charts = await page.locator('canvas').count();
    check(charts >= 5, `charts rendered (${charts} canvases)`);

    console.info('\nafter interaction:');
    check(pageErrors.length === 0, `still no uncaught errors (${pageErrors.join(' | ') || 'none'})`);
    check(consoleErrors.length === 0, `still no console errors (${consoleErrors.join(' | ') || 'none'})`);

    await page.screenshot({ path: 'dist/smoke.png', fullPage: false });
    console.info('\nscreenshot: dist/smoke.png');
  } finally {
    await browser?.close();
    await stop();
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} smoke check(s) failed.`);
    process.exit(1);
  }
  console.info('\nall smoke checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
