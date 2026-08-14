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
      <p className="eyebrow mb-1">Editing</p>
      <h1 className="text-2xl text-text mb-8">{item.name}</h1>
      <div className="card p-6 max-w-lg">
        <EditItemForm item={item} />
      </div>
    </div>
  )
}