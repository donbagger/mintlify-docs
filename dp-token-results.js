(function() {
  'use strict';
  
  console.log('DexPaprika token results script loading...');
  
  // Add CSS styles for the results page
  const style = document.createElement('style');
  style.textContent = `
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
    
    .dp-debug-results {
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
    }
  `;
  document.head.appendChild(style);
  console.log('Token results CSS styles added');
  
  // Token data
  const tokenData = [
    {"symbol":"SOL","name":"Solana","chain":"solana","address":"So11111111111111111111111111111111111111112"},
    {"symbol":"USDC","name":"USD Coin (Ethereum)","chain":"ethereum","address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},
    {"symbol":"USDC","name":"USD Coin (Solana)","chain":"solana","address":"Es9vMFrzaCER2kJ8U1L8vMcbA5sX6Phn7ZdZ2m5W861"},
    {"symbol":"WETH","name":"Wrapped Ether","chain":"ethereum","address":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"},
    {"symbol":"WBTC","name":"Wrapped Bitcoin","chain":"ethereum","address":"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"},
    {"symbol":"BONK","name":"Bonk","chain":"solana","address":"DezXAZ8z7P5M5VKsTR5VYg5t6sQf5CqZ3k8sEzsZsP1"}
  ];
  
  // Fetch token price
  async function fetchTokenPrice(token) {
    try {
      console.log(`Fetching price for ${token.symbol} on ${token.chain}...`);
      const response = await fetch(`https://api.dexpaprika.com/networks/${token.chain}/tokens/${token.address}`);
      if (!response.ok) throw new Error('Failed to fetch price');
      const data = await response.json();
      console.log(`Price data for ${token.symbol}:`, data);
      return data;
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
        showNotification('❌ Required page elements not found', 'error');
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
        showNotification('❌ No tokens found in URL parameters', 'error');
        return;
      }
      
      // Update search query display
      if (searchQueryElement) {
        searchQueryElement.textContent = `Found ${tokens.length} token(s) for "${query}"`;
      }
      
      // Fetch prices and populate table
      console.log('Fetching prices for', tokens.length, 'tokens...');
      Promise.all(tokens.map(async (token) => {
        const priceData = await fetchTokenPrice(token);
        return { token, priceData };
      })).then(results => {
        console.log('All price data fetched:', results);
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
        console.log('Table populated successfully');
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
  
  // Initialize
  function init() {
    console.log('Initializing DexPaprika token results functionality...');
    
    // Check if we're on the token lookup page
    if (window.location.pathname.includes('/tools/token-lookup')) {
      console.log('On token lookup page, checking for URL parameters...');
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('query')) {
        console.log('Found URL parameters, processing lookup results...');
        handleTokenLookupResults(urlParams);
      } else {
        console.log('No URL parameters found');
      }
    } else {
      console.log('Not on token lookup page');
    }
    
    // Add debug button for results page
    const debugButton = document.createElement('button');
    debugButton.className = 'dp-debug-results';
    debugButton.textContent = 'Debug Results';
    debugButton.onclick = () => {
      console.log('=== DEBUG RESULTS INFO ===');
      console.log('Current URL:', window.location.href);
      console.log('URL parameters:', new URLSearchParams(window.location.search));
      console.log('Required elements:');
      console.log('- dp-token-results:', !!document.getElementById('dp-token-results'));
      console.log('- dp-search-query:', !!document.getElementById('dp-search-query'));
      console.log('- dp-results-table-body:', !!document.getElementById('dp-results-table-body'));
      
      // Try to process results again
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('query')) {
        console.log('Re-processing results...');
        handleTokenLookupResults(urlParams);
      } else {
        showNotification('❌ No URL parameters found', 'error');
      }
    };
    document.body.appendChild(debugButton);
    
    console.log('DexPaprika token results functionality initialized successfully');
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
