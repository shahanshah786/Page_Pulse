'use strict';

const { assertPublicHost, isPrivateIp } = require('../../src/utils/ssrfGuard');
const { ForbiddenError } = require('../../src/utils/AppError');

describe('ssrfGuard.isPrivateIp', () => {
  test.each([
    ['127.0.0.1', true],
    ['10.0.0.5', true],
    ['192.168.1.10', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['169.254.1.1', true],
    ['8.8.8.8', false],
    ['1.1.1.1', false],
    ['93.184.216.34', false],
  ])('isPrivateIp(%s) === %s', (ip, expected) => {
    expect(isPrivateIp(ip)).toBe(expected);
  });

  test('detects private IPv6 ranges', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fe80::1')).toBe(true);
    expect(isPrivateIp('fd00::1')).toBe(true);
  });
});

describe('assertPublicHost', () => {
  test('blocks localhost', async () => {
    await expect(assertPublicHost('localhost')).rejects.toBeInstanceOf(ForbiddenError);
  });

  test('blocks literal private IPv4 addresses', async () => {
    await expect(assertPublicHost('127.0.0.1')).rejects.toBeInstanceOf(ForbiddenError);
    await expect(assertPublicHost('10.0.0.1')).rejects.toBeInstanceOf(ForbiddenError);
    await expect(assertPublicHost('192.168.0.1')).rejects.toBeInstanceOf(ForbiddenError);
  });

  test('blocks 0.0.0.0', async () => {
    await expect(assertPublicHost('0.0.0.0')).rejects.toBeInstanceOf(ForbiddenError);
  });

  test('allows a public IP literal', async () => {
    await expect(assertPublicHost('8.8.8.8')).resolves.toBeUndefined();
  });
});
