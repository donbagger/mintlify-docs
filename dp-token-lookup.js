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
          
          // Search for tokens
          const results = await searchTokens(query);
          if (results.length === 0) {
            alert('No tokens found for "' + query + '"');
            return;
          }
          
          // If single result, go directly to that token
          if (results.length === 1) {
            const token = results[0];
            console.log('Single token found, navigating to:', token);
            await generateAndDownloadTokenPage(token);
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

      async function generateAndDownloadTokenPage(token) {
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
          
          // Create a blob and download it
          const blob = new Blob([mdxContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${token.symbol.toLowerCase()}-token-data.mdx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Show success message
          alert(`✅ Token data for ${token.symbol} has been downloaded!\n\nYou can now add this MDX file to your Mintlify docs.`);
          
        } catch (err) {
          console.error('Error generating token page:', err);
          alert('❌ Failed to generate token data. Please try again.');
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

    async function handleTokenLookupResults(urlParams) {
      try {
        console.log('handleTokenLookupResults called with:', urlParams);
        
        const query = urlParams.get('query');
        const resultsContainer = document.getElementById('dp-token-results');
        const resultsList = document.getElementById('dp-results-list');
        const lookupContainer = document.getElementById('dp-token-lookup');
        
        console.log('Found elements:', {
          resultsContainer: !!resultsContainer,
          resultsList: !!resultsList,
          lookupContainer: !!lookupContainer
        });
        
        if (!resultsContainer || !resultsList) {
          console.error('Required elements not found');
          return;
        }
        
        // Hide the lookup widget and show results
        if (lookupContainer) {
          lookupContainer.style.display = 'none';
          console.log('Hidden lookup container');
        }
        resultsContainer.style.display = 'block';
        console.log('Showed results container');
        
        // Parse token parameters
        const tokens = [];
        console.log('Parsing URL parameters...');
        
        for (const [key, value] of urlParams.entries()) {
          console.log('Parameter:', key, '=', value);
          if (key !== 'query' && value.includes(':')) {
            const [chain, address] = value.split(':');
            const token = {
              symbol: key.toUpperCase(),
              chain: decodeURIComponent(chain),
              address: decodeURIComponent(address)
            };
            tokens.push(token);
            console.log('Parsed token:', token);
          }
        }
        
        console.log('Total tokens found:', tokens.length);
        
        if (tokens.length === 0) {
          console.log('No tokens found, showing error message');
          resultsList.innerHTML = '<p>No tokens found.</p>';
          return;
        }
        
        // Fetch data for each token
        resultsList.innerHTML = '<div class="dp-loading">Loading token data...</div>';
        console.log('Started loading token data...');
        
        const tokenCards = [];
        for (const token of tokens) {
          try {
            console.log('Fetching data for token:', token);
            const priceData = await fetchTokenPrice(token);
            const price = priceData?.price_usd || 'N/A';
            const volume24h = priceData?.volume_usd_24h || 'N/A';
            
            console.log('Token data received:', { price, volume24h });
            
            tokenCards.push(`
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 8px 0; background: white;">
                <h4 style="margin: 0 0 8px 0;">${token.symbol} - ${token.chain}</h4>
                <p style="margin: 4px 0; color: #6b7280;">Price: $${price}</p>
                <p style="margin: 4px 0; color: #6b7280;">24h Volume: $${volume24h}</p>
                <div style="margin-top: 12px;">
                  <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" style="margin-right: 8px; padding: 4px 8px; background: #16A34A; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">Price Data</a>
                  <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.address)}" style="margin-right: 8px; padding: 4px 8px; background: #16A34A; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">Top Pools</a>
                  <button onclick="generateTokenPage('${token.symbol}', '${token.chain}', '${token.address}')" style="padding: 4px 8px; background: #16A34A; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Download MDX</button>
                </div>
              </div>
            `);
          } catch (err) {
            console.error('Error fetching data for token:', token, err);
            tokenCards.push(`
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 8px 0; background: white;">
                <h4 style="margin: 0 0 8px 0;">${token.symbol} - ${token.chain}</h4>
                <p style="margin: 4px 0; color: #ef4444;">Error loading data</p>
              </div>
            `);
          }
        }
        
        const finalHTML = `
          <h3>Search Results for "${query}"</h3>
          ${tokenCards.join('')}
        `;
        
        console.log('Setting results HTML:', finalHTML);
        resultsList.innerHTML = finalHTML;
        console.log('Results displayed successfully');
        
      } catch (err) {
        console.error('Error handling token lookup results:', err);
        const resultsList = document.getElementById('dp-results-list');
        if (resultsList) {
          resultsList.innerHTML = `<p style="color: #ef4444;">Error loading results: ${err.message}</p>`;
        }
      }
    }

    // Global function for generating token pages
    window.generateTokenPage = async function(symbol, chain, address) {
      const token = { symbol, chain, address };
      await generateAndDownloadTokenPage(token);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (err) {
    console.error('Fatal error in DexPaprika search script:', err);
  }
  
  // Also check for URL parameters after a short delay to ensure DOM is ready
  if (window.location.pathname.includes('/tools/token-lookup') && window.location.search) {
    setTimeout(() => {
      console.log('Delayed URL parameter check...');
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('query');
      
      if (query || Array.from(urlParams.keys()).some(key => key !== 'query')) {
        console.log('Processing URL parameters in delayed check');
        handleTokenLookupResults(urlParams);
      }
    }, 1000);
  }
})();
