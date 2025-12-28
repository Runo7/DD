const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

function loadEnv() {
  const config = {
    port: process.env.PORT || '8788',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    throw new Error(message);
  }
  return config;
}

export const env = loadEnv();
