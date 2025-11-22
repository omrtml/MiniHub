/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SUI_NETWORK: 'mainnet' | 'testnet' | 'devnet';
  readonly VITE_JOB_BOARD_PACKAGE_ID: string;
  readonly VITE_JOB_BOARD_OBJECT_ID: string;
  
  // zkLogin OAuth Client IDs
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_FACEBOOK_CLIENT_ID: string;
  readonly VITE_TWITCH_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
