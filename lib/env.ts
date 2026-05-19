const requiredClientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
};

export function getClientEnv() {
  return requiredClientEnv;
}

export function getServerEnv() {
  return {
    ...requiredClientEnv,
    pusherAppId: process.env.PUSHER_APP_ID,
    pusherSecret: process.env.PUSHER_SECRET,
    pusherCluster: process.env.PUSHER_CLUSTER
  };
}
