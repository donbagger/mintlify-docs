(() => {
  console.log('DexPaprika search script loading...');
  
  try {
    // Add CSS styles
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
      .dp-results-header{margin-bottom:20px}
      .dp-results-header h3{margin:0 0 8px 0;color:#111827}
      .dp-results-header p{margin:0;color:#6b7280;font-size:14px}
      .dp-table-container{overflow-x:auto}
      .dp-tokens-table{width:100%;border-collapse:collapse;margin-top:16px}
      .dp-tokens-table th,.dp-tokens-table td{padding:12px;text-align:left;border-bottom:1px solid #e5e7eb}
      .dp-tokens-table th{background:#f9fafb;font-weight:600;color:#374151}
      .dp-tokens-table tr:hover{background:#f9fafb}
      .dp-tokens-table .dp-symbol{font-weight:600;color:#16A34A}
      .dp-tokens-table .dp-chain{display:inline-block;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500}
      .dp-tokens-table .dp-chain.ethereum{background:#e0e7ff;color:#3730a3}
      .dp-tokens-table .dp-chain.solana{background:#dcfce7;color:#166534}
      .dp-tokens-table .dp-price{font-weight:600;color:#059669}
      .dp-tokens-table .dp-volume{color:#6b7280}
      .dp-tokens-table .dp-actions-cell{white-space:nowrap}
      .dp-tokens-table .dp-actions-cell a{display:inline-block;margin:2px;padding:4px 8px;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:4px;font-size:12px}
      .dp-tokens-table .dp-actions-cell a:hover{background:#e5e7eb}
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
              console.log('Token data loaded successfully from', path);
              tokenCache = data;
              return data;
            }
          } catch (err) {
            console.log('Failed to load from', path, ':', err.message);
          }
        }
        
        // Fallback to hardcoded data if all paths fail
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

    function searchTokens(query, tokens) {
      if (!query || !tokens) return [];
      
      const lowerQuery = query.toLowerCase();
      return tokens.filter(token => 
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.name.toLowerCase().includes(lowerQuery)
      );
    }

    async function fetchTokenPrice(token) {
      try {
        const response = await fetch(`https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error('Error fetching token price:', err);
      }
      return null;
    }

    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'} !important;
        color: white !important;
        padding: 12px 16px !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        z-index: 100001 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        max-width: 300px !important;
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }

    function findSearchInput() {
      const selectors = [
        'input[placeholder*="search" i]',
        'input[type="search"]',
        '.search input',
        'input[placeholder*="Search" i]',
        'input[placeholder*="Type" i]',
        'input[placeholder*="Enter" i]'
      ];
      
      for (const selector of selectors) {
        const inputs = document.querySelectorAll(selector);
        for (const input of inputs) {
          if (input.offsetParent !== null && input.style.display !== 'none' && input.style.visibility !== 'hidden') {
            return input;
          }
        }
      }
      return null;
    }

    function setupGlobalSearchButton() {
      const searchInput = findSearchInput();
      if (!searchInput) {
        console.log('No search input found, will retry...');
        return false;
      }

      console.log('Found search input:', searchInput);

      // Check if button already exists
      if (document.querySelector('.dp-token-button')) {
        console.log('Button already exists');
        return true;
      }

      const button = document.createElement('button');
      button.className = 'dp-token-button';
      button.textContent = 'Looking for token data?';
      
      // Position the button next to the search input
      const rect = searchInput.getBoundingClientRect();
      button.style.top = (rect.top - 5) + 'px';
      button.style.left = (rect.right + 10) + 'px';
      
      document.body.appendChild(button);

      let debounceTimer;
      const debouncedShowButton = (query) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (query && query.length >= 2) {
            button.textContent = `Looking for "${query.toUpperCase()}" token data?`;
            button.style.display = 'block';
            button.classList.add('show');
          } else {
            button.style.display = 'none';
            button.classList.remove('show');
          }
        }, 300);
      };

      // Listen for input changes
      if (!searchInput.dataset.dpListenersAttached) {
        searchInput.addEventListener('input', (e) => {
          debouncedShowButton(e.target.value);
        });
        searchInput.dataset.dpListenersAttached = 'true';
      }

      // Button click handler
      button.addEventListener('click', async () => {
        try {
          button.style.display = 'none';
          button.classList.remove('show');
          
          const query = searchInput.value.trim();
          if (!query) {
            showNotification('Please enter a token symbol or name', 'error');
            return;
          }

          console.log('Searching for:', query);
          const tokens = await loadTokenData();
          const results = searchTokens(query, tokens);
          
          console.log('Search results:', results);

          if (results.length === 0) {
            showNotification('No tokens found matching your search', 'error');
            return;
          }

          // Always redirect to lookup page with results
          const params = new URLSearchParams();
          
          // Add each token as a parameter
          results.forEach((token, index) => {
            const key = token.symbol + (index > 0 ? `_${index}` : '');
            const value = `${token.chain}:${token.address}`;
            params.append(key, value);
          });
          
          // Add the original query
          params.append('query', query);

          window.location.href = `/tools/token-lookup?${params.toString()}`;
          
        } catch (err) {
          console.error('Error in button click handler:', err);
          showNotification('An error occurred while searching', 'error');
        }
      });

      console.log('Global search button setup completed');
      return true;
    }

    function handleTokenLookupResults(urlParams) {
      try {
        console.log('=== HANDLING TOKEN LOOKUP RESULTS ===');
        console.log('URL params object:', urlParams);
        console.log('URL search string:', window.location.search);
        
        const resultsContainer = document.getElementById('dp-token-results');
        const searchQueryElement = document.getElementById('dp-search-query');
        const tableBody = document.getElementById('dp-results-table-body');
        const noResultsElement = document.getElementById('dp-no-results');
        
        console.log('Found elements:', {
          resultsContainer: !!resultsContainer,
          searchQueryElement: !!searchQueryElement,
          tableBody: !!tableBody,
          noResultsElement: !!noResultsElement
        });
        
        if (!resultsContainer || !tableBody) {
          console.error('Required elements not found');
          return;
        }
        
        // Show loading state
        resultsContainer.style.display = 'block';
        tableBody.innerHTML = '<tr><td colspan="6" class="dp-loading">Loading token data...</td></tr>';
        
        // Parse tokens from URL parameters
        const tokens = [];
        const query = urlParams.get('query') || '';
        
        for (const [key, value] of urlParams.entries()) {
          if (key !== 'query' && value.includes(':')) {
            const [chain, address] = value.split(':');
            const symbol = key.replace(/_\d+$/, ''); // Remove _1, _2, etc.
            
            tokens.push({
              symbol: symbol,
              name: `${symbol} Token`,
              chain: chain,
              address: address
            });
          }
        }
        
        console.log('Parsed tokens:', tokens);
        
        if (tokens.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="6" class="dp-no-results">No tokens found</td></tr>';
          return;
        }
        
        // Update search query display
        if (searchQueryElement) {
          searchQueryElement.textContent = `Found ${tokens.length} token(s) for "${query}"`;
        }
        
        // Fetch real-time data for each token
        Promise.all(tokens.map(async (token) => {
          const priceData = await fetchTokenPrice(token);
          return { ...token, priceData };
        })).then(tokensWithData => {
          // Clear loading state
          tableBody.innerHTML = '';
          
          // Populate table
          tokensWithData.forEach(token => {
            const row = document.createElement('tr');
            
            const price = token.priceData?.price_usd || 'N/A';
            const volume = token.priceData?.volume_usd_24h || 'N/A';
            
            row.innerHTML = `
              <td class="dp-symbol">${token.symbol}</td>
              <td>${token.name}</td>
              <td><span class="dp-chain ${token.chain}">${token.chain}</span></td>
              <td class="dp-price">$${price}</td>
              <td class="dp-volume">$${volume}</td>
              <td class="dp-actions-cell">
                <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Price</a>
                <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Pools</a>
                <a href="/api-reference/pools/get-ohlcv-data-for-a-pool-pair?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">OHLCV</a>
                <a href="/get-started/sdk-ts?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">SDK</a>
              </td>
            `;
            
            tableBody.appendChild(row);
          });
          
          console.log('Table populated successfully');
          showNotification(`✅ Found ${tokensWithData.length} token(s)`, 'success');
          
        }).catch(err => {
          console.error('Error fetching token data:', err);
          tableBody.innerHTML = '<tr><td colspan="6" class="dp-error">Error loading token data</td></tr>';
        });
        
      } catch (err) {
        console.error('Error handling token lookup results:', err);
        showNotification('❌ Error processing search results', 'error');
      }
    }

    function setupLookupWidget(container) {
      console.log('Mounting lookup widget in container:', container);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Type a ticker or name to get quick actions: Price now, Top pools, OHLCV, SDK examples.';
      input.className = 'dp-lookup-input';
      
      const suggestions = document.createElement('div');
      suggestions.className = 'dp-suggestions';
      suggestions.style.display = 'none';
      
      const lookupDiv = document.createElement('div');
      lookupDiv.className = 'dp-lookup';
      lookupDiv.appendChild(input);
      lookupDiv.appendChild(suggestions);
      
      container.appendChild(lookupDiv);
      
      let debounceTimer;
      
      input.addEventListener('input', async (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const query = e.target.value.trim();
          
          if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
          }
          
          try {
            const tokens = await loadTokenData();
            const results = searchTokens(query, tokens);
            
            suggestions.innerHTML = '';
            
            if (results.length === 0) {
              suggestions.style.display = 'none';
              return;
            }
            
            results.forEach(token => {
              const button = document.createElement('button');
              button.innerHTML = `
                <span style="font-weight: 600; color: #16A34A;">${token.symbol}</span>
                <span>${token.name}</span>
                <span style="color: #6b7280; font-size: 12px;">${token.chain}</span>
              `;
              
              button.addEventListener('click', async () => {
                const priceData = await fetchTokenPrice(token);
                
                const actions = document.createElement('div');
                actions.className = 'dp-actions';
                actions.innerHTML = `
                  <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Get Latest Price</a>
                  <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Top Pools</a>
                  <a href="/api-reference/pools/get-ohlcv-data-for-a-pool-pair?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">OHLCV Data</a>
                  <a href="/get-started/sdk-ts?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">SDK Examples</a>
                `;
                
                suggestions.innerHTML = '';
                suggestions.appendChild(actions);
                suggestions.style.display = 'block';
              });
              
              suggestions.appendChild(button);
            });
            
            suggestions.style.display = 'block';
            
          } catch (err) {
            console.error('Error in lookup widget:', err);
          }
        }, 300);
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (!lookupDiv.contains(e.target)) {
          suggestions.style.display = 'none';
        }
      });
      
      console.log('Lookup widget mounted successfully');
    }

    function init() {
      console.log('Initializing DexPaprika search functionality...');
      
      // Setup lookup widgets
      const lookupContainers = document.querySelectorAll('#dp-token-lookup');
      console.log('Found', lookupContainers.length, 'lookup containers');
      
      lookupContainers.forEach(container => {
        setupLookupWidget(container);
      });
      
      // Setup global search button
      console.log('Setting up global search button...');
      
      let attempts = 0;
      const maxAttempts = 10;
      
      const trySetupButton = () => {
        if (attempts >= maxAttempts) {
          console.log('Max attempts reached for button setup');
          return;
        }
        
        attempts++;
        const success = setupGlobalSearchButton();
        
        if (!success) {
          setTimeout(trySetupButton, 1000);
        }
      };
      
      trySetupButton();
      
      // Add debug button
      const debugButton = document.createElement('button');
      debugButton.className = 'dp-debug-button';
      debugButton.textContent = 'Debug Search';
      debugButton.onclick = () => {
        console.log('=== DEBUG INFO ===');
        console.log('Document ready state:', document.readyState);
        console.log('All inputs on page:', document.querySelectorAll('input').length);
        console.log('Search inputs found:', document.querySelectorAll('input[placeholder*="search"], input[type="search"], .search input').length);
        
        const searchInput = findSearchInput();
        if (searchInput) {
          console.log('Search input found:', searchInput);
          console.log('Search input value:', searchInput.value);
          console.log('Search input visible:', searchInput.offsetParent !== null);
        } else {
          console.log('No search input found');
        }
        
        // Try to setup button manually
        setupGlobalSearchButton();
      };
      document.body.appendChild(debugButton);
      
      // Check if we're on the token lookup page with URL parameters
      if (window.location.pathname.includes('/tools/token-lookup')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');
        
        if (query || Array.from(urlParams.keys()).some(key => key !== 'query')) {
          console.log('Processing URL parameters on page load');
          handleTokenLookupResults(urlParams);
        }
      }
      
      console.log('DexPaprika search functionality initialized successfully');
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
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
    
  } catch (err) {
    console.error('Fatal error in DexPaprika search script:', err);
  }
})();