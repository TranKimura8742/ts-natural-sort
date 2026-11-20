import test from 'node:test';
import assert from 'node:assert/strict';

import { naturalCompare } from '../src/index.js';

test('sorts simple numeric suffixes', () => {
  assert.equal(naturalCompare('file2', 'file10'), -1);
  assert.equal(naturalCompare('file10', 'file2'), 1);
  assert.equal(naturalCompare('file2', 'file2'), 0);
});

test('orders multiple numeric chunks', () => {
  assert.equal(naturalCompare('a1b2', 'a1b10'), -1);
  assert.equal(naturalCompare('a1b10', 'a2b1'), -1);
  assert.equal(naturalCompare('a2b1', 'a10b1'), -1);
});

test('handles leading zeros as a tie-break', () => {
  assert.equal(naturalCompare('file01', 'file1'), -1);
  assert.equal(naturalCompare('file1', 'file01'), 1);
  assert.equal(naturalCompare('file001', 'file01'), -1);
});

test('compares pure numeric strings', () => {
  assert.equal(naturalCompare('2', '10'), -1);
  assert.equal(naturalCompare('10', '2'), 1);
  assert.equal(naturalCompare('02', '2'), -1);
});

test('treats digits before letters', () => {
  assert.equal(naturalCompare('a1', 'aA'), -1);
  assert.equal(naturalCompare('aA', 'a1'), 1);
});

test('is case-sensitive', () => {
  assert.equal(naturalCompare('a', 'A'), 1);
  assert.equal(naturalCompare('A', 'a'), -1);
});

test('orders prefixes correctly', () => {
  assert.equal(naturalCompare('file', 'file2'), -1);
  assert.equal(naturalCompare('file2', 'file'), 1);
});

test('handles empty strings', () => {
  assert.equal(naturalCompare('', ''), 0);
  assert.equal(naturalCompare('', 'a'), -1);
  assert.equal(naturalCompare('a', ''), 1);
});

test('handles very large numeric chunks without overflow', () => {
  const big = '9999999999999999999999999999999999999999';
  const bigger = '99999999999999999999999999999999999999999';
  assert.equal(naturalCompare(big, bigger), -1);
  assert.equal(naturalCompare(bigger, big), 1);
});

test('rejects non-string inputs', () => {
  assert.throws(() => naturalCompare(1, 'a'), TypeError);
  assert.throws(() => naturalCompare('a', null), TypeError);
  assert.throws(() => naturalCompare(undefined, undefined), TypeError);
});
