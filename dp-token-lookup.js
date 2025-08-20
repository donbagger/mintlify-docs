(function() {
  'use strict';
  
  console.log('DexPaprika search script loading...');
  
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
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
    }
    
    .dp-token-button.show {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .dp-token-button:hover {
      background: #15803D !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 12px rgba(0,0,0,0.3) !important;
    }
    
    .dp-debug-button {
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      background: #dc2626 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      z-index: 100000 !important;
    }
    
    .dp-tokens-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-top: 20px !important;
      background: white !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }
    
    .dp-tokens-table th {
      background: #f8fafc !important;
      padding: 12px 16px !important;
      text-align: left !important;
      font-weight: 600 !important;
      color: #374151 !important;
      border-bottom: 1px solid #e5e7eb !important;
    }
    
    .dp-tokens-table td {
      padding: 12px 16px !important;
      border-bottom: 1px solid #f3f4f6 !important;
      vertical-align: middle !important;
    }
    
    .dp-tokens-table tr:hover {
      background: #f9fafb !important;
    }
    
    .dp-token-symbol {
      font-weight: 600 !important;
      color: #16A34A !important;
    }
    
    .dp-chain-badge {
      padding: 4px 8px !important;
      border-radius: 12px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      text-transform: uppercase !important;
    }
    
    .dp-chain-ethereum {
      background: #6366f1 !important;
      color: white !important;
    }
    
    .dp-chain-solana {
      background: #06b6d4 !important;
      color: white !important;
    }
    
    .dp-actions {
      display: flex !important;
      gap: 8px !important;
      flex-wrap: wrap !important;
    }
    
    .dp-actions a {
      padding: 6px 12px !important;
      background: #16A34A !important;
      color: white !important;
      text-decoration: none !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      transition: background 0.2s !important;
    }
    
    .dp-actions a:hover {
      background: #15803D !important;
    }
    
    .dp-loading {
      text-align: center !important;
      color: #6b7280 !important;
      font-style: italic !important;
    }
    
    .dp-no-results {
      text-align: center !important;
      color: #6b7280 !important;
      padding: 40px 20px !important;
    }
    
    .dp-results-header {
      margin-bottom: 20px !important;
    }
    
    .dp-results-header h3 {
      margin: 0 0 8px 0 !important;
      color: #111827 !important;
    }
    
    .dp-results-header p {
      margin: 0 !important;
      color: #6b7280 !important;
      font-size: 14px !important;
    }
  `;
  document.head.appendChild(style);
  console.log('CSS styles added successfully');
  
  // Token data
  const tokenData = [
    {"symbol":"SOL","name":"Solana","chain":"solana","address":"So11111111111111111111111111111111111111112"},
    {"symbol":"USDC","name":"USD Coin (Ethereum)","chain":"ethereum","address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},
    {"symbol":"USDC","name":"USD Coin (Solana)","chain":"solana","address":"Es9vMFrzaCER2kJ8U1L8vMcbA5sX6Phn7ZdZ2m5W861"},
    {"symbol":"WETH","name":"Wrapped Ether","chain":"ethereum","address":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"},
    {"symbol":"WBTC","name":"Wrapped Bitcoin","chain":"ethereum","address":"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"},
    {"symbol":"BONK","name":"Bonk","chain":"solana","address":"DezXAZ8z7P5M5VKsTR5VYg5t6sQf5CqZ3k8sEzsZsP1"}
  ];
  
  // Search tokens function
  function searchTokens(query) {
    if (!query || query.length < 1) return [];
    
    const lowerQuery = query.toLowerCase();
    return tokenData.filter(token => 
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Fetch token price
  async function fetchTokenPrice(token) {
    try {
      const response = await fetch(`https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}`);
      if (!response.ok) throw new Error('Failed to fetch price');
      return await response.json();
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: ${type === 'success' ? '#16A34A' : type === 'error' ? '#dc2626' : '#3b82f6'} !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      z-index: 100001 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  // Handle token lookup results
  function handleTokenLookupResults(urlParams) {
    try {
      console.log('=== HANDLING TOKEN LOOKUP RESULTS ===');
      console.log('URL params object:', urlParams);
      
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
      
      // Parse tokens from URL
      const tokens = [];
      const query = urlParams.get('query') || '';
      
      for (const [key, value] of urlParams.entries()) {
        if (key !== 'query' && value.includes(':')) {
          const [chain, address] = value.split(':');
          const token = tokenData.find(t => t.chain === chain && t.address === address);
          if (token) {
            tokens.push(token);
          }
        }
      }
      
      console.log('Parsed tokens:', tokens);
      
      if (tokens.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="dp-no-results">No tokens found</td></tr>';
        if (searchQueryElement) {
          searchQueryElement.textContent = `No results found for "${query}"`;
        }
        return;
      }
      
      // Update search query display
      if (searchQueryElement) {
        searchQueryElement.textContent = `Found ${tokens.length} token(s) for "${query}"`;
      }
      
      // Fetch prices and populate table
      Promise.all(tokens.map(async (token) => {
        const priceData = await fetchTokenPrice(token);
        return { token, priceData };
      })).then(results => {
        tableBody.innerHTML = '';
        
        results.forEach(({ token, priceData }) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><span class="dp-token-symbol">${token.symbol}</span></td>
            <td>${token.name}</td>
            <td><span class="dp-chain-badge dp-chain-${token.chain}">${token.chain}</span></td>
            <td>$${priceData?.price_usd || 'N/A'}</td>
            <td>$${priceData?.volume_usd_24h || 'N/A'}</td>
            <td>
              <div class="dp-actions">
                <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Price</a>
                <a href="/api-reference/tokens/get-top-x-pools-for-a-token?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">Pools</a>
                <a href="/api-reference/pools/get-ohlcv-data-for-a-pool-pair?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">OHLCV</a>
                <a href="/get-started/sdk-ts?symbol=${token.symbol}&chain=${token.chain}&address=${token.address}" target="_self">SDK</a>
              </div>
            </td>
          `;
          tableBody.appendChild(row);
        });
        
        showNotification(`✅ Loaded ${results.length} token(s)`, 'success');
      }).catch(error => {
        console.error('Error loading token data:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="dp-no-results">Error loading token data</td></tr>';
        showNotification('❌ Error loading token data', 'error');
      });
      
    } catch (error) {
      console.error('Error handling token lookup results:', error);
      showNotification('❌ Error processing results', 'error');
    }
  }
  
  // Find search input
  function findSearchInput() {
    const selectors = [
      'input[placeholder*="search" i]',
      'input[type="search"]',
      '.search input',
      '[data-testid*="search"]',
      'input[aria-label*="search" i]'
    ];
    
    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input && input.offsetParent !== null) {
        return input;
      }
    }
    return null;
  }
  
  // Setup global search button
  function setupGlobalSearchButton() {
    console.log('Setting up global search button...');
    
    const searchInput = findSearchInput();
    if (!searchInput) {
      console.log('Search input not found, will retry...');
      return false;
    }
    
    console.log('Found search input with selector:', searchInput);
    
    // Create button
    const button = document.createElement('button');
    button.className = 'dp-token-button';
    button.textContent = 'Looking for token data?';
    document.body.appendChild(button);
    
    // Position button
    function positionButton() {
      const rect = searchInput.getBoundingClientRect();
      button.style.left = (rect.right + 10) + 'px';
      button.style.top = (rect.top - 2) + 'px';
    }
    
    // Show/hide button based on input
    function updateButtonVisibility() {
      const value = searchInput.value.trim();
      if (value.length >= 1) {
        const results = searchTokens(value);
        if (results.length > 0) {
          button.textContent = `Looking for "${value.toUpperCase()}" token data?`;
          button.classList.add('show');
          positionButton();
        } else {
          button.classList.remove('show');
        }
      } else {
        button.classList.remove('show');
      }
    }
    
    // Add event listeners
    searchInput.addEventListener('input', updateButtonVisibility);
    searchInput.addEventListener('focus', updateButtonVisibility);
    searchInput.addEventListener('blur', () => {
      setTimeout(() => button.classList.remove('show'), 200);
    });
    
    // Button click handler
    button.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      const results = searchTokens(query);
      
      if (results.length === 0) {
        showNotification('No tokens found for your search', 'error');
        return;
      }
      
      // Hide button immediately
      button.style.display = 'none';
      button.classList.remove('show');
      
      // Redirect to lookup page with token data
      const params = new URLSearchParams();
      params.set('query', query);
      
      results.forEach(token => {
        params.set(token.symbol, `${token.chain}:${token.address}`);
      });
      
      window.location.href = `/tools/token-lookup?${params.toString()}`;
    });
    
    console.log('Global search button setup complete');
    return true;
  }
  
  // Initialize
  function init() {
    console.log('Initializing DexPaprika search functionality...');
    
    // Setup lookup widget if on lookup page
    const lookupContainers = document.querySelectorAll('#dp-token-lookup');
    console.log('Found', lookupContainers.length, 'lookup containers');
    
    lookupContainers.forEach(container => {
      console.log('Mounting lookup widget in container:', container);
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Search for tokens...';
      input.style.cssText = `
        width: 100% !important;
        padding: 12px 16px !important;
        border: 2px solid #e5e7eb !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        margin-bottom: 20px !important;
      `;
      
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'dp-lookup-results';
      
      container.appendChild(input);
      container.appendChild(resultsDiv);
      
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const results = searchTokens(query);
        
        if (results.length === 0) {
          resultsDiv.innerHTML = '<p style="color: #6b7280; text-align: center;">No tokens found</p>';
          return;
        }
        
        const resultsList = results.map(token => `
          <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px;">
            <strong>${token.symbol}</strong> - ${token.name} (${token.chain})
          </div>
        `).join('');
        
        resultsDiv.innerHTML = resultsList;
      });
      
      console.log('Lookup widget mounted successfully');
    });
    
    // Setup global search button
    setupGlobalSearchButton();
    
    // Handle URL parameters for lookup results
    if (window.location.pathname.includes('/tools/token-lookup')) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('query')) {
        console.log('Found URL parameters, processing lookup results...');
        handleTokenLookupResults(urlParams);
      }
    }
    
    // Add debug button
    const debugButton = document.createElement('button');
    debugButton.className = 'dp-debug-button';
    debugButton.textContent = 'Debug Search';
    debugButton.onclick = () => {
      console.log('=== DEBUG INFO ===');
      console.log('Document ready state:', document.readyState);
      console.log('All inputs on page:', document.querySelectorAll('input').length);
      console.log('Search inputs found:', document.querySelectorAll('input[placeholder*="search" i], input[type="search"], .search input').length);
      
      const searchInput = findSearchInput();
      if (searchInput) {
        console.log('Search input found:', searchInput);
        console.log('Search input value:', searchInput.value);
        console.log('Search input visible:', searchInput.offsetParent !== null);
      } else {
        console.log('No search input found');
      }
      
      // Try to setup button
      if (setupGlobalSearchButton()) {
        showNotification('✅ Search button setup successful', 'success');
      } else {
        showNotification('❌ Search button setup failed', 'error');
      }
    };
    document.body.appendChild(debugButton);
    
    console.log('DexPaprika search functionality initialized successfully');
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})(); 
