console.log('DexPaprika search button script loading...');

// Add CSS styles for the button
var style = document.createElement('style');
style.textContent = '.dp-token-button{position:fixed!important;background:#16A34A!important;color:white!important;border:none!important;border-radius:6px!important;padding:8px 16px!important;font-size:14px!important;cursor:pointer!important;z-index:99999!important;display:none!important;font-weight:500!important;box-shadow:0 4px 8px rgba(0,0,0,0.2)!important;transition:all 0.2s ease!important;min-width:200px!important;text-align:center!important;pointer-events:auto!important}.dp-token-button.show{display:block!important;opacity:1!important;visibility:visible!important}.dp-token-button:hover{background:#15803D!important;transform:translateY(-1px)!important;box-shadow:0 6px 12px rgba(0,0,0,0.3)!important}.dp-debug-button{position:fixed!important;top:10px!important;right:10px!important;background:#dc2626!important;color:white!important;border:none!important;border-radius:4px!important;padding:4px 8px!important;font-size:12px!important;cursor:pointer!important;z-index:100000!important}';
document.head.appendChild(style);
console.log('Search button CSS styles added');

// Token data for search
var tokenData = [
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
  var lowerQuery = query.toLowerCase();
  return tokenData.filter(function(token) {
    return token.symbol.toLowerCase().includes(lowerQuery) || token.name.toLowerCase().includes(lowerQuery);
  });
}

// Show notification
function showNotification(message, type) {
  type = type || 'info';
  var notification = document.createElement('div');
  var bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#dc2626' : '#3b82f6';
  notification.style.cssText = 'position:fixed!important;top:20px!important;right:20px!important;background:' + bgColor + '!important;color:white!important;padding:12px 16px!important;border-radius:6px!important;font-size:14px!important;z-index:100001!important;box-shadow:0 4px 12px rgba(0,0,0,0.15)!important;';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(function() {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Find search input
function findSearchInput() {
  var selectors = [
    'input[placeholder*="search" i]',
    'input[type="search"]',
    '.search input',
    '[data-testid*="search"]',
    'input[aria-label*="search" i]'
  ];
  
  for (var i = 0; i < selectors.length; i++) {
    var input = document.querySelector(selectors[i]);
    if (input && input.offsetParent !== null) {
      return input;
    }
  }
  return null;
}

// Setup global search button
function setupGlobalSearchButton() {
  console.log('Setting up global search button...');
  
  var searchInput = findSearchInput();
  if (!searchInput) {
    console.log('Search input not found, will retry...');
    return false;
  }
  
  console.log('Found search input:', searchInput);
  
  // Create button
  var button = document.createElement('button');
  button.className = 'dp-token-button';
  button.textContent = 'Looking for token data?';
  document.body.appendChild(button);
  
  // Position button
  function positionButton() {
    var rect = searchInput.getBoundingClientRect();
    button.style.left = (rect.right + 10) + 'px';
    button.style.top = (rect.top - 2) + 'px';
  }
  
  // Show/hide button based on input
  function updateButtonVisibility() {
    var value = searchInput.value.trim();
    if (value.length >= 1) {
      var results = searchTokens(value);
      if (results.length > 0) {
        button.textContent = 'Looking for "' + value.toUpperCase() + '" token data?';
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
  searchInput.addEventListener('blur', function() {
    setTimeout(function() { button.classList.remove('show'); }, 200);
  });
  
  // Button click handler
  button.addEventListener('click', function() {
    var query = searchInput.value.trim();
    var results = searchTokens(query);
    
    if (results.length === 0) {
      showNotification('No tokens found for your search', 'error');
      return;
    }
    
    // Hide button immediately
    button.style.display = 'none';
    button.classList.remove('show');
    
    // Redirect to lookup page with token data
    var params = new URLSearchParams();
    params.set('query', query);
    
    for (var i = 0; i < results.length; i++) {
      var token = results[i];
      params.set(token.symbol, token.chain + ':' + token.address);
    }
    
    window.location.href = '/tools/token-lookup?' + params.toString();
  });
  
  console.log('Global search button setup complete');
  return true;
}

// Initialize
function init() {
  console.log('Initializing DexPaprika search button functionality...');
  
  // Setup global search button
  setupGlobalSearchButton();
  
  // Add debug button
  var debugButton = document.createElement('button');
  debugButton.className = 'dp-debug-button';
  debugButton.textContent = 'Debug Search';
  debugButton.onclick = function() {
    console.log('=== DEBUG INFO ===');
    console.log('Document ready state:', document.readyState);
    console.log('All inputs on page:', document.querySelectorAll('input').length);
    console.log('Search inputs found:', document.querySelectorAll('input[placeholder*="search" i], input[type="search"], .search input').length);
    
    var searchInput = findSearchInput();
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
  
  console.log('DexPaprika search button functionality initialized successfully');
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
