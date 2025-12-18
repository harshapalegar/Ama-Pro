import { useState, useEffect, useCallback } from 'react';
import { configService, AlgorithmConfig } from '../services/databaseService';

export const useAlgorithmConfig = () => {
  const [configs, setConfigs] = useState<AlgorithmConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<AlgorithmConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await configService.getAllConfigs();
      setConfigs(data);

      const active = await configService.getActiveConfig();
      setActiveConfig(active);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const createConfig = useCallback(
    async (config: Omit<AlgorithmConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const newConfig = await configService.createConfig(config);
      if (newConfig) {
        setConfigs([newConfig, ...configs]);
        return newConfig;
      }
      return null;
    },
    [configs]
  );

  const updateConfig = useCallback(
    async (id: string, updates: Partial<AlgorithmConfig>) => {
      const success = await configService.updateConfig(id, updates);
      if (success) {
        setConfigs(
          configs.map(c =>
            c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
          )
        );
        if (activeConfig?.id === id) {
          setActiveConfig({ ...activeConfig, ...updates });
        }
        return true;
      }
      return false;
    },
    [configs, activeConfig]
  );

  const deleteConfig = useCallback(
    async (id: string) => {
      const success = await configService.deleteConfig(id);
      if (success) {
        setConfigs(configs.filter(c => c.id !== id));
        if (activeConfig?.id === id) {
          setActiveConfig(null);
        }
        return true;
      }
      return false;
    },
    [configs, activeConfig]
  );

  const setActive = useCallback(
    async (id: string) => {
      const success = await configService.setActiveConfig(id);
      if (success) {
        const config = configs.find(c => c.id === id);
        if (config) {
          setActiveConfig(config);
          setConfigs(configs.map(c => ({ ...c, is_active: c.id === id })));
          return true;
        }
      }
      return false;
    },
    [configs]
  );

  return {
    configs,
    activeConfig,
    loading,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setActive,
  };
};
