// This file is needed for the extension to function properly
// It would handle any background tasks, but this extension doesn't need any background processes
// We include it here for completeness

chrome.runtime.onInstalled.addListener(() => {
  console.log('SVG Extractor extension installed');
});