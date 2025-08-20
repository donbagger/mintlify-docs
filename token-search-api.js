// Only run this script if we're on the token coverage checker page
if (window.location.pathname.includes('token-coverage-checker')) {
  console.log('🚀 Initializing Token Coverage Checker...');

  // Token Search API Integration
  class TokenSearchAPI {
    constructor() {
      // Use local proxy to avoid CORS issues
      this.baseURL = 'http://localhost:3002/api';
      this.cache = new Map();
      this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Search for tokens using the global search endpoint
    async searchTokens(query) {
      try {
        console.log(`🔍 Searching for tokens: ${query}`);
        
        const cacheKey = `search_${query.toLowerCase()}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          console.log('📦 Using cached results');
          return cached;
        }
        
        console.log('🌐 Making API call to:', `${this.baseURL}/search?query=${encodeURIComponent(query)}`);
        const response = await fetch(`${this.baseURL}/search?query=${encodeURIComponent(query)}`);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Search API response:', data);
        console.log('📊 Tokens found:', data.tokens ? data.tokens.length : 0);
        
        // Extract tokens from the response
        const tokens = data.tokens || [];
        const results = tokens.map(token => ({
          symbol: token.symbol,
          name: token.name,
          chain: token.chain,
          address: token.id, // The token ID is the address
          available: true,
          price: token.price_usd,
          volume: token.volume_usd,
          liquidity: token.liquidity_usd,
          fdv: token.fdv,
          decimals: token.decimals,
          totalSupply: token.total_supply
        }));
        
        console.log('✅ Processed results:', results.length, 'tokens');
        this.setCache(cacheKey, results);
        return results;
      } catch (error) {
        console.error('❌ Error searching tokens:', error);
        return [];
      }
    }

    // Cache management
    getFromCache(key) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(key);
      return null;
    }

    setCache(key, data) {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }

    // Clear cache
    clearCache() {
      this.cache.clear();
    }
  }

  // Local search fallback function
  function searchTokensLocal(query) {
    const tokenDatabase = [
      {
        symbol: "SOL",
        name: "Solana",
        chain: "solana",
        address: "So11111111111111111111111111111111111111112",
        available: true
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        chain: "ethereum",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        available: true
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        chain: "solana",
        address: "Es9vMFrzaCER2kJ8U1L8vMcbA5sX6Phn7ZdZ2m5W861",
        available: true
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        chain: "ethereum",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        available: true
      },
      {
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        chain: "ethereum",
        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        available: true
      },
      {
        symbol: "BONK",
        name: "Bonk",
        chain: "solana",
        address: "DezXAZ8z7P5M5VKsTR5VYg5t6sQf5CqZ3k8sEzsZsP1",
        available: true
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        chain: "ethereum",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        available: true
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        chain: "solana",
        address: "Es9vMFrzaCER2kJ8U1L8vMcbA5sX6Phn7ZdZ2m5W861",
        available: true
      }
    ];

    if (!query || query.trim().length < 1) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return tokenDatabase.filter(token => {
      return token.symbol.toLowerCase().includes(searchTerm) ||
             token.name.toLowerCase().includes(searchTerm) ||
             token.address.toLowerCase().includes(searchTerm);
    });
  }

  // Search function - uses real API with fallback
  async function searchTokens(query) {
    if (!query || query.trim().length < 1) return [];
    
    console.log('🔍 Starting search for:', query);
    console.log('🔍 window.tokenSearchAPI available:', !!window.tokenSearchAPI);
    
    try {
      // Try to use the real API first
      if (window.tokenSearchAPI) {
        console.log('🌐 Using API search...');
        const results = await window.tokenSearchAPI.searchTokens(query);
        console.log('✅ API search returned:', results.length, 'results');
        return results;
      } else {
        console.log('⚠️ tokenSearchAPI not available');
      }
    } catch (error) {
      console.warn('❌ API search failed, using fallback:', error);
    }
    
    // Fallback to local search
    console.log('🔄 Using local search fallback...');
    const localResults = searchTokensLocal(query);
    console.log('📦 Local search returned:', localResults.length, 'results');
    return localResults;
  }

  // Display results
  function displayResults(tokens, query) {
    const searchResults = document.getElementById('search-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsTableContainer = document.getElementById('results-table-container');
    const resultsTableBody = document.getElementById('results-table-body');
    const noResults = document.getElementById('no-results');
    const resultsTitle = document.getElementById('results-title');
    const resultsSubtitle = document.getElementById('results-subtitle');

    if (!searchResults || !loadingSpinner || !resultsTableContainer || !resultsTableBody || !noResults || !resultsTitle || !resultsSubtitle) {
      console.error('❌ Required DOM elements not found');
      return;
    }

    searchResults.style.display = 'block';
    loadingSpinner.style.display = 'none';
    
    if (tokens.length === 0) {
      resultsTableContainer.style.display = 'none';
      noResults.style.display = 'block';
      resultsTitle.textContent = 'No Results Found';
      resultsSubtitle.textContent = `No tokens found matching "${query}"`;
      return;
    }
    
    resultsTableContainer.style.display = 'block';
    noResults.style.display = 'none';
    resultsTitle.textContent = `Found ${tokens.length} Token${tokens.length > 1 ? 's' : ''}`;
    resultsSubtitle.textContent = `Results for "${query}"`;
    
    // Clear previous results
    resultsTableBody.innerHTML = '';
    
    // Add results to table
    tokens.forEach(token => {
      const row = document.createElement('tr');
      
      const networkClass = `network-${token.chain}`;
      
      // Format price and volume if available
      const price = token.price ? `$${parseFloat(token.price).toFixed(6)}` : 'N/A';
      const volume = token.volume ? `$${parseFloat(token.volume).toLocaleString()}` : 'N/A';
      const liquidity = token.liquidity ? `$${parseFloat(token.liquidity).toLocaleString()}` : 'N/A';
      
      row.innerHTML = `
        <td>
          <div class="token-info">
            <span class="token-symbol">${token.symbol}</span>
            <span class="token-name">${token.name}</span>
          </div>
        </td>
        <td>
          <span class="network-badge ${networkClass}">${token.chain}</span>
        </td>
        <td>
          <span class="token-address">${token.address}</span>
        </td>
        <td>
          <div class="token-stats">
            <div class="token-price">${price}</div>
            <div class="token-volume">24h Vol: ${volume}</div>
            <div class="token-liquidity">Liquidity: ${liquidity}</div>
          </div>
        </td>
        <td>
          <div class="actions-group">
            <a href="/api-reference/tokens/get-a-tokens-latest-data-on-a-network" class="action-btn action-btn-primary">
              View API
            </a>
            <a href="/tools/token-lookup?query=${token.symbol}" class="action-btn action-btn-secondary">
              Details
            </a>
          </div>
        </td>
      `;
      
      resultsTableBody.appendChild(row);
    });
  }

  // Show loading state
  function showLoading() {
    const searchResults = document.getElementById('search-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsTableContainer = document.getElementById('results-table-container');
    const noResults = document.getElementById('no-results');

    if (!searchResults || !loadingSpinner || !resultsTableContainer || !noResults) {
      console.error('❌ Required DOM elements not found');
      return;
    }

    searchResults.style.display = 'block';
    loadingSpinner.style.display = 'block';
    resultsTableContainer.style.display = 'none';
    noResults.style.display = 'none';
  }

  // Handle search
  async function handleSearch() {
    const searchInput = document.getElementById('token-search-input');
    if (!searchInput) {
      console.error('❌ Search input not found');
      return;
    }

    const query = searchInput.value.trim();
    
    if (!query) {
      alert('Please enter a search term');
      return;
    }
    
    showLoading();
    
    try {
      const results = await searchTokens(query);
      displayResults(results, query);
    } catch (error) {
      console.error('Search error:', error);
      displayResults([], query);
    }
  }

  // Initialize when DOM is ready
  function initializeTokenSearch() {
    console.log('🔧 Initializing token search functionality...');

    // DOM elements
    const searchInput = document.getElementById('token-search-input');
    const searchButton = document.getElementById('search-button');

    // Global API instance
    window.tokenSearchAPI = new TokenSearchAPI();

    // Event listeners
    if (searchButton) {
      searchButton.addEventListener('click', handleSearch);
      console.log('✅ Search button event listener added');
    } else {
      console.warn('⚠️ Search button not found');
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
      
      // Auto-focus search input
      searchInput.focus();
      console.log('✅ Search input event listener added and focused');
    } else {
      console.warn('⚠️ Search input not found');
    }

    console.log('✅ Token search initialization complete');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTokenSearch);
  } else {
    initializeTokenSearch();
  }
}
