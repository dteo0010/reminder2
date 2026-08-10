import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('items').select('*')

  return (
    <div>
      <h1>Connection test</h1>
      <p>Error: {error ? error.message : 'none'}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  )
}