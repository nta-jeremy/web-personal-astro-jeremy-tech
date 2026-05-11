import { useRef, useEffect, useSyncExternalStore } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface StoreOptions {
  maxMessages?: number;
  storageKey?: string;
  broadcastChannelName?: string;
}

interface StoreReturn {
  getSnapshot: () => ChatMessage[];
  getServerSnapshot: () => ChatMessage[];
  subscribe: (cb: () => void) => () => void;
  appendMessage: (msg: Omit<ChatMessage, 'id'>) => string;
  updateMessageContent: (id: string, content: string) => void;
  persist: () => void;
  clearHistory: () => void;
  destroy: () => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function isValidChatMessage(v: unknown): v is ChatMessage {
  if (!v || typeof v !== 'object') return false;
  const msg = v as Record<string, unknown>;
  return (
    typeof msg.id === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string'
  );
}

function validateMessages(v: unknown): ChatMessage[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isValidChatMessage);
}

const storeCache = new Map<string, StoreReturn>();

export function createChatHistoryStore(options: StoreOptions = {}): StoreReturn {
  const maxMessages = options.maxMessages ?? 50;
  const storageKey = options.storageKey ?? 'jeremy-chat-history';
  const broadcastChannelName = options.broadcastChannelName ?? 'jeremy-chat-sync';

  let messages: ChatMessage[] = [];
  let listeners: (() => void)[] = [];
  let destroyed = false;

  // BroadcastChannel primary
  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(broadcastChannelName);
      bc.addEventListener('message', (ev) => {
        if (destroyed) return;
        const data = ev.data as { storageKey?: string; messages?: unknown[] } | undefined;
        if (data?.storageKey === storageKey && Array.isArray(data.messages)) {
          messages = validateMessages(data.messages);
          notify();
        }
      });
    } catch {
      // BroadcastChannel not available
    }
  }

  // Safari fallback: storage event
  function onStorage(ev: StorageEvent) {
    if (destroyed) return;
    if (ev.key === storageKey) {
      messages = ev.newValue ? validateMessages(JSON.parse(ev.newValue)) : [];
      notify();
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  function load() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        messages = validateMessages(JSON.parse(raw));
      }
    } catch {
      messages = [];
    }
  }

  function notify() {
    listeners.forEach((l) => l());
  }

  function saveAndBroadcast() {
    if (typeof localStorage === 'undefined' || destroyed) return;
    const trimmed = messages.slice(-maxMessages);
    messages = trimmed;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Storage quota exceeded or disabled
    }
    notify();
    if (bc) {
      try {
        bc.postMessage({ storageKey, messages });
      } catch {
        // ignore
      }
    }
  }

  function appendMessage(msg: Omit<ChatMessage, 'id'>): string {
    if (destroyed) return '';
    const id = generateId();
    messages = [...messages, { ...msg, id }];
    saveAndBroadcast();
    return id;
  }

  function updateMessageContent(id: string, content: string) {
    if (destroyed) return;
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) {
      throw new Error('Message not found');
    }
    messages = messages.map((m, i) => (i === idx ? { ...m, content } : m));
    notify();
  }

  function persist() {
    saveAndBroadcast();
  }

  function clearHistory() {
    messages = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    notify();
    if (bc) {
      try {
        bc.postMessage({ storageKey, messages: [] });
      } catch {
        // ignore
      }
    }
  }

  function subscribe(cb: () => void): () => void {
    listeners = [...listeners, cb];
    return () => {
      listeners = listeners.filter((l) => l !== cb);
    };
  }

  function destroy() {
    destroyed = true;
    listeners = [];
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
    if (bc) {
      try {
        bc.close();
      } catch {
        // ignore
      }
      bc = null;
    }
  }

  // Load on creation
  load();

  return {
    getSnapshot: () => messages,
    getServerSnapshot: () => [],
    subscribe,
    appendMessage,
    updateMessageContent,
    persist,
    clearHistory,
    destroy,
  };
}

export function useChatHistory(options: StoreOptions = {}) {
  const storageKey = options.storageKey ?? 'jeremy-chat-history';

  // Singleton per key within a tab to avoid duplicate BroadcastChannels / listeners
  const storeRef = useRef<StoreReturn | null>(null);
  if (!storeRef.current) {
    if (storeCache.has(storageKey)) {
      storeRef.current = storeCache.get(storageKey)!;
    } else {
      const store = createChatHistoryStore(options);
      storeCache.set(storageKey, store);
      storeRef.current = store;
    }
  }
  const store = storeRef.current;

  useEffect(() => {
    return () => {
      storeCache.delete(storageKey);
      store.destroy();
    };
  }, [storageKey, store]);

  const messages = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  return {
    messages,
    appendMessage: store.appendMessage,
    updateMessageContent: store.updateMessageContent,
    persist: store.persist,
    clearHistory: store.clearHistory,
  };
}
