import * as store from '../../lib/store';

// The module uses shared mutable state, so we clear all items before each test.
beforeEach(() => {
  const current = [...store.getAllItems()];
  current.forEach(item => store.deleteItem(item.id));
});

describe('getAllItems', () => {
  it('returns an empty array when no items have been added', () => {
    expect(store.getAllItems()).toEqual([]);
  });

  it('returns all added items', () => {
    store.addItem('A');
    store.addItem('B');
    expect(store.getAllItems()).toHaveLength(2);
  });

  it('returns items in insertion order', () => {
    store.addItem('First');
    store.addItem('Second');
    const items = store.getAllItems();
    expect(items[0].name).toBe('First');
    expect(items[1].name).toBe('Second');
  });

  it('reflects deletions immediately', () => {
    const item = store.addItem('Temp');
    store.deleteItem(item.id);
    expect(store.getAllItems()).toHaveLength(0);
  });
});

describe('addItem', () => {
  it('returns the newly created item', () => {
    const item = store.addItem('Widget', 'A round widget');
    expect(item.name).toBe('Widget');
    expect(item.description).toBe('A round widget');
    expect(item.id).toBeGreaterThan(0);
  });

  it('uses an empty string as the default description', () => {
    const item = store.addItem('No Desc');
    expect(item.description).toBe('');
  });

  it('assigns a positive numeric ID', () => {
    const item = store.addItem('Item');
    expect(typeof item.id).toBe('number');
    expect(item.id).toBeGreaterThan(0);
  });

  it('assigns unique IDs to successive items', () => {
    const a = store.addItem('A');
    const b = store.addItem('B');
    const c = store.addItem('C');
    const ids = new Set([a.id, b.id, c.id]);
    expect(ids.size).toBe(3);
  });

  it('assigns strictly increasing IDs', () => {
    const first = store.addItem('First');
    const second = store.addItem('Second');
    expect(second.id).toBeGreaterThan(first.id);
  });

  it('sets createdAt to a valid ISO timestamp close to now', () => {
    const before = Date.now();
    const item = store.addItem('TS Test');
    const after = Date.now();
    const ts = new Date(item.createdAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('adds the item to the store', () => {
    store.addItem('Persisted');
    expect(store.getAllItems()).toHaveLength(1);
  });

  it('adds multiple items to the store', () => {
    store.addItem('One');
    store.addItem('Two');
    store.addItem('Three');
    expect(store.getAllItems()).toHaveLength(3);
  });
});

describe('deleteItem', () => {
  it('returns true when the item exists and is removed', () => {
    const item = store.addItem('Delete Me');
    expect(store.deleteItem(item.id)).toBe(true);
  });

  it('removes the item from the store', () => {
    const item = store.addItem('Gone');
    store.deleteItem(item.id);
    expect(store.getAllItems()).toHaveLength(0);
  });

  it('returns false for a non-existent ID', () => {
    expect(store.deleteItem(99999)).toBe(false);
  });

  it('returns false when called a second time on the same ID', () => {
    const item = store.addItem('Once');
    store.deleteItem(item.id);
    expect(store.deleteItem(item.id)).toBe(false);
  });

  it('only removes the targeted item', () => {
    const keep = store.addItem('Keep Me');
    const remove = store.addItem('Remove Me');
    store.deleteItem(remove.id);
    const remaining = store.getAllItems();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(keep.id);
  });

  it('preserves the order of remaining items', () => {
    const a = store.addItem('A');
    const b = store.addItem('B');
    const c = store.addItem('C');
    store.deleteItem(b.id);
    const remaining = store.getAllItems();
    expect(remaining.map(i => i.id)).toEqual([a.id, c.id]);
  });
});

describe('getItem', () => {
  it('returns the item when it exists', () => {
    const item = store.addItem('Find Me', 'desc');
    const found = store.getItem(item.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(item.id);
    expect(found?.name).toBe('Find Me');
    expect(found?.description).toBe('desc');
  });

  it('returns undefined for a non-existent ID', () => {
    expect(store.getItem(99999)).toBeUndefined();
  });

  it('returns undefined after the item has been deleted', () => {
    const item = store.addItem('Ephemeral');
    store.deleteItem(item.id);
    expect(store.getItem(item.id)).toBeUndefined();
  });

  it('returns the correct item by ID when multiple items exist', () => {
    const a = store.addItem('Alpha');
    const b = store.addItem('Beta');
    expect(store.getItem(a.id)?.name).toBe('Alpha');
    expect(store.getItem(b.id)?.name).toBe('Beta');
  });

  it('returns an item with all expected fields', () => {
    const item = store.addItem('Full', 'full desc');
    const found = store.getItem(item.id)!;
    expect(found).toHaveProperty('id');
    expect(found).toHaveProperty('name');
    expect(found).toHaveProperty('description');
    expect(found).toHaveProperty('createdAt');
  });
});
