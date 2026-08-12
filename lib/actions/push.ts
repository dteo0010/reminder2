'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function clearStaleSubscription(endpoint: string) {
  await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint)
}