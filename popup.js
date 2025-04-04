document.addEventListener('DOMContentLoaded', function() {
  const svgsGrid = document.getElementById('svgs-grid');
  const loadingElement = document.getElementById('loading');
  const noSvgsElement = document.getElementById('no-svgs');
  const toast = document.getElementById('toast');

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

  // Display the SVGs in a grid
  function displaySvgs(svgs) {
    svgs.forEach((svg, index) => {
      const svgItem = document.createElement('div');
      svgItem.className = 'svg-item';
      svgItem.title = 'Left click to copy SVG, right click to copy JSON friendly';
      
      const svgPreview = document.createElement('div');
      svgPreview.className = 'svg-preview';
      svgPreview.innerHTML = svg;
      
      // Left click to copy SVG
      svgItem.addEventListener('click', (e) => {
        e.preventDefault();
        copyToClipboard(svg, 'SVG');
      });
      
      // Right click to copy JSON friendly SVG
      svgItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        copyToClipboard(JSON.stringify(svg), 'JSON friendly SVG');
      });
      
      svgItem.appendChild(svgPreview);
      svgsGrid.appendChild(svgItem);
    });
  }
  
  // Copy content to clipboard and show toast
  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show toast message
        toast.textContent = `Copied ${type}!`;
        toast.style.opacity = '1';
        
        // Hide toast after 1.5 seconds
        setTimeout(() => {
          toast.style.opacity = '0';
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.textContent = 'Copy failed';
        toast.style.opacity = '1';
        
        setTimeout(() => {
          toast.style.opacity = '0';
        }, 1500);
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