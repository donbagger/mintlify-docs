(() => {
  console.log('DexPaprika search script loading...');
  
  // Add error handling for the entire script
  try {
    const CSS = `
      .dp-lookup{position:relative;max-width:640px;margin:16px 0}
      .dp-lookup input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px}
      .dp-suggestions{position:absolute;z-index:40;left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;max-height:300px;overflow-y:auto}
      .dp-suggestions button{display:flex;gap:8px;width:100%;padding:10px 12px;border:0;background:#fff;cursor:pointer;text-align:left;font-size:14px}
      .dp-suggestions button:hover{background:#f9fafb}
      .dp-suggestions button:last-child{border-bottom:none}
      .dp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
      .dp-actions a,.dp-actions button{padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;text-decoration:none;font-size:12px}
      .dp-actions a:hover,.dp-actions button:hover{background:#f9fafb}
      .dp-global-popover{position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);max-width:400px;padding:12px;font-size:14px}
      .dp-global-popover .dp-actions{margin-top:8px}
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

    function buildActions(token) {
      console.log('Building actions for token:', token);
      const links = [
        { label: 'Price now', href: '/api-reference/tokens/get-a-tokens-latest-data-on-a-network' },
        { label: 'Top pools', href: '/api-reference/tokens/get-top-x-pools-for-a-token' },
        { label: 'OHLCV', href: '/api-reference/pools/get-ohlcv-data-for-a-pool-pair' },
        { label: 'SDK (TS)', href: '/get-started/sdk-ts' }
      ];
      const wrap = document.createElement('div');
      wrap.className = 'dp-actions';
      for (const l of links) {
        const a = document.createElement('a');
        a.href = `${l.href}?symbol=${encodeURIComponent(token.symbol||'')}&chain=${encodeURIComponent(token.chain||'')}&address=${encodeURIComponent(token.address||'')}`;
        a.textContent = l.label;
        a.target = '_self';
        wrap.appendChild(a);
      }
      const btn = document.createElement('button');
      btn.textContent = 'Copy cURL (price)';
      btn.onclick = () => {
        const base = 'https://api.dexpaprika.com';
        const curl = token.address
          ? `curl "${base}/networks/${token.chain}/tokens/${token.address}"`
          : `curl "${base}/networks/${token.chain}/tokens/by-symbol/${token.symbol}"`;
        navigator.clipboard?.writeText(curl);
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy cURL (price)'), 1000);
      };
      wrap.appendChild(btn);
      return wrap;
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
            btn.onclick = () => {
              console.log('Token selected:', t);
              sugg.style.display = 'none';
              root.querySelectorAll('.dp-actions').forEach(n => n.remove());
              root.appendChild(buildActions(t));
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

    // Global search interception
    function setupGlobalSearch() {
      console.log('Setting up global search interception...');
      let globalPopover = null;
      let lastQuery = '';

      // Find Mintlify's search input (it might be in different places)
      function findSearchInput() {
        // Try common selectors for Mintlify search
        const selectors = [
          'input[placeholder*="search" i]',
          'input[placeholder*="Search" i]',
          'input[type="search"]',
          '.search input',
          '[data-testid="search-input"]',
          'input[aria-label*="search" i]',
          'input[placeholder*="eth" i]', // Based on the image showing "eth"
          '.search-overlay input',
          '[role="search"] input',
          // More specific selectors for Mintlify
          '.search-overlay input[type="text"]',
          '.search-overlay input[placeholder]',
          'input[placeholder*="Search" i]',
          'input[placeholder*="search" i]',
          // Try to find any input that might be a search
          'input[placeholder]'
        ];
        
        for (const selector of selectors) {
          const inputs = document.querySelectorAll(selector);
          for (const input of inputs) {
            if (input && input.offsetParent !== null && input.offsetWidth > 0) { // visible
              console.log('Found search input with selector:', selector, 'value:', input.value);
              return input;
            }
          }
        }
        console.log('No search input found');
        return null;
      }

      function showGlobalPopover(query, inputElement) {
        console.log('Showing global popover for query:', query);
        if (globalPopover) {
          globalPopover.remove();
        }

        // Check if query looks like a ticker (2+ chars, alphanumeric)
        if (query.length < 2 || !/^[a-zA-Z0-9]+$/.test(query)) {
          console.log('Query does not match ticker pattern:', query);
          return;
        }

        // Show loading state
        globalPopover = document.createElement('div');
        globalPopover.className = 'dp-global-popover';
        globalPopover.innerHTML = '<div class="dp-loading">Searching tokens...</div>';
        
        // Position the popover near the search input
        const rect = inputElement.getBoundingClientRect();
        globalPopover.style.left = `${rect.left}px`;
        globalPopover.style.top = `${rect.bottom + 8}px`;
        document.body.appendChild(globalPopover);

        searchTokens(query).then(results => {
          if (!globalPopover) return; // Was removed while loading
          
          if (results.length === 0) {
            globalPopover.innerHTML = '<div class="dp-no-results">No tokens found</div>';
            setTimeout(() => {
              if (globalPopover && globalPopover.innerHTML.includes('No tokens found')) {
                globalPopover.remove();
                globalPopover = null;
              }
            }, 2000);
            return;
          }

          globalPopover.innerHTML = '';
          
          const title = document.createElement('div');
          title.innerHTML = `<strong>Token suggestions for "${query}"</strong>`;
          title.style.marginBottom = '8px';
          globalPopover.appendChild(title);

          results.forEach(t => {
            const btn = document.createElement('button');
            btn.innerHTML = `<strong>${t.symbol}</strong> — ${t.name} · ${t.chain}`;
            btn.style.cssText = 'display:block;width:100%;padding:8px;border:0;background:#fff;cursor:pointer;text-align:left;border-bottom:1px solid #f3f4f6;font-size:14px';
            btn.onclick = () => {
              console.log('Global token selected:', t);
              globalPopover.remove();
              globalPopover = null;
              // Navigate to the token lookup page with the selected token
              window.location.href = `/tools/token-lookup?symbol=${encodeURIComponent(t.symbol)}&chain=${encodeURIComponent(t.chain)}&address=${encodeURIComponent(t.address||'')}`;
            };
            globalPopover.appendChild(btn);
          });

          const actions = buildActions(results[0]);
          actions.style.marginTop = '8px';
          globalPopover.appendChild(actions);
        }).catch(err => {
          console.error('Global search error:', err);
          if (globalPopover) {
            globalPopover.innerHTML = '<div class="dp-error">Failed to load tokens</div>';
            setTimeout(() => {
              if (globalPopover && globalPopover.innerHTML.includes('Failed to load tokens')) {
                globalPopover.remove();
                globalPopover = null;
              }
            }, 2000);
          }
        });
      }

      function hideGlobalPopover() {
        if (globalPopover) {
          globalPopover.remove();
          globalPopover = null;
        }
      }

      // Watch for search input changes
      function watchSearchInput() {
        const searchInput = findSearchInput();
        if (!searchInput) return;

        console.log('Watching search input for changes');
        let lastValue = '';
        const checkInput = () => {
          const currentValue = searchInput.value.trim();
          if (currentValue !== lastValue) {
            lastValue = currentValue;
            console.log('Search input value changed to:', currentValue);
            if (currentValue.length >= 2) {
              showGlobalPopover(currentValue, searchInput);
            } else {
              hideGlobalPopover();
            }
          }
        };

        // Listen for input events
        searchInput.addEventListener('input', checkInput);
        searchInput.addEventListener('focus', checkInput);
        searchInput.addEventListener('keyup', checkInput);
        
        // Hide popover when clicking outside
        document.addEventListener('click', (e) => {
          if (!globalPopover?.contains(e.target) && !searchInput.contains(e.target)) {
            hideGlobalPopover();
          }
        });

        // Hide on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            hideGlobalPopover();
          }
        });
      }

      // Try to find search input immediately and also watch for it
      watchSearchInput();
      
      // Also watch for dynamic changes (Mintlify might load search later)
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
        
        // Setup global search interception
        setupGlobalSearch();
        
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
