import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAsin } from '../asin.js';

test('extracts supported product paths across marketplaces', () => {
  for (const path of ['dp', 'gp/product', 'gp/aw/d', 'product']) {
    for (const host of ['www.amazon.com', 'amazon.co.uk', 'www.amazon.co.jp', 'www.amazon.com.be']) {
      for (const suffix of ['', '/', '?ref=test', '#reviews']) {
        assert.equal(extractAsin(`https://${host}/title/${path}/b012345678${suffix}`), 'B012345678');
      }
    }
  }
});

test('supports case-insensitive and encoded ASIN query parameters', () => {
  assert.equal(extractAsin('https://amazon.de/?ASIN=b012345678#test'), 'B012345678');
  assert.equal(extractAsin('https://amazon.fr/?asin=%42012345678'), 'B012345678');
  assert.equal(extractAsin('https://amazon.com/dp/B012345678?asin=B987654321'), 'B012345678');
});

test('rejects non-Amazon URLs, malformed IDs and unsupported schemes', () => {
  for (const url of [undefined, '', 'invalid', 'https://example.com/dp/B012345678',
    'https://amazon.com.evil.test/dp/B012345678', 'https://fakeamazon.com/dp/B012345678',
    'https://amazon.fake/dp/B012345678', 'ftp://amazon.com/dp/B012345678',
    'https://amazon.com/dp/B0123456789', 'https://amazon.com/dp/B01234567',
    'https://amazon.com/dp/B012345678-extra', 'https://amazon.com/?asin=B0123456789',
    'https://amazon.com/?next=/dp/B012345678']) assert.equal(extractAsin(url), null, String(url));
});
