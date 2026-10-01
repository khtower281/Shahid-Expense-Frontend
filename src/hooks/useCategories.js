import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/api-endpoints';

/* -------------------- Module-level cache + subscriber list -------------------- */
let cache = null;              // Category[] | null
const listeners = new Set();   // Set<(categories) => void>

const notify = () => {
  listeners.forEach((fn) => fn(cache || []));
};

/**
 * Invalidate the cache and re-fetch from the server.
 * Safe to call from anywhere (page, event handler, etc.).
 */
export const refreshCategories = async () => {
  try {
    const { data } = await api.get(ENDPOINTS.CATEGORIES.BASE);
    cache = data.categories || [];
    notify();
    return cache;
  } catch (error) {
    // Let the caller decide how to handle. Re-throw so they can toast.
    throw error;
  }
};

/**
 * Clear the cache so the next consumer triggers a fresh fetch.
 * Rarely needed — prefer `refreshCategories()`.
 */
export const invalidateCategoriesCache = () => {
  cache = null;
};

/* -------------------- Hook -------------------- */
export function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  /* Subscribe to global updates */
  useEffect(() => {
    const handler = (next) => setCategories(next);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  /* First-ever consumer triggers a fetch */
  useEffect(() => {
    let alive = true;
    if (cache) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        await refreshCategories();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Public refresh — used by mutation sites */
  const refresh = async () => {
    setLoading(true);
    try {
      await refreshCategories();
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, refresh };
}