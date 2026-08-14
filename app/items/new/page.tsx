import { AddItemForm } from '@/components/AddItemForm'

export default function NewItemPage() {
  return (
    <div>
      <p className="eyebrow mb-1">New entry</p>
      <h1 className="text-2xl text-text mb-8">Add a renewal item</h1>
      <div className="card p-6 max-w-lg">
        <AddItemForm />
      </div>
    </div>
  )
}