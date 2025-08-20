# Token Search Functionality

This document explains the token search functionality implemented for the DexPaprika documentation.

## Overview

The token search feature allows users to quickly check if tokens are available in the DexPaprika API. It's designed for:
- **Non-technical users** who need to verify token coverage
- **BD teams** who want to check token availability before client discussions
- **Developers** who need to quickly look up token information

**Production Ready**: The script automatically detects the environment and uses the appropriate API endpoint:
- **Development**: Uses local proxy server to bypass CORS issues
- **Production**: Uses direct DexPaprika API calls

## Files Created

### 1. `/tools/token-coverage-checker.mdx`
The main interactive search page in the Mintlify documentation.

**Features:**
- Real-time search using the DexPaprika API
- Beautiful, responsive UI that matches Mintlify theme
- Shows token symbol, name, network, address, price, volume, and liquidity
- Links to API documentation and detailed token information
- Fallback to local search if API is unavailable

### 2. `/token-search-api.js`
JavaScript library that handles API integration.

**Features:**
- Direct integration with `/search` endpoint via local proxy
- Smart caching to improve performance
- Error handling with graceful fallbacks
- Extracts token data from API responses

### 3. `/token-search-styles.css`
CSS styles for the search interface.

**Features:**
- Responsive design that matches Mintlify theme
- Clean, modern UI components
- Proper styling for search results and loading states

### 4. `/server/` directory
Server-side files for development and testing.

**Contents:**
- `api-proxy.js` - Node.js proxy server to bypass CORS
- `package.json` - Node.js dependencies
- `debug-api.html` - API testing page
- `test-token-search.html` - Standalone test page

## API Integration

The search uses the DexPaprika `/search` endpoint:

**Production:**
```
GET https://api.dexpaprika.com/search?query={search_term}
```

**Development (via proxy):**
```
GET http://localhost:3002/api/search?query={search_term}
```

The script automatically detects the environment and uses the appropriate endpoint.

**Response includes:**
- `tokens[]` - Array of matching tokens
- `pools[]` - Array of matching pools  
- `dexes[]` - Array of matching DEXes

**Token object structure:**
```json
{
  "id": "token_address",
  "name": "Token Name",
  "symbol": "SYMBOL",
  "chain": "ethereum|solana|bsc|...",
  "price_usd": 123.45,
  "volume_usd": 1000000,
  "liquidity_usd": 500000,
  "decimals": 18,
  "total_supply": 1000000000
}
```

## Usage

### For Users:
1. Navigate to `/tools/token-coverage-checker` in the documentation
2. Enter a token symbol (e.g., "SOL", "USDC") or name (e.g., "Solana", "Bitcoin")
3. Click "Search" or press Enter
4. Review results showing token availability and market data
5. Click "View API" to see the API endpoint documentation
6. Click "Details" for comprehensive token information

### For BD Teams:
- **Pre-sales calls**: Check if client's tokens are supported
- **Partnership discussions**: Verify coverage for potential partners  
- **Client onboarding**: Ensure all required tokens are available
- **Market research**: Explore what tokens are currently supported

### Search Examples:
- `SOL` - Finds Solana tokens across networks
- `USDC` - Finds USD Coin on multiple chains
- `WETH` - Finds Wrapped Ether
- `Bitcoin` - Finds Bitcoin-related tokens
- `Ethereum` - Finds Ethereum-related tokens

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Start the proxy server: `./start-proxy.sh` (or `node api-proxy.js`)
4. In a new terminal, start Mintlify dev server: `mintlify dev`
5. Navigate to `/tools/token-coverage-checker` in your browser

**Note:** The proxy server must be running on port 3002 for the token search to work properly.

## Technical Details

### Caching
- Search results are cached for 5 minutes
- Reduces API calls and improves performance
- Cache is cleared automatically

### Error Handling
- Graceful fallback to local search if API fails
- User-friendly error messages
- Console logging for debugging

### Responsive Design
- Works on desktop, tablet, and mobile
- Uses Mintlify CSS variables for consistent theming
- Optimized table layout for different screen sizes

## Customization

### Adding More Tokens to Fallback
Edit the `tokenDatabase` array in both files:
```javascript
const tokenDatabase = [
  {
    symbol: "NEW",
    name: "New Token",
    chain: "ethereum", 
    address: "0x...",
    available: true
  }
  // ... more tokens
];
```

### Modifying API Endpoints
Update the `baseURL` in `token-search-api.js`:
```javascript
this.baseURL = 'https://api.dexpaprika.com';
```

### Styling Changes
The search page uses Mintlify CSS variables:
- `--color-primary` - Primary brand color
- `--color-background` - Background color
- `--color-text-primary` - Main text color
- `--color-border` - Border color

## Testing

### Local Testing
1. Open `test-token-search.html` in a browser
2. Try searching for different tokens
3. Check browser console for API calls and responses
4. Test error scenarios by temporarily breaking the API URL

### API Testing
Test the search endpoint directly:
```bash
curl "https://api.dexpaprika.com/search?query=SOL"
```

### Integration Testing
1. Start the Mintlify development server
2. Navigate to the token search page
3. Test search functionality
4. Verify links to API documentation work correctly

## Troubleshooting

### Common Issues

**Search not working:**
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure JavaScript files are loaded correctly

**No results showing:**
- Check if API is returning data
- Verify search query format
- Test with known tokens like "SOL" or "USDC"

**Styling issues:**
- Ensure Mintlify CSS variables are available
- Check for CSS conflicts
- Verify responsive breakpoints

### Debug Mode
Enable debug logging by checking browser console:
- API calls and responses
- Cache hits/misses
- Error messages
- Search performance

## Future Enhancements

Potential improvements:
- **Advanced filtering** by network, price range, volume
- **Export functionality** for search results
- **Saved searches** for frequent queries
- **Bulk token checking** for multiple tokens at once
- **Real-time price updates** with WebSocket integration
- **Token comparison** side-by-side view

## Support

For issues or questions:
1. Check the browser console for error messages
2. Test with the standalone HTML file
3. Verify API endpoint accessibility
4. Review this documentation for common solutions
