import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config/api';

const API_URL = `${API_BASE_URL}/content`;

export function useCMSContent(pageKey) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 LOAD CONTENT FROM BACKEND
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${pageKey}`);
      const data = await res.json();

      setContent(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  // 🔥 SAVE CONTENT (ADMIN)
  const save = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('kk_admin_token');

      const res = await fetch(`${API_URL}/${pageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔐 admin protected
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Save failed');

      await reload();
      return true;
    } catch (err) {
      console.error(err);
      setError('Failed to save');
      return false;
    } finally {
      setLoading(false);
    }
  }, [pageKey, reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { content, save, loading, error, reload };
}
