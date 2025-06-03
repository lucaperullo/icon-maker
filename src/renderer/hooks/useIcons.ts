// src/renderer/hooks/useIcons.ts
import { useState, useEffect, useCallback } from 'react';

export interface Icon {
  id: string;
  name: string;
  prompt: string;
  sizes: string[];
  style: string;
  primaryColor: string;
  secondaryColor: string;
  styleOptions: StyleOptions;
  createdAt: string;
  updatedAt: string;
  svgContent: string;
  formats: {
    svg?: string;
    png?: Record<string, string>;
    ico?: string;
  };
}

export interface StyleOptions {
  style: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: string;
  iconComplexity: string;
  corners: string;
  effects: string[];
  mood: string;
  theme: string;
}

export function useIcons() {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all icons on mount
  useEffect(() => {
    loadIcons();
  }, []);

  const loadIcons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.getAll();
      if (result.success) {
        setIcons(result.icons || []);
      } else {
        setError(result.error || 'Failed to load icons');
      }
    } catch (err) {
      setError('Failed to load icons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIcon = useCallback(async (iconData: {
    name?: string;
    prompt: string;
    styleOptions: StyleOptions;
    sizes: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.create(iconData);
      if (result.success) {
        await loadIcons(); // Reload all icons
        return result.icon;
      } else {
        setError(result.error || 'Failed to create icon');
        return null;
      }
    } catch (err) {
      setError('Failed to create icon');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadIcons]);

  const updateIcon = useCallback(async (id: string, updates: Partial<Icon>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.update(id, updates);
      if (result.success) {
        setIcons(prev => prev.map(icon => 
          icon.id === id ? { ...icon, ...updates } : icon
        ));
        return result.icon;
      } else {
        setError(result.error || 'Failed to update icon');
        return null;
      }
    } catch (err) {
      setError('Failed to update icon');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIcon = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.delete(id);
      if (result.success) {
        setIcons(prev => prev.filter(icon => icon.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete icon');
        return false;
      }
    } catch (err) {
      setError('Failed to delete icon');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultipleIcons = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.deleteMultiple(ids);
      if (result.success) {
        setIcons(prev => prev.filter(icon => !ids.includes(icon.id)));
        return result.count;
      } else {
        setError(result.error || 'Failed to delete icons');
        return 0;
      }
    } catch (err) {
      setError('Failed to delete icons');
      console.error(err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchIcons = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadIcons();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.icon.search(query);
      if (result.success) {
        setIcons(result.icons || []);
      } else {
        setError(result.error || 'Failed to search icons');
      }
    } catch (err) {
      setError('Failed to search icons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadIcons]);

  const exportIcon = useCallback(async (options: {
    iconId: string;
    platforms: string[];
    sizes: string[];
    format: 'zip' | 'folder';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.export.icon(options);
      if (result.success) {
        return result.filePath;
      } else {
        setError(result.error || 'Failed to export icon');
        return null;
      }
    } catch (err) {
      setError('Failed to export icon');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportSingleIcon = useCallback(async (iconId: string, format: string, size?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.export.single(iconId, format, size);
      if (result.success) {
        return result.filePath;
      } else {
        setError(result.error || 'Failed to export icon');
        return null;
      }
    } catch (err) {
      setError('Failed to export icon');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    icons,
    loading,
    error,
    createIcon,
    updateIcon,
    deleteIcon,
    deleteMultipleIcons,
    searchIcons,
    exportIcon,
    exportSingleIcon,
    refresh: loadIcons,
  };
}