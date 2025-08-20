(() => {
  console.log('DexPaprika search script loading...');
  
  try {
    const CSS = `
      .dp-token-button {
        position: fixed !important;
        background: #16A34A !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        padding: 8px 16px !important;
        font-size: 14px !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        display: none !important;
        font-weight: 500 !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        transition: all 0.2s ease !important;
        min-width: 200px !important;
        text-align: center !important;
        pointer-events: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .dp-token-button:hover {
        background: #15803D !important;
        transform: scale(1.05) !important;
        box-shadow: 0 6px 12px rgba(0,0,0,0.3) !important;
      }
      .dp-token-button.show {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .dp-token-button:disabled {
        background: #6b7280 !important;
        cursor: not-allowed !important;
        transform: none !important;
      }
      .dp-debug-button {
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        background: #ef4444 !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        font-size: 12px !important;
        cursor: pointer !important;
        z-index: 100000 !important;
      }
      .dp-lookup{position:relative;max-width:640px;margin:16px 0}
      .dp-lookup input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px}
      .dp-suggestions{position:absolute;z-index:40;left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;max-height:300px;overflow-y:auto}
      .dp-suggestions button{display:flex;gap:8px;width:100%;padding:10px 12px;border:0;background:#fff;cursor:pointer;text-align:left;font-size:14px}
      .dp-suggestions button:hover{background:#f9fafb}
      .dp-suggestions button:last-child{border-bottom:none}
      .dp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
      .dp-actions a,.dp-actions button{padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;text-decoration:none;font-size:12px}
      .dp-actions a:hover,.dp-actions button:hover{background:#f9fafb}
      .dp-loading{text-align:center;padding:20px;color:#6b7280}
      .dp-error{text-align:center;padding:20px;color:#ef4444}
      .dp-no-results{text-align:center;padding:20px;color:#6b7280}
    `;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    console.log('CSS styles added successfully');

    // Cache for token data
    let tokenCache = null;
    let tokenCachePromise = null;

    // Try multiple possible paths for the token index file
    const possiblePaths = [
      'assets/token-index.json',
      '/assets/token-index.json',
      './assets/token-index.json',
      '../assets/token-index.json'
    ];

    async function loadTokenData() {
      if (tokenCache) {
        console.log('Using cached token data');
        return tokenCache;
      }
      if (tokenCachePromise) {
        console.log('Token data already loading, waiting...');
        return tokenCachePromise;
      }
      
      console.log('Loading token data...');
      tokenCachePromise = (async () => {
        for (const path of possiblePaths) {
          try {
            console.log('Trying path:', path);
            const res = await fetch(path);
            console.log('Response status for', path, ':', res.status);
            if (res.ok) {
              const data = await res.json();
              console.log('Token data loaded successfully from', path, ':', data.length, 'tokens');
              tokenCache = data;
              return data;
            }
          } catch (err) {
            console.log('Failed to load from', path, ':', err.message);
          }
        }
        
        // If all paths fail, return fallback data
        console.log('All paths failed, using fallback data');
        const fallbackData = [
          {"symbol":"SOL","name":"Solana","chain":"solana","address":"So11111111111111111111111111111111111111112"},
          {"symbol":"USDC","name":"USD Coin (Ethereum)","chain":"ethereum","address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},
          {"symbol":"USDC","name":"USD Coin (Solana)","chain":"solana","address":"Es9vMFrzaCER2kJ8U1L8vMcbA5sX6Phn7ZdZ2m5W861"},
          {"symbol":"WETH","name":"Wrapped Ether","chain":"ethereum","address":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"},
          {"symbol":"WBTC","name":"Wrapped Bitcoin","chain":"ethereum","address":"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"},
          {"symbol":"BONK","name":"Bonk","chain":"solana","address":"DezXAZ8z7P5M5VKsTR5VYg5t6sQf5CqZ3k8sEzsZsP1"}
        ];
        tokenCache = fallbackData;
        return fallbackData;
      })();
      
      return tokenCachePromise;
    }

    async function searchTokens(q) {
      try {
        console.log('Searching for:', q);
        const all = await loadTokenData();
        if (!all || !Array.isArray(all)) {
          console.log('No token data available');
          return [];
        }
        
        q = q.toLowerCase().trim();
        if (q.length < 1) return [];
        
        const results = all
          .filter(t => 
            t.symbol?.toLowerCase().includes(q) || 
            t.name?.toLowerCase().includes(q) ||
            t.address?.toLowerCase().includes(q)
          )
          .slice(0, 8);
        
        console.log('Search results:', results.length, 'tokens found');
        return results;
      } catch (err) {
        console.error('Search error:', err);
        return [];
      }
    }

    async function fetchTokenPrice(token) {
      try {
        const base = 'https://api.dexpaprika.com';
        const url = token.address
          ? `${base}/networks/${token.chain}/tokens/${token.address}`
          : `${base}/networks/${token.chain}/tokens/by-symbol/${token.symbol}`;
        
        console.log('Fetching price from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error fetching token price:', err);
        return null;
      }
    }

    function generateTokenPage(token, priceData) {
      const timestamp = new Date().toISOString();
      const price = priceData?.price_usd || 'N/A';
      const volume24h = priceData?.volume_usd_24h || 'N/A';
      const marketCap = priceData?.market_cap_usd || 'N/A';
      
      return `---
title: "${token.symbol} - ${token.name}"
sidebarTitle: "${token.symbol} Token Data"
description: "Real-time data and analytics for ${token.symbol} (${token.name}) on ${token.chain}"
generated: true
timestamp: "${timestamp}"
---

# ${token.symbol} Token Data

## Overview

**Symbol:** ${token.symbol}  
**Name:** ${token.name}  
**Chain:** ${token.chain}  
**Address:** \`${token.address}\`

## Current Market Data

**Price:** $${price}  
**24h Volume:** $${volume24h}  
**Market Cap:** $${marketCap}

## Quick Actions

<div class="dp-actions">
  <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" target="_self">Get Latest Price</a>
  <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" target="_self">Top Pools</a>
  <a href="/api-reference/pools/get-ohlcv-data-for-a-pool-pair?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" target="_self">OHLCV Data</a>
  <a href="/get-started/sdk-ts?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" target="_self">SDK Examples</a>
</div>

## API Examples

### Get Current Price

\`\`\`bash
curl "https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}"
\`\`\`

### Get Top Pools

\`\`\`bash
curl "https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}/pools"
\`\`\`

### Get Historical Data

\`\`\`bash
curl "https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}/ohlcv?start=2024-01-01&end=2024-12-31"
\`\`\`

## Related Resources

- [DexPaprika API Documentation](/api-reference/introduction)
- [Getting Started Guide](/get-started/sdk-ts)
- [Token Lookup Tool](/tools/token-lookup)

---

*This page was automatically generated on ${new Date().toLocaleString()}*
`;
    }

    function mountLookup(container) {
      console.log('Mounting lookup widget in container:', container);
      try {
        container.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'dp-lookup';
        const input = document.createElement('input');
        input.placeholder = 'Search token by ticker or name (e.g., SOL, USDC, BONK)…';
        const sugg = document.createElement('div');
        sugg.className = 'dp-suggestions';
        sugg.style.display = 'none';

        let last = '';
        const debounce = (fn, n = 200) => {
          let h;
          return (...a) => {
            clearTimeout(h);
            h = setTimeout(() => fn(...a), n);
          };
        };

        async function onInput() {
          const q = input.value.trim();
          if (q.length < 1 || q === last) return;
          last = q;
          console.log('Input changed to:', q);
          
          // Show loading state
          sugg.innerHTML = '<div class="dp-loading">Searching...</div>';
          sugg.style.display = 'block';
          
          const results = await searchTokens(q);
          sugg.innerHTML = '';
          
          if (!results.length) {
            sugg.innerHTML = '<div class="dp-no-results">No tokens found</div>';
            setTimeout(() => {
              if (sugg.innerHTML.includes('No tokens found')) {
                sugg.style.display = 'none';
              }
            }, 2000);
            return;
          }
          
          results.forEach(t => {
            const btn = document.createElement('button');
            btn.innerHTML = `<strong>${t.symbol}</strong> — ${t.name} · ${t.chain}`;
            btn.onclick = async () => {
              console.log('Token selected:', t);
              sugg.style.display = 'none';
              
              // Show loading message
              root.innerHTML = '<div class="dp-loading">Loading token data...</div>';
              
              try {
                // Fetch real-time price data
                const priceData = await fetchTokenPrice(t);
                
                // Generate the MDX content
                const mdxContent = generateTokenPage(t, priceData);
                
                // Create a blob and download it
                const blob = new Blob([mdxContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${t.symbol.toLowerCase()}-token-data.mdx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Show success message
                root.innerHTML = `
                  <div style="text-align: center; padding: 20px;">
                    <h3>✅ Token Data Generated!</h3>
                    <p>MDX file for <strong>${t.symbol}</strong> has been downloaded.</p>
                    <p>You can now add this file to your Mintlify docs and it will display real-time data.</p>
                  </div>
                `;
              } catch (err) {
                console.error('Error generating token page:', err);
                root.innerHTML = `
                  <div style="text-align: center; padding: 20px; color: #ef4444;">
                    <h3>❌ Error</h3>
                    <p>Failed to generate token data. Please try again.</p>
                  </div>
                `;
              }
            };
            sugg.appendChild(btn);
          });
          sugg.style.display = 'block';
        }

        input.addEventListener('input', debounce(onInput, 180));
        input.addEventListener('focus', () => {
          if (input.value.trim().length > 0) {
            onInput();
          }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
          if (!root.contains(e.target)) {
            sugg.style.display = 'none';
          }
        });
        
        root.appendChild(input);
        root.appendChild(sugg);
        container.appendChild(root);
        console.log('Lookup widget mounted successfully');
      } catch (err) {
        console.error('Error mounting lookup widget:', err);
        container.innerHTML = '<div style="color: red; padding: 20px;">Error loading search widget</div>';
      }
    }

    // Global search button functionality
    function findSearchInput() {
      // More comprehensive selectors for Mintlify search
      const selectors = [
        // Mintlify specific selectors
        '.search-overlay input[type="text"]',
        '.search-overlay input[placeholder]',
        '.search-overlay input',
        '[data-testid="search-input"]',
        '[data-testid="search"] input',
        // General search selectors
        'input[placeholder*="search" i]',
        'input[placeholder*="Search" i]',
        'input[type="search"]',
        '.search input',
        'input[aria-label*="search" i]',
        'input[placeholder*="eth" i]',
        '[role="search"] input',
        // Fallback - any input with placeholder
        'input[placeholder]',
        // Last resort - any input
        'input'
      ];
      
      console.log('Searching for input elements...');
      for (const selector of selectors) {
        const inputs = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" found ${inputs.length} elements`);
        
        for (const input of inputs) {
          // Check if input is visible and has reasonable dimensions
          const rect = input.getBoundingClientRect();
          const isVisible = input.offsetParent !== null && 
                          rect.width > 100 && 
                          rect.height > 20 &&
                          rect.top > 0 &&
                          rect.left > 0;
          
          if (isVisible) {
            console.log('Found visible search input:', {
              selector,
              value: input.value,
              placeholder: input.placeholder,
              rect: rect,
              classes: input.className,
              id: input.id
            });
            return input;
          }
        }
      }
      
      console.log('No suitable search input found');
      return null;
    }

    function setupGlobalSearchButton() {
      console.log('Setting up global search button...');
      
      function createTokenButton() {
        const button = document.createElement('button');
        button.className = 'dp-token-button';
        button.textContent = 'Looking for token data?';
        button.style.cssText = `
          position: fixed !important;
          background: #16A34A !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          cursor: pointer !important;
          z-index: 99999 !important;
          display: none !important;
          font-weight: 500 !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
          transition: all 0.2s ease !important;
          min-width: 200px !important;
          max-width: 300px !important;
          text-align: center !important;
          pointer-events: auto !important;
          opacity: 1 !important;
          visibility: visible !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        `;
        
        button.addEventListener('click', async () => {
          const searchInput = findSearchInput();
          if (!searchInput) return;
          
          const query = searchInput.value.trim();
          if (query.length < 2) return;
          
          console.log('Token button clicked for query:', query);
          
          // Hide the button immediately
          button.style.display = 'none';
          button.classList.remove('show');
          
          // Search for tokens
          const results = await searchTokens(query);
          if (results.length === 0) {
            showNotification('No tokens found for "' + query + '"', 'error');
            return;
          }
          
          // If single result, redirect to template page with token data
          if (results.length === 1) {
            const token = results[0];
            console.log('Single token found, redirecting to lookup page:', token);

            // Redirect to lookup page with single token data
            const params = new URLSearchParams({
              symbol: token.symbol,
              name: token.name,
              chain: token.chain,
              address: token.address || '',
              query: query
            });

            window.location.href = `/tools/token-lookup?${params.toString()}`;
            return;
          }
          
          // If multiple results, navigate to a list page
          console.log('Multiple tokens found, navigating to list page');
          const tokenParams = results.map(t => 
            `${t.symbol}=${encodeURIComponent(t.chain)}:${encodeURIComponent(t.address || '')}`
          ).join('&');
          
          // Navigate to the token lookup page with all results
          window.location.href = `/tools/token-lookup?${tokenParams}&query=${encodeURIComponent(query)}`;
        });
        
        return button;
      }

      async function displayTokenDataOnPage(token) {
        try {
          // Show loading
          const button = document.querySelector('.dp-token-button');
          if (button) {
            button.textContent = 'Loading...';
            button.disabled = true;
          }
          
          // Fetch real-time price data
          const priceData = await fetchTokenPrice(token);
          
          // Generate the MDX content
          const mdxContent = generateTokenPage(token, priceData);
          
          // Create a temporary div to hold the MDX content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = mdxContent;
          
          // Append the MDX content to the current page's body
          document.body.appendChild(tempDiv);
          
          // Show success message
          showNotification(`✅ Token data for ${token.symbol} has been displayed!`, 'success');
          
        } catch (err) {
          console.error('Error displaying token data on page:', err);
          showNotification('❌ Failed to display token data. Please try again.', 'error');
        } finally {
          // Reset button
          const button = document.querySelector('.dp-token-button');
          if (button) {
            button.textContent = 'Looking for token data?';
            button.disabled = false;
          }
        }
      }

      function watchSearchInput() {
        const searchInput = findSearchInput();
        if (!searchInput) {
          console.log('No search input found, will retry...');
          return;
        }

        // Check if button already exists
        let button = document.querySelector('.dp-token-button');
        if (!button) {
          button = createTokenButton();
          document.body.appendChild(button);
          console.log('Token button created and added to DOM');
        }

        // Check if we already attached listeners to this input
        if (searchInput.dataset.dpListenersAttached) {
          console.log('Listeners already attached to this input');
          return;
        }

        // Mark this input as having listeners attached
        searchInput.dataset.dpListenersAttached = 'true';

        // Position the button relative to the search input
        const rect = searchInput.getBoundingClientRect();
        const buttonWidth = Math.min(300, Math.max(200, button.offsetWidth || 200));
        const buttonHeight = 30;
        
        // Position to the right of the search input, slightly higher
        button.style.left = `${rect.right - buttonWidth - 20}px`;
        button.style.top = `${rect.top - 10}px`; // Move up by 10px
        button.style.transform = 'none'; // Reset any transform
        
        console.log('Button positioned at:', {
          left: button.style.left,
          top: button.style.top,
          searchInputRect: rect,
          buttonWidth: buttonWidth
        });

        let lastValue = '';
        const checkInput = () => {
          const currentValue = searchInput.value.trim();
          if (currentValue !== lastValue) {
            lastValue = currentValue;
            console.log('Search input value changed to:', currentValue);
            
            if (currentValue.length >= 2) {
              // Update button text with user input (without triggering events)
              const newText = `Looking for "${currentValue.toUpperCase()}" token data?`;
              if (button.textContent !== newText) {
                button.textContent = newText;
              }
              
              // Force show the button with explicit styles
              button.style.display = 'block';
              button.style.opacity = '1';
              button.style.visibility = 'visible';
              button.style.pointerEvents = 'auto';
              button.classList.add('show');
              console.log('Button should now be visible - styles applied:', {
                display: button.style.display,
                opacity: button.style.opacity,
                visibility: button.style.visibility,
                zIndex: button.style.zIndex,
                text: button.textContent
              });
            } else {
              button.style.display = 'none';
              button.style.opacity = '0';
              button.style.visibility = 'hidden';
              button.style.pointerEvents = 'none';
              button.classList.remove('show');
              console.log('Button should now be hidden');
            }
          }
        };

        // Listen for input events with debouncing
        let inputTimeout;
        const debouncedCheckInput = () => {
          clearTimeout(inputTimeout);
          inputTimeout = setTimeout(checkInput, 100);
        };

        searchInput.addEventListener('input', debouncedCheckInput);
        searchInput.addEventListener('focus', debouncedCheckInput);
        searchInput.addEventListener('keyup', debouncedCheckInput);
        
        // Also check immediately
        checkInput();
        
        console.log('Event listeners attached to search input');
      }

      // Try to find search input immediately and also watch for it
      watchSearchInput();
      
      // Also watch for dynamic changes with more frequent checks
      let isObserving = false;
      const observer = new MutationObserver((mutations) => {
        if (isObserving) return; // Prevent recursive calls
        
        // Only trigger if the search input or its container changed
        const relevantChanges = mutations.some(mutation => {
          return mutation.type === 'childList' && 
                 (mutation.target.classList.contains('search-overlay') ||
                  mutation.target.querySelector('input[placeholder*="search"]') ||
                  mutation.addedNodes.length > 0);
        });
        
        if (relevantChanges) {
          isObserving = true;
          setTimeout(() => {
            watchSearchInput();
            isObserving = false;
          }, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Watch for URL changes (Mintlify might use client-side routing)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          console.log('URL changed, re-initializing search detection');
          setTimeout(() => watchSearchInput(), 100);
        }
      }).observe(document, { subtree: true, childList: true });
      
      // Also try periodically in case the search input loads after the observer
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      const interval = setInterval(() => {
        attempts++;
        console.log(`Attempt ${attempts} to find search input...`);
        
        const searchInput = findSearchInput();
        if (searchInput || attempts >= maxAttempts) {
          clearInterval(interval);
          if (searchInput) {
            console.log('Search input found on attempt', attempts);
            watchSearchInput();
          } else {
            console.log('Failed to find search input after', maxAttempts, 'attempts');
          }
        }
      }, 500); // Reduced interval to 500ms for faster detection
      
      // Also watch for keyboard events that might open search
      document.addEventListener('keydown', (e) => {
        // Check if Ctrl+K or Cmd+K was pressed (common search shortcuts)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          console.log('Search shortcut detected, checking for search input...');
          setTimeout(() => watchSearchInput(), 100);
        }
      });
    }

    function init() {
      console.log('Initializing DexPaprika search functionality...');
      
      try {
        // Add debug button
        const debugButton = document.createElement('button');
        debugButton.className = 'dp-debug-button';
        debugButton.textContent = 'Debug Search';
        debugButton.onclick = () => {
          console.log('=== DEBUG INFO ===');
          console.log('Document ready state:', document.readyState);
          console.log('All inputs on page:', document.querySelectorAll('input').length);
          console.log('Search inputs found:', document.querySelectorAll('input[placeholder*="search"], input[type="search"], .search input').length);
          
          // Try to find search input manually
          const searchInput = findSearchInput();
          if (searchInput) {
            console.log('Search input found:', searchInput);
            console.log('Search input value:', searchInput.value);
            console.log('Search input rect:', searchInput.getBoundingClientRect());
            
            // Check if token button exists
            const tokenButton = document.querySelector('.dp-token-button');
            if (tokenButton) {
              console.log('Token button found, forcing it to show...');
              tokenButton.style.display = 'block';
              tokenButton.style.opacity = '1';
              tokenButton.style.visibility = 'visible';
              tokenButton.style.left = '50%';
              tokenButton.style.top = '50%';
              tokenButton.style.transform = 'translate(-50%, -50%)';
              tokenButton.style.zIndex = '99999';
              console.log('Button forced to show in center');
            } else {
              console.log('No token button found, creating one...');
              setupGlobalSearchButton();
            }
          } else {
            console.log('No search input found');
            alert('No search input found. Check console for details.');
          }
        };
        document.body.appendChild(debugButton);
        
        // Add template processing button if on template page
        if (window.location.pathname.includes('/tools/token-template')) {
          const templateButton = document.createElement('button');
          templateButton.style.cssText = `
            position: fixed !important;
            top: 50px !important;
            right: 10px !important;
            background: #3b82f6 !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 4px 8px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            z-index: 100000 !important;
          `;
          templateButton.textContent = 'Process Template';
          templateButton.onclick = () => {
            console.log('Manual template processing triggered');
            processTokenTemplate();
          };
          document.body.appendChild(templateButton);
        }
        
        // Check if we're on the token lookup page with URL parameters
        if (window.location.pathname.includes('/tools/token-lookup')) {
          const urlParams = new URLSearchParams(window.location.search);
          const query = urlParams.get('query');
          
          console.log('On token lookup page, URL params:', window.location.search);
          console.log('All URL parameters:', Object.fromEntries(urlParams.entries()));
          
          if (query) {
            console.log('Found query parameter:', query);
            handleTokenLookupResults(urlParams);
          } else {
            // Check if there are any token parameters without a query
            const hasTokenParams = Array.from(urlParams.keys()).some(key => key !== 'query');
            if (hasTokenParams) {
              console.log('Found token parameters without query, creating query from URL');
              // Create a query from the first token symbol
              const firstToken = Array.from(urlParams.keys()).find(key => key !== 'query');
              if (firstToken) {
                urlParams.set('query', firstToken);
                handleTokenLookupResults(urlParams);
              }
            }
          }
        }
        
        // Check if we're on the token template page
        if (window.location.pathname.includes('/tools/token-template')) {
          console.log('On token template page, processing template...');
          processTokenTemplate();
          
          // Also try processing after a short delay to ensure DOM is fully loaded
          setTimeout(() => {
            console.log('Delayed template processing...');
            processTokenTemplate();
          }, 500);
          
          // And try again after a longer delay
          setTimeout(() => {
            console.log('Final delayed template processing...');
            processTokenTemplate();
          }, 2000);
        }
        
        // Mount page-specific widgets
        const containers = document.querySelectorAll('#dp-token-lookup');
        console.log('Found', containers.length, 'lookup containers');
        containers.forEach(mountLookup);
        
        // Setup global search button
        setupGlobalSearchButton();
        
        console.log('DexPaprika search functionality initialized successfully');
      } catch (err) {
        console.error('Error during initialization:', err);
      }
    }

    function handleTokenLookupResults(urlParams) {
      try {
        console.log('Handling token lookup results with params:', urlParams);
        
        const resultsContainer = document.getElementById('dp-token-results');
        const searchQueryElement = document.getElementById('dp-search-query');
        const tableBody = document.getElementById('dp-results-table-body');
        const noResultsElement = document.getElementById('dp-no-results');
        
        if (!resultsContainer || !tableBody) {
          console.error('Required elements not found');
          return;
        }
        
        // Show loading state
        resultsContainer.style.display = 'block';
        tableBody.innerHTML = '<tr><td colspan="6" class="dp-loading">Loading token data...</td></tr>';
        
        // Get search query
        const query = urlParams.get('query') || '';
        if (searchQueryElement) {
          searchQueryElement.textContent = query ? `Results for "${query}"` : 'All available tokens';
        }
        
        // Parse tokens from URL parameters
        const tokens = [];
        
        // Check if we have individual token parameters (single result)
        const symbol = urlParams.get('symbol');
        if (symbol) {
          tokens.push({
            symbol: symbol,
            name: urlParams.get('name') || symbol,
            chain: urlParams.get('chain') || 'ethereum',
            address: urlParams.get('address') || ''
          });
        } else {
          // Check for multiple tokens in format TOKEN=chain:address
          for (const [key, value] of urlParams.entries()) {
            if (key !== 'query' && value.includes(':')) {
              const [chain, address] = value.split(':');
              tokens.push({
                symbol: key,
                name: key, // We'll try to get the full name from our data
                chain: chain,
                address: address
              });
            }
          }
        }
        
        console.log('Parsed tokens:', tokens);
        
        if (tokens.length === 0) {
          // No tokens found, show no results
          tableBody.innerHTML = '';
          noResultsElement.style.display = 'block';
          return;
        }
        
        // Hide no results
        noResultsElement.style.display = 'none';
        
        // Fetch real-time data for all tokens
        Promise.all(tokens.map(async (token) => {
          try {
            const priceData = await fetchTokenPrice(token);
            return {
              ...token,
              priceData: priceData
            };
          } catch (err) {
            console.error(`Error fetching data for ${token.symbol}:`, err);
            return {
              ...token,
              priceData: null
            };
          }
        })).then(tokensWithData => {
          // Populate table
          tableBody.innerHTML = tokensWithData.map(token => {
            const price = token.priceData?.price_usd || 'N/A';
            const volume = token.priceData?.volume_usd_24h || 'N/A';
            
            return `
              <tr>
                <td>
                  <span class="dp-token-symbol">${token.symbol}</span>
                </td>
                <td>${token.name}</td>
                <td>
                  <span class="dp-token-chain ${token.chain}">${token.chain}</span>
                </td>
                <td>
                  <span class="dp-token-price">$${price}</span>
                </td>
                <td>
                  <span class="dp-token-volume">$${volume}</span>
                </td>
                <td>
                  <div class="dp-token-actions">
                    <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" 
                       class="dp-action-btn" target="_self">Price</a>
                    <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" 
                       class="dp-action-btn" target="_self">Pools</a>
                    <a href="/api-reference/pools/get-ohlcv-data-for-a-pool-pair?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" 
                       class="dp-action-btn" target="_self">OHLCV</a>
                    <a href="/get-started/sdk-ts?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" 
                       class="dp-action-btn" target="_self">SDK</a>
                  </div>
                </td>
              </tr>
            `;
          }).join('');
          
          console.log('Table populated with', tokensWithData.length, 'tokens');
          
          // Show success notification
          showNotification(`✅ Found ${tokensWithData.length} token(s)`, 'success');
        });
        
      } catch (err) {
        console.error('Error handling token lookup results:', err);
        showNotification('❌ Error loading token data', 'error');
      }
    }

    // Global function for generating token pages
    window.generateTokenPage = async function(symbol, chain, address) {
      const token = { symbol, chain, address };
      await displayTokenDataOnPage(token);
    };

    function processTokenTemplate() {
      try {
        console.log('=== PROCESSING TOKEN TEMPLATE ===');
        const urlParams = new URLSearchParams(window.location.search);
        
        // Get token data from URL parameters
        const tokenData = {
          symbol: urlParams.get('symbol') || 'TOKEN',
          name: urlParams.get('name') || 'Token',
          chain: urlParams.get('chain') || 'ethereum',
          address: urlParams.get('address') || '0x...',
          price: urlParams.get('price') || 'N/A',
          volume: urlParams.get('volume') || 'N/A',
          marketCap: urlParams.get('marketCap') || 'N/A',
          query: urlParams.get('query') || ''
        };
        
        console.log('Token data from URL:', tokenData);
        console.log('Current document title:', document.title);
        console.log('Current document body:', document.body.innerHTML.substring(0, 500));
        
        // Replace placeholders in the entire document
        const replacements = {
          '{{TOKEN_SYMBOL}}': tokenData.symbol,
          '{{TOKEN_NAME}}': tokenData.name,
          '{{TOKEN_CHAIN}}': tokenData.chain,
          '{{TOKEN_ADDRESS}}': tokenData.address,
          '{{TOKEN_PRICE}}': tokenData.price,
          '{{TOKEN_VOLUME}}': tokenData.volume,
          '{{TOKEN_MARKET_CAP}}': tokenData.marketCap,
          '{{GENERATED_DATE}}': new Date().toLocaleString()
        };
        
        console.log('Replacements to apply:', replacements);
        
        // Replace in document title
        const originalTitle = document.title;
        document.title = document.title.replace(/{{TOKEN_SYMBOL}}/g, tokenData.symbol)
                                      .replace(/{{TOKEN_NAME}}/g, tokenData.name);
        console.log('Title updated:', originalTitle, '->', document.title);
        
        // Replace in all text content using a more direct approach
        const allElements = document.querySelectorAll('*');
        console.log('Found', allElements.length, 'elements to process');
        
        allElements.forEach(element => {
          if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
            // Element contains only text
            let text = element.textContent;
            let originalText = text;
            
            Object.entries(replacements).forEach(([placeholder, value]) => {
              text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            });
            
            if (text !== originalText) {
              console.log('Replaced text in element:', originalText, '->', text);
              element.textContent = text;
            }
          }
        });
        
        // Also replace in innerHTML for elements that might have mixed content
        const htmlElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, a, code, pre');
        htmlElements.forEach(element => {
          let html = element.innerHTML;
          let originalHtml = html;
          
          Object.entries(replacements).forEach(([placeholder, value]) => {
            html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
          });
          
          if (html !== originalHtml) {
            console.log('Replaced HTML in element:', element.tagName, originalHtml, '->', html);
            element.innerHTML = html;
          }
        });
        
        // Replace in HTML attributes (href, etc.)
        const elementsWithHref = document.querySelectorAll('a[href*="{{"], a[href*="}}"]');
        console.log('Found', elementsWithHref.length, 'elements with href placeholders');
        
        elementsWithHref.forEach(element => {
          let href = element.getAttribute('href');
          if (href) {
            let originalHref = href;
            Object.entries(replacements).forEach(([placeholder, value]) => {
              href = href.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            });
            if (href !== originalHref) {
              console.log('Updated href:', originalHref, '->', href);
              element.setAttribute('href', href);
            }
          }
        });
        
        // Update page metadata
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          let description = metaDescription.getAttribute('content');
          let originalDescription = description;
          Object.entries(replacements).forEach(([placeholder, value]) => {
            description = description.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
          });
          if (description !== originalDescription) {
            console.log('Updated meta description:', originalDescription, '->', description);
            metaDescription.setAttribute('content', description);
          }
        }
        
        console.log('Template processing completed');
        console.log('Final document body preview:', document.body.innerHTML.substring(0, 1000));
        
        // Show a subtle notification
        showNotification(`✅ ${tokenData.symbol} data loaded successfully!`, 'success');
        
      } catch (err) {
        console.error('Error processing token template:', err);
        showNotification('❌ Error loading token data: ' + err.message, 'error');
      }
    }

    // Notification function for subtle feedback
    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        padding: 12px 16px !important;
        border-radius: 6px !important;
        color: white !important;
        font-size: 14px !important;
        z-index: 100000 !important;
        max-width: 300px !important;
        word-wrap: break-word !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        transition: all 0.3s ease !important;
        ${type === 'error' ? 'background: #ef4444 !important;' : 'background: #16A34A !important;'}
      `;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }

    async function displayTokenDataOnPage(token) {
      try {
        // Show loading notification
        showNotification('Loading token data...', 'info');
        
        // Fetch real-time price data
        const priceData = await fetchTokenPrice(token);
        
        // Generate the MDX content
        const mdxContent = generateTokenPage(token, priceData);
        
        // Create a modal overlay to display the token data
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0,0,0,0.8) !important;
          z-index: 99999 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px !important;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
          background: white !important;
          border-radius: 8px !important;
          padding: 24px !important;
          max-width: 800px !important;
          max-height: 80vh !important;
          overflow-y: auto !important;
          position: relative !important;
        `;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
          position: absolute !important;
          top: 10px !important;
          right: 15px !important;
          background: none !important;
          border: none !important;
          font-size: 24px !important;
          cursor: pointer !important;
          color: #666 !important;
        `;
        closeButton.onclick = () => {
          document.body.removeChild(modal);
        };
        
        // Parse and display the MDX content
        const content = parseMDXContent(mdxContent);
        modalContent.innerHTML = content;
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Show success notification
        showNotification(`