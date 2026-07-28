'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Barber, QueueEntry, Service, ShopConfig } from '@/types';
import { shopConfig as defaultConfig, initialBarbers, services as defaultServices } from '@/data/shopConfig';

interface QueueContextType {
  config: ShopConfig;
  barbers: Barber[];
  queue: QueueEntry[];
  services: Service[];
  addToQueue: (clientName: string, whatsapp: string, selectedServices: Service[]) => void;
  removeFromQueue: (id: string) => void;
  callClient: (entryId: string, barberId: string) => void;
  finishClient: (entryId: string) => void;
  toggleShopOpen: () => void;
  toggleQueueOpen: () => void;
  setBarberStatus: (barberId: string, status: Barber['status']) => void;
  getClientEntry: (whatsapp: string) => QueueEntry | undefined;
  cancelEntry: (id: string) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_KEYS = {
  queue: 'delrey_queue',
  barbers: 'delrey_barbers',
  config: 'delrey_config',
};

export function QueueProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ShopConfig>(defaultConfig);
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [services] = useState<Service[]>(defaultServices);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem(STORAGE_KEYS.queue);
      const savedBarbers = localStorage.getItem(STORAGE_KEYS.barbers);
      const savedConfig = localStorage.getItem(STORAGE_KEYS.config);

      if (savedQueue) setQueue(JSON.parse(savedQueue));
      if (savedBarbers) setBarbers(JSON.parse(savedBarbers));
      if (savedConfig) setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(queue));
  }, [queue, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.barbers, JSON.stringify(barbers));
  }, [barbers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  }, [config, isLoaded]);

  const calculateEstimatedWait = useCallback((position: number): number => {
    // Average service time in minutes
    const avgServiceTime = 35;
    const availableBarbers = barbers.filter(b => b.status === 'available' || b.status === 'busy').length || 1;
    return Math.ceil((position / availableBarbers) * avgServiceTime);
  }, [barbers]);

  const recalculatePositions = useCallback((currentQueue: QueueEntry[]): QueueEntry[] => {
    const waitingEntries = currentQueue.filter(e => e.status === 'waiting');
    return currentQueue.map(entry => {
      if (entry.status !== 'waiting') return entry;
      const pos = waitingEntries.findIndex(e => e.id === entry.id) + 1;
      return {
        ...entry,
        position: pos,
        estimatedWait: calculateEstimatedWait(pos),
      };
    });
  }, [calculateEstimatedWait]);

  const addToQueue = useCallback((clientName: string, whatsapp: string, selectedServices: Service[]) => {
    const waitingCount = queue.filter(e => e.status === 'waiting').length;
    const position = waitingCount + 1;

    const newEntry: QueueEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientName,
      whatsapp,
      services: selectedServices,
      status: 'waiting',
      position,
      joinedAt: Date.now(),
      estimatedWait: calculateEstimatedWait(position),
    };

    setQueue(prev => [...prev, newEntry]);
  }, [queue, calculateEstimatedWait]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => {
      const updated = prev.filter(e => e.id !== id);
      return recalculatePositions(updated);
    });
  }, [recalculatePositions]);

  const cancelEntry = useCallback((id: string) => {
    setQueue(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, status: 'cancelled' as const } : e
      );
      return recalculatePositions(updated.filter(e => e.status !== 'cancelled'));
    });
  }, [recalculatePositions]);

  const callClient = useCallback((entryId: string, barberId: string) => {
    setQueue(prev =>
      recalculatePositions(
        prev.map(e =>
          e.id === entryId
            ? { ...e, status: 'being-served' as const, barberId, position: 0 }
            : e
        )
      )
    );
    setBarbers(prev =>
      prev.map(b =>
        b.id === barberId
          ? { ...b, status: 'busy' as const, currentClient: entryId }
          : b
      )
    );
  }, [recalculatePositions]);

  const finishClient = useCallback((entryId: string) => {
    const entry = queue.find(e => e.id === entryId);
    if (entry?.barberId) {
      setBarbers(prev =>
        prev.map(b =>
          b.id === entry.barberId
            ? { ...b, status: 'available' as const, currentClient: undefined }
            : b
        )
      );
    }
    setQueue(prev => {
      const updated = prev.filter(e => e.id !== entryId);
      return recalculatePositions(updated);
    });
  }, [queue, recalculatePositions]);

  const toggleShopOpen = useCallback(() => {
    setConfig(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const toggleQueueOpen = useCallback(() => {
    setConfig(prev => ({ ...prev, isQueueOpen: !prev.isQueueOpen }));
  }, []);

  const setBarberStatus = useCallback((barberId: string, status: Barber['status']) => {
    setBarbers(prev =>
      prev.map(b =>
        b.id === barberId
          ? { ...b, status, currentClient: status === 'available' ? undefined : b.currentClient }
          : b
      )
    );
  }, []);

  const getClientEntry = useCallback((whatsapp: string): QueueEntry | undefined => {
    return queue.find(
      e => e.whatsapp === whatsapp && (e.status === 'waiting' || e.status === 'being-served')
    );
  }, [queue]);

  return (
    <QueueContext.Provider
      value={{
        config,
        barbers,
        queue,
        services,
        addToQueue,
        removeFromQueue,
        callClient,
        finishClient,
        toggleShopOpen,
        toggleQueueOpen,
        setBarberStatus,
        getClientEntry,
        cancelEntry,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
