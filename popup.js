document.addEventListener('DOMContentLoaded', function() {
  const svgsContainer = document.getElementById('svgs-container');
  const loadingElement = document.getElementById('loading');
  const noSvgsElement = document.getElementById('no-svgs');

  // Execute script in the active tab to extract SVGs
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: extractSvgs
    }, function(results) {
      loadingElement.style.display = 'none';
      
      if (results && results[0].result && results[0].result.length > 0) {
        displaySvgs(results[0].result);
      } else {
        noSvgsElement.style.display = 'block';
      }
    });
  });

  // Display the SVGs in the popup
  function displaySvgs(svgs) {
    svgs.forEach((svg, index) => {
      const svgItem = document.createElement('div');
      svgItem.className = 'svg-item';
      
      const svgPreview = document.createElement('div');
      svgPreview.className = 'svg-preview';
      svgPreview.innerHTML = svg;
      
      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      
      const copyButton = createButton('Copy SVG', () => {
        copyToClipboard(svg, copyButton);
      });
      
      const copyJsonButton = createButton('Copy JSON Friendly', () => {
        copyToClipboard(JSON.stringify(svg), copyJsonButton);
      });
      
      buttons.appendChild(copyButton);
      buttons.appendChild(copyJsonButton);
      
      svgItem.appendChild(svgPreview);
      svgItem.appendChild(buttons);
      svgsContainer.appendChild(svgItem);
    });
  }
  
  // Create a button with click handler
  function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.innerHTML = `<span class="copy-icon">📋</span>${text}`;
    button.addEventListener('click', clickHandler);
    return button;
  }
  
  // Copy content to clipboard and show feedback
  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text)
      .then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✓ Copied!';
        button.classList.add('copy-success');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('copy-success');
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }
});

// Function to be injected into the active tab to extract SVGs
function extractSvgs() {
  // Find all SVG elements in the page
  const svgElements = document.querySelectorAll('svg');
  const svgs = [];
  const seenSvgs = new Set();
  
  // Process each SVG element in document order
  for (let i = 0; i < svgElements.length; i++) {
    const svg = svgElements[i];
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svg.cloneNode(true);
    
    // Get outer HTML of the SVG
    const svgString = clonedSvg.outerHTML;
    
    // Add to the collection if not already included (preserves order)
    if (!seenSvgs.has(svgString)) {
      seenSvgs.add(svgString);
      svgs.push(svgString);
    }
  }
  
  return svgs;
}