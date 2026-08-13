import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditItemForm } from '@/components/EditItemForm'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase.from('items').select('*').eq('id', id).single()
  if (error || !item) notFound()

  return (
    <div>
      <h1>Edit item</h1>
      <EditItemForm item={item} />
    </div>
  )
}