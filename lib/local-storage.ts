const DB_NAME = 'qilasnote_db';
const DB_VERSION = 2;

interface DBStore {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[];
}

const stores: DBStore[] = [
  { 
    name: 'milk_records', 
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date' }, { name: 'timestamp', keyPath: 'timestamp' }]
  },
  { 
    name: 'mpasi_records', 
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date' }, { name: 'timestamp', keyPath: 'timestamp' }]
  },
  { 
    name: 'growth_records', 
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date' }, { name: 'timestamp', keyPath: 'timestamp' }]
  },
  { 
    name: 'additional_food', 
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date' }, { name: 'food_type_date', keyPath: ['food_type', 'date'], unique: true }]
  },
  { name: 'user_settings', keyPath: 'id' },
  { 
    name: 'notes', 
    keyPath: 'id',
    indexes: [{ name: 'pinned', keyPath: 'pinned' }, { name: 'timestamp', keyPath: 'timestamp' }]
  },
];

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: true });
          store.indexes?.forEach(index => {
            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false });
          });
        }
      });
    };
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function add<T>(storeName: string, data: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const dataWithTimestamp = { ...data, created_at: new Date().toISOString() };
    const request = store.add(dataWithTimestamp);

    request.onsuccess = () => {
      resolve({ ...dataWithTimestamp, id: request.result } as T);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function update<T>(storeName: string, id: number, data: Partial<T>): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (!existing) {
        reject(new Error('Record not found'));
        return;
      }
      const updated = { ...existing, ...data };
      const putRequest = store.put(updated);
      
      putRequest.onsuccess = () => resolve(updated);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function remove(storeName: string, id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteByIndexMultiple(storeName: string, indexName: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.openCursor(IDBKeyRange.only(value));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}
