(() => {
  console.log('DexPaprika search script loading...');
  
  try {
    const CSS = `
      .dp-token-button {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: #16A34A;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        z-index: 1000;
        display: none;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
      .dp-token-button:hover {
        background: #15803D;
        transform: translateY(-50%) scale(1.05);
      }
      .dp-token-button.show {
        display: block;
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
    function setupGlobalSearchButton() {
      console.log('Setting up global search button...');
      
      function findSearchInput() {
        const selectors = [
          'input[placeholder*="search" i]',
          'input[placeholder*="Search" i]',
          'input[type="search"]',
          '.search input',
          '[data-testid="search-input"]',
          'input[aria-label*="search" i]',
          'input[placeholder*="eth" i]',
          '.search-overlay input',
          '[role="search"] input',
          '.search-overlay input[type="text"]',
          '.search-overlay input[placeholder]',
          'input[placeholder]'
        ];
        
        for (const selector of selectors) {
          const inputs = document.querySelectorAll(selector);
          for (const input of inputs) {
            if (input && input.offsetParent !== null && input.offsetWidth > 0) {
              console.log('Found search input with selector:', selector);
              return input;
            }
          }
        }
        return null;
      }

      function createTokenButton() {
        const button = document.createElement('button');
        button.className = 'dp-token-button';
        button.textContent = 'Looking for token data?';
        button.style.display = 'none';
        
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
          
          // If multiple results, let user choose
          if (results.length > 1) {
            const tokenNames = results.map(t => `${t.symbol} (${t.name})`).join('\n');
            const choice = prompt(`Multiple tokens found for "${query}". Choose one:\n\n${tokenNames}\n\nEnter the symbol (e.g., SOL):`);
            if (!choice) return;
            
            const selectedToken = results.find(t => t.symbol.toLowerCase() === choice.toLowerCase());
            if (!selectedToken) {
              alert('Invalid selection');
              return;
            }
            
            await generateAndDownloadTokenPage(selectedToken);
          } else {
            await generateAndDownloadTokenPage(results[0]);
          }
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
        if (!searchInput) return;

        // Check if button already exists
        let button = document.querySelector('.dp-token-button');
        if (!button) {
          button = createTokenButton();
          document.body.appendChild(button);
        }

        // Position the button
        const rect = searchInput.getBoundingClientRect();
        button.style.left = `${rect.right - 200}px`;
        button.style.top = `${rect.top + (rect.height - 30) / 2}px`;

        let lastValue = '';
        const checkInput = () => {
          const currentValue = searchInput.value.trim();
          if (currentValue !== lastValue) {
            lastValue = currentValue;
            console.log('Search input value changed to:', currentValue);
            
            if (currentValue.length >= 2) {
              button.classList.add('show');
            } else {
              button.classList.remove('show');
            }
          }
        };

        // Listen for input events
        searchInput.addEventListener('input', checkInput);
        searchInput.addEventListener('focus', checkInput);
        searchInput.addEventListener('keyup', checkInput);
      }

      // Try to find search input immediately and also watch for it
      watchSearchInput();
      
      // Also watch for dynamic changes
      const observer = new MutationObserver(() => {
        watchSearchInput();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    function init() {
      console.log('Initializing DexPaprika search functionality...');
      
      try {
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
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (err) {
    console.error('Fatal error in DexPaprika search script:', err);
  }
})();
