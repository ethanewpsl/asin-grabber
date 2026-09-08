import { extractAsin } from './asin.js';

const api = globalThis.browser ?? globalThis.chrome;
const field = document.querySelector('#asin');
const button = document.querySelector('#copy');
const status = document.querySelector('#status');

async function copy() {
  // Invoke writeText directly from the button event, preserving user activation.
  try {
    await navigator.clipboard.writeText(field.value);
    status.textContent = `Copied ASIN: ${field.value}`;
  } catch {
    status.textContent = 'Click Copy ASIN to retry, or select and copy the ASIN manually.';
    field.focus();
    field.select();
  }
}

button.addEventListener('click', copy);

async function init() {
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    const asin = extractAsin(tab?.url);
    if (!asin) {
      status.textContent = 'Open an Amazon product page, then click the extension again.';
      return;
    }
    field.value = asin;
    button.disabled = false;
    await copy();
  } catch {
    status.textContent = 'Could not read this tab. Open an Amazon product page and try again.';
  }
}

init();
