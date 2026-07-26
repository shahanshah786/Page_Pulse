'use strict';

const dns = require('dns').promises;
const net = require('net');
const { ForbiddenError } = require('./AppError');

// Private / reserved ranges we refuse to audit, to prevent the server
// from being used as an SSRF proxy into internal infrastructure.
const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1']);

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true; // "this" network
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  return (
    lower === '::1' ||
    lower.startsWith('fe80:') || // link-local
    lower.startsWith('fc') || // unique local
    lower.startsWith('fd')
  );
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return false;
}

/**
 * Resolves the hostname and rejects the request if it points at
 * localhost, a private IP range, or a reserved/link-local address.
 * This runs *after* Zod URL-shape validation and *before* any
 * outbound fetch is made by the audit engine.
 */
async function assertPublicHost(hostname) {
  const normalized = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    throw new ForbiddenError('Requests to localhost are not allowed');
  }

  if (net.isIP(normalized)) {
    if (isPrivateIp(normalized)) {
      throw new ForbiddenError('Requests to private IP ranges are not allowed');
    }
    return;
  }

  let addresses;
  try {
    addresses = await dns.lookup(normalized, { all: true });
  } catch (err) {
    throw new ForbiddenError(`Unable to resolve host: ${normalized}`);
  }

  const blocked = addresses.some(({ address }) => isPrivateIp(address));
  if (blocked) {
    throw new ForbiddenError('Target host resolves to a private/internal IP address');
  }
}

module.exports = { assertPublicHost, isPrivateIp };
