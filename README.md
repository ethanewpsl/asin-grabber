# Amazon ASIN Copier

Click the toolbar extension on an Amazon product page to copy its ASIN. A small
popup confirms the copy and keeps the ASIN available for manual copying. If the
browser blocks automatic copying, click **Copy ASIN** in the popup.

## Browser support

One Manifest V3 source works with current desktop Chrome, Edge, Brave and other
Chromium browsers, and Firefox. Safari uses the same source but requires packaging
with Apple's developer tools. Real browser installation and clipboard smoke tests
are still required; automated tests use mocked extension APIs.

There is no background worker or page injection. Only `activeTab` (read the URL
when clicked) and `clipboardWrite` (copy the ASIN) permissions are requested.
No analytics, storage, network requests, or clipboard reading are used.

## Install locally

### Chrome / Edge / Brave

1. Open `chrome://extensions`, `edge://extensions`, or `brave://extensions`.
2. Enable Developer mode and choose **Load unpacked**.
3. Select this repository folder and pin the extension.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on** and select this folder's `manifest.json`.
3. The temporary installation lasts until Firefox restarts. Permanent distribution
   requires Mozilla signing and any current store-specific manifest metadata.

### Safari

Install full Xcode, then use Apple's Safari web extension packaging tool on this
folder. Current tooling uses `xcrun safari-web-extension-packager`; older Xcode
versions use `xcrun safari-web-extension-converter`. Follow the tool's help and
Apple's packaging guide to build, sign, and enable the containing app/extension:
https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari

Safari has not been packaged or verified in this checkout; Apple's packaging
tools were unavailable on the development machine.

## Supported URLs

Recognizes `/dp/ASIN`, `/gp/product/ASIN`, `/gp/aw/d/ASIN`, `/product/ASIN`, and
`?asin=ASIN` on the Amazon marketplace domains listed in `asin.js`. ASINs must
contain exactly ten letters/digits and are copied uppercase. Product paths take
precedence over query parameters. Lookalike domains are rejected. Short links
such as `amzn.to` must first redirect to an Amazon product page. This extension
reads the URL; it does not inspect product content or track variation changes
unless the URL changes.

## Develop and test

Node.js 18+; no dependencies or build step:

```sh
npm test
```

Tests cover URL parsing, lookalike sites, both extension API namespaces, successful
copying, clipboard denial/retry, and tab-access failure.

Before release, load in each target browser and check: an Amazon product copies
the exact ASIN (paste into a text editor), a non-product page shows guidance,
and the Copy ASIN button works. Check Safari separately after packaging.

Create a distribution ZIP containing only `manifest.json`, `asin.js`,
`popup.html`, `popup.css`, and `popup.js`. Browser-store submission, icons,
signing, and listing metadata are separate release tasks.

Compatibility references:
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action
