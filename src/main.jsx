import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug logging
const DEBUG = true;
const log = (message, data = null) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[Main ${timestamp}] ${message}`, data !== null ? data : '');
  }
};

log('Application starting...');
log('Environment:', {
  userAgent: navigator.userAgent,
  url: window.location.href,
  protocol: window.location.protocol
});

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] React error caught:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#1a1a2e',
          color: '#eee',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ Application Error</h1>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Something went wrong loading the application.
          </p>
          <details style={{
            backgroundColor: '#16213e',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              Click for error details
            </summary>
            <pre style={{
              overflow: 'auto',
              padding: '15px',
              backgroundColor: '#0f0f23',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main render function with error handling
function renderApp() {
  try {
    log('Getting root element...');
    const rootElement = document.getElementById('root');

    if (!rootElement) {
      throw new Error('Root element not found! Check if index.html has <div id="root"></div>');
    }

    log('Root element found, creating React root...');
    const root = createRoot(rootElement);

    log('Rendering App component...');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );

    log('App rendered successfully!');
  } catch (error) {
    console.error('[Main] CRITICAL: Failed to render application:', error);

    // Show a basic error message even if React fails completely
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
                <div style="padding: 40px; font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh;">
                    <h1 style="color: #ff6b6b;">⚠️ Critical Error</h1>
                    <p>The application failed to start. Please check the browser console for details.</p>
                    <pre style="background: #0f0f23; padding: 15px; border-radius: 8px; overflow: auto; font-size: 12px;">${error.message}\n${error.stack}</pre>
                    <button onclick="window.location.reload()" style="padding: 12px 24px; background: #4a5568; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 20px;">Reload Page</button>
                </div>
            `;
    }
  }
}

// Run the app
renderApp();

