// Token Search API Integration for DexPaprika
// This file provides real API integration for the token search functionality

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

  // Get available networks (kept for potential future use)
  async getNetworks() {
    const cacheKey = 'networks';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/networks`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const networks = data.map(network => network.id);
      
      this.setCache(cacheKey, networks);
      return networks;
    } catch (error) {
      console.error('Error fetching networks:', error);
      // Fallback to known networks
      return ['ethereum', 'solana', 'polygon', 'arbitrum'];
    }
  }

  // Get detailed token information
  async getTokenDetails(network, address) {
    const cacheKey = `token_${network}_${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/networks/${network}/tokens/${address}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching token details:', error);
      return null;
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

// Global API instance
window.tokenSearchAPI = new TokenSearchAPI();

// Enhanced search function that uses the API
async function searchTokensWithAPI(query) {
  try {
    const results = await window.tokenSearchAPI.searchTokens(query);
    return results;
  } catch (error) {
    console.error('Error in API search:', error);
    // Fallback to local search
    return searchTokensLocal(query);
  }
}

// Local search fallback
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

// Export for use in MDX
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TokenSearchAPI, searchTokensWithAPI, searchTokensLocal };
}
