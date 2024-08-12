// @ts-check

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { styleText as c } from 'util';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

//
// Helpers
//

const getArchitecture = () => {
  const arch = os.arch();

  switch (arch) {
    case 'x64':
      return 'x86_64';
    case 'arm64':
      return 'aarch64';
    default:
      return arch;
  }
};

const getOperatingSystem = () => {
  const platform = os.platform();

  switch (platform) {
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

/**
 * Get the Nix system identifier so we know which
 * platform and architecture to look up on Nixhub
 */
const getNixSystem = () => `${getArchitecture()}-${getOperatingSystem()}`;

/**
 * Read the Node.js version from `.node-version` file
 *
 * @returns {Promise<string>}
 */
const readNodeVersion = async () => {
  const versionPath = path.join(root, '.node-version');
  const version = await fs.readFile(versionPath, 'utf-8');

  return version.trim();
};

//
// Nixhub
//

/**
 * Type guard for Platform
 *
 * @typedef {Object} Platform
 * @property {string} arch
 * @property {string} os
 * @property {string} system
 * @property {string} attribute_path
 * @property {string} commit_hash
 *
 * @param {any} platform
 *
 * @returns {platform is Platform}
 */
const isPlatform = platform =>
  typeof platform === 'object' &&
  platform !== null &&
  typeof platform.arch === 'string' &&
  typeof platform.os === 'string' &&
  typeof platform.system === 'string' &&
  typeof platform.attribute_path === 'string' &&
  typeof platform.commit_hash === 'string';

/**
 * Type guard for Release
 *
 * @typedef {Object} Release
 * @property {string} version
 * @property {Platform[]} platforms
 *
 * @param {any} release
 *
 * @returns {release is Release}
 */
const isRelease = release =>
  typeof release === 'object' &&
  release !== null &&
  typeof release.version === 'string' &&
  Array.isArray(release.platforms) &&
  release.platforms.every(isPlatform);

/**
 * Type guard for NixhubResponse
 *
 * @typedef {Object} NixhubResponse
 * @property {Release[]} releases
 *
 * @param {any} response
 *
 * @returns {response is NixhubResponse}
 */
const isNixhubResponse = response =>
  typeof response === 'object' &&
  response !== null &&
  typeof response.name === 'string' &&
  typeof response.summary === 'string' &&
  typeof response.homepage_url === 'string' &&
  typeof response.license === 'string' &&
  Array.isArray(response.releases) &&
  response.releases.every(isRelease);

/**
 * Fetch Node.js information from Nixhub
 *
 * @param {string} version - Node.js version to fetch
 * @param {string} system - Nix system (e.g., "x86_64-darwin")
 *
 * @returns {Promise<{commitHash: string, attributePath: string}>}
 */
async function fetchNodeInfo(version, system) {
  const url = 'https://search.devbox.sh/v2/pkg?name=nodejs';
  const response = await fetch(url);

  const data = await response.json();

  if (!isNixhubResponse(data)) {
    throw new Error(`Invalid Nixhub API response\n${JSON.stringify(data)}`);
  }

  const release = data.releases.find(r => r.version === version);
  if (!release) {
    throw new Error(`No release found for Node.js version ${version}`);
  }

  const platform = release.platforms.find(p => p.system === system);
  if (!platform) {
    throw new Error(
      `No platform found for system ${system} in Node.js version ${version}`,
    );
  }

  return {
    commitHash: platform.commit_hash,
    attributePath: platform.attribute_path,
  };
}

//
// Updates
//

/**
 * Update the Nix flake with the overlay for the Node.js version
 *
 * @param {string} commitHash - Nixpkgs commit hash
 * @param {string} attributePath - Node.js attribute path
 */
async function updateFlake(commitHash, attributePath) {
  const flakePath = path.join(root, '.devbox', 'flakes', 'yarn', 'flake.nix');
  let flakeContent = await fs.readFile(flakePath, 'utf-8');

  // Update nixpkgs.url with commit SHA for specific version
  flakeContent = flakeContent.replace(
    /(nixpkgs\.url\s*=\s*"nixpkgs\/)([a-f0-9]+)"/,
    `$1${commitHash}"`,
  );

  // Update Node.js package name from Nixpkgs
  flakeContent = flakeContent.replace(
    /(final\.pkgs\.)(node.+?);/,
    `$1${attributePath};`,
  );

  await fs.writeFile(flakePath, flakeContent);
}

/**
 * Update the devbox.json file
 *
 * @param {string} version - Node.js version
 */
const updateDevboxJson = async version => {
  const devboxPath = path.join(root, 'devbox.json');
  const devboxContent = await fs.readFile(devboxPath, 'utf-8');
  const devboxJson = /** @type {unknown} */ (JSON.parse(devboxContent));

  if (
    !devboxJson ||
    typeof devboxJson !== 'object' ||
    !('packages' in devboxJson) ||
    !Array.isArray(devboxJson.packages) ||
    !devboxJson.packages.every(pkg => typeof pkg === 'string')
  ) {
    throw new Error(
      `💥 Unable to parse Devbox configuration JSON:\n${devboxContent}`,
    );
  }

  const found = devboxJson.packages.findIndex(p => p.startsWith('nodejs@'));

  if (found !== -1) {
    devboxJson.packages[found] = `nodejs@${version}`;
  } else {
    devboxJson.packages.push(`nodejs@${version}`);
  }

  await fs.writeFile(devboxPath, JSON.stringify(devboxJson, null, 2));
};

//
// Main
//

try {
  const nodeVersion = await readNodeVersion();
  const system = getNixSystem();

  console.log(`Updating configuration for Node.js version ${nodeVersion}`);

  const { commitHash, attributePath } = await fetchNodeInfo(
    nodeVersion,
    system,
  );

  await updateFlake(commitHash, attributePath);
  await updateDevboxJson(nodeVersion);

  console.log(`Configuration updated successfully with Node.js ${nodeVersion}`);
} catch (error) {
  console.error('\n💥', c(['bold', 'red'], 'Error:'), c('gray', error.message));
}
