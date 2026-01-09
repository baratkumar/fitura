// Simple in-memory store
// In production, replace this with a proper database

export interface Item {
  id: number
  name: string
  description: string
  createdAt: string
}

let items: Item[] = []
let nextId = 1

export function getAllItems(): Item[] {
  return items
}

export function addItem(name: string, description: string = ''): Item {
  const newItem: Item = {
    id: nextId++,
    name,
    description,
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  return newItem
}

export function deleteItem(id: number): boolean {
  const index = items.findIndex(item => item.id === id)
  if (index !== -1) {
    items.splice(index, 1)
    return true
  }
  return false
}

export function getItem(id: number): Item | undefined {
  return items.find(item => item.id === id)
}









