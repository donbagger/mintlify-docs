(() => {
  const CSS = `
    .dp-lookup{position:relative;max-width:640px;margin:16px 0}
    .dp-lookup input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px}
    .dp-suggestions{position:absolute;z-index:40;left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden}
    .dp-suggestions button{display:flex;gap:8px;width:100%;padding:10px 12px;border:0;background:#fff;cursor:pointer}
    .dp-suggestions button:hover{background:#f9fafb}
    .dp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .dp-actions a,.dp-actions button{padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;text-decoration:none}
    .dp-global-popover{position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);max-width:400px;padding:12px}
    .dp-global-popover .dp-actions{margin-top:8px}
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  async function searchTokens(q) {
    try {
      const res = await fetch('/assets/token-index.json');
      if (!res.ok) return [];
      const all = await res.json();
      q = q.toLowerCase();
      return all
        .filter(t => t.symbol?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q))
        .slice(0, 6);
    } catch (_) {
      return [];
    }
  }

  function buildActions(token) {
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
      if (q.length < 2 || q === last) return;
      last = q;
      const results = await searchTokens(q);
      sugg.innerHTML = '';
      if (!results.length) {
        sugg.style.display = 'none';
        return;
      }
      results.forEach(t => {
        const btn = document.createElement('button');
        btn.innerHTML = `<strong>${t.symbol}</strong> — ${t.name} · ${t.chain}`;
        btn.onclick = () => {
          sugg.style.display = 'none';
          root.querySelectorAll('.dp-actions').forEach(n => n.remove());
          root.appendChild(buildActions(t));
        };
        sugg.appendChild(btn);
      });
      sugg.style.display = 'block';
    }

    input.addEventListener('input', debounce(onInput, 180));
    root.appendChild(input);
    root.appendChild(sugg);
    container.appendChild(root);
  }

  // Global search interception
  function setupGlobalSearch() {
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
        'input[aria-label*="search" i]'
      ];
      
      for (const selector of selectors) {
        const input = document.querySelector(selector);
        if (input && input.offsetParent !== null) { // visible
          return input;
        }
      }
      return null;
    }

    function showGlobalPopover(query, inputElement) {
      if (globalPopover) {
        globalPopover.remove();
      }

      // Check if query looks like a ticker (2+ chars, alphanumeric)
      if (query.length < 2 || !/^[a-zA-Z0-9]+$/.test(query)) {
        return;
      }

      searchTokens(query).then(results => {
        if (results.length === 0) return;

        globalPopover = document.createElement('div');
        globalPopover.className = 'dp-global-popover';
        
        const title = document.createElement('div');
        title.innerHTML = `<strong>Token suggestions for "${query}"</strong>`;
        title.style.marginBottom = '8px';
        globalPopover.appendChild(title);

        results.forEach(t => {
          const btn = document.createElement('button');
          btn.innerHTML = `<strong>${t.symbol}</strong> — ${t.name} · ${t.chain}`;
          btn.style.cssText = 'display:block;width:100%;padding:8px;border:0;background:#fff;cursor:pointer;text-align:left;border-bottom:1px solid #f3f4f6';
          btn.onclick = () => {
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

        // Position the popover near the search input
        const rect = inputElement.getBoundingClientRect();
        globalPopover.style.left = `${rect.left}px`;
        globalPopover.style.top = `${rect.bottom + 8}px`;

        document.body.appendChild(globalPopover);
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

      let lastValue = '';
      const checkInput = () => {
        const currentValue = searchInput.value.trim();
        if (currentValue !== lastValue) {
          lastValue = currentValue;
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
    // Mount page-specific widgets
    document.querySelectorAll('#dp-token-lookup').forEach(mountLookup);
    
    // Setup global search interception
    setupGlobalSearch();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
