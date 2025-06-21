/**
 * @module logger
 * @description Utility for persisting experiment analytics as JSON lines.
 */

import { promises as fs } from 'fs';
import path from 'path';

const logFile = path.resolve('analytics_data/logs.jsonl');

/**
 * Record a single experiment event to the analytics log.
 *
 * @param {object} entry - Arbitrary experiment data to persist
 * @returns {Promise<void>} Resolves once the entry is appended
 */
export async function recordExperiment(entry) {
  try {
    await fs.mkdir(path.dirname(logFile), { recursive: true });
    await fs.appendFile(logFile, `${JSON.stringify(entry)}\n`);
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieve all experiment analytics from the log file.
 *
 * @returns {Promise<object[]>} Array of parsed log objects
 */
export async function getAllLogs() {
  try {
    const data = await fs.readFile(logFile, 'utf8');
    return data
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}
