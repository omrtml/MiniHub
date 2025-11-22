import { useZkLogin, OAuthProvider } from '../hooks/useZkLogin';
import './ZkLoginButton.css';

interface ZkLoginButtonProps {
  provider: OAuthProvider;
  clientId: string;
  redirectUrl?: string;
}

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  twitch: 'Twitch',
};

const PROVIDER_ICONS: Record<OAuthProvider, string> = {
  google: '🔍',
  facebook: '📘',
  twitch: '🎮',
};

export function ZkLoginButton({ provider, clientId, redirectUrl }: ZkLoginButtonProps) {
  const { login, logout, isConnected, address, isLoading, error, provider: connectedProvider } = useZkLogin();

  const handleLogin = () => {
    login({
      provider,
      clientId,
      redirectUrl: redirectUrl || window.location.origin,
    });
  };

  // If connected with this provider, show disconnect button
  if (isConnected && connectedProvider === provider) {
    return (
      <div className="zklogin-connected">
        <div className="zklogin-info">
          <span className="zklogin-icon">{PROVIDER_ICONS[provider]}</span>
          <div className="zklogin-details">
            <span className="zklogin-provider">{PROVIDER_LABELS[provider]}</span>
            <span className="zklogin-address">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
        <button onClick={logout} className="zklogin-logout-btn">
          Disconnect
        </button>
      </div>
    );
  }

  // Show login button
  return (
    <div className="zklogin-container">
      <button
        onClick={handleLogin}
        disabled={isLoading || isConnected}
        className={`zklogin-btn zklogin-btn-${provider}`}
      >
        <span className="zklogin-icon">{PROVIDER_ICONS[provider]}</span>
        <span>
          {isLoading ? 'Connecting...' : `Continue with ${PROVIDER_LABELS[provider]}`}
        </span>
      </button>
      {error && <div className="zklogin-error">{error}</div>}
    </div>
  );
}

/**
 * zkLogin Panel showing all available OAuth providers
 */
interface ZkLoginPanelProps {
  googleClientId?: string;
  facebookClientId?: string;
  twitchClientId?: string;
  redirectUrl?: string;
}

export function ZkLoginPanel({
  googleClientId,
  facebookClientId,
  twitchClientId,
  redirectUrl,
}: ZkLoginPanelProps) {
  const { isConnected, address, provider: connectedProvider, logout } = useZkLogin();

  // Check if any client IDs are configured
  const hasAnyProvider = googleClientId || facebookClientId || twitchClientId;

  return (
    <div className="zklogin-panel">
      <div className="zklogin-header">
        <h3>Sign in with</h3>
        <p className="zklogin-subtitle">No crypto wallet needed</p>
      </div>

      {isConnected ? (
        <div className="zklogin-connected-panel">
          <div className="zklogin-success">
            <div className="success-icon">✓</div>
            <h4>Signed in with {PROVIDER_LABELS[connectedProvider!]}</h4>
            <div className="zklogin-address-display">
              <span className="label">Sui Address:</span>
              <code>{address?.slice(0, 10)}...{address?.slice(-8)}</code>
            </div>
          </div>
          <button onClick={logout} className="zklogin-logout-btn">
            Sign Out
          </button>
        </div>
      ) : !hasAnyProvider ? (
        <div className="zklogin-not-configured">
          <p>⚠️ zkLogin is not configured</p>
          <p className="config-help">
            Add OAuth Client IDs to your <code>.env</code> file:
          </p>
          <pre className="config-example">
{`VITE_GOOGLE_CLIENT_ID=your-id
VITE_FACEBOOK_CLIENT_ID=your-id
VITE_TWITCH_CLIENT_ID=your-id`}
          </pre>
          <p className="config-help">
            See <strong>ZKLOGIN_GUIDE.md</strong> for setup instructions.
          </p>
        </div>
      ) : (
        <div className="zklogin-providers">
          {googleClientId && (
            <ZkLoginButton
              provider="google"
              clientId={googleClientId}
              redirectUrl={redirectUrl}
            />
          )}
          {facebookClientId && (
            <ZkLoginButton
              provider="facebook"
              clientId={facebookClientId}
              redirectUrl={redirectUrl}
            />
          )}
          {twitchClientId && (
            <ZkLoginButton
              provider="twitch"
              clientId={twitchClientId}
              redirectUrl={redirectUrl}
            />
          )}
        </div>
      )}
    </div>
  );
}
