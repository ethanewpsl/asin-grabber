import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { extractAsin } from '../asin.js';

const source = (await readFile(new URL('../popup.js', import.meta.url), 'utf8'))
  .replace("import { extractAsin } from './asin.js';", '');

async function run({ namespace = 'browser', url = 'https://amazon.co.uk/dp/B012345678', failCopy = false, failQuery = false } = {}) {
  const listeners = {};
  const nodes = {
    '#asin': { value: '', focus() {}, select() { this.selected = true; } },
    '#copy': { disabled: true, addEventListener(event, fn) { listeners[event] = fn; } },
    '#status': { textContent: '' }
  };
  const copied = [];
  let rejectCopy = failCopy;
  const context = vm.createContext({
    extractAsin,
    document: { querySelector: selector => nodes[selector] },
    navigator: { clipboard: { async writeText(value) {
      if (rejectCopy) throw Error('Clipboard denied');
      copied.push(value);
    } } },
    [namespace]: { tabs: { async query() {
      if (failQuery) throw Error('Tab unavailable');
      return [{ url }];
    } } }
  });
  await vm.runInContext(source, context);
  return { nodes, copied, async retry() { rejectCopy = false; await listeners.click(); } };
}

for (const namespace of ['browser', 'chrome']) {
  test(`automatically copies using the ${namespace} API`, async () => {
    const { nodes, copied } = await run({ namespace });
    assert.deepEqual(copied, ['B012345678']);
    assert.equal(nodes['#copy'].disabled, false);
    assert.equal(nodes['#status'].textContent, 'Copied ASIN: B012345678');
  });
}

test('clipboard rejection offers manual selection and a working retry', async () => {
  const result = await run({ failCopy: true });
  assert.deepEqual(result.copied, []);
  assert.equal(result.nodes['#asin'].selected, true);
  assert.match(result.nodes['#status'].textContent, /retry/);
  await result.retry();
  assert.deepEqual(result.copied, ['B012345678']);
});

test('non-product pages do not modify the clipboard', async () => {
  const { nodes, copied } = await run({ url: 'https://example.com' });
  assert.deepEqual(copied, []);
  assert.equal(nodes['#copy'].disabled, true);
  assert.match(nodes['#status'].textContent, /Open an Amazon product page/);
});

test('tab errors are shown without an unhandled rejection', async () => {
  const { nodes, copied } = await run({ failQuery: true });
  assert.deepEqual(copied, []);
  assert.equal(nodes['#copy'].disabled, true);
  assert.match(nodes['#status'].textContent, /Could not read this tab/);
});
