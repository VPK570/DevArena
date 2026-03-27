export function getSandboxHTML(code) {
  // Strip import statements (browser can't handle them in script tags)
  const cleanCode = code
    .replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background: #1e293b; 
        color: #f1f5f9; 
        padding: 16px;
        margin: 0;
      }
      .error {
        color: #f87171;
        background: #450a0a;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 13px;
        white-space: pre-wrap;
        border: 1px solid #7f1d1d;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      (() => {
        // 1. Intercept console logs
        const originalLog = console.log;
        const originalError = console.error;

        console.log = function(...args) {
          window.parent.postMessage({ source: 'battle-front-sandbox', type: 'log', payload: args.join(' ') }, '*');
          originalLog.apply(console, args);
        };

        console.error = function(...args) {
          window.parent.postMessage({ source: 'battle-front-sandbox', type: 'error', payload: args.join(' ') }, '*');
          originalError.apply(console, args);
        };

        // 2. Catch runtime window errors (e.g., syntax errors, reference errors)
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({ 
            source: 'battle-front-sandbox', 
            type: 'error', 
            payload: \`[Line \${lineno}] \${message}\` 
          }, '*');
          return true; 
        };

        try {
          ${cleanCode}

          const root = ReactDOM.createRoot(document.getElementById('root'));
          
          // Try common component names in order
          const componentNames = [
            'Counter', 'App', 'TodoList', 'Component', 
            'Main', 'Solution', 'Widget', 'Dashboard'
          ];
          
          let rendered = false;
          for (const name of componentNames) {
            try {
              if (typeof eval(name) === 'function') {
                const El = eval(name);
                root.render(<El />);
                rendered = true;
                break;
              }
            } catch(e) { continue; }
          }
          
          if (!rendered) {
            document.getElementById('root').innerHTML = 
              '<div class="error">⚠️ No renderable component found.\\n\\nMake sure your component is named one of: Counter, App, TodoList, Component, Main, Solution, Widget, or Dashboard.</div>';
          }
        } catch(e) {
          document.getElementById('root').innerHTML = 
            '<div class="error">❌ Runtime Error:\\n\\n' + 
            e.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + 
            '</div>';
        }
      })();
    </script>
  </body>
</html>`;
}
