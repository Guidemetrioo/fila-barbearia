'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Barber, QueueEntry, Service, ShopConfig, Dependent } from '@/types';
import { shopConfig as defaultConfig, initialBarbers, services as defaultServices } from '@/data/shopConfig';

interface QueueContextType {
  config: ShopConfig;
  barbers: Barber[];
  queue: QueueEntry[];
  services: Service[];
  addToQueue: (
    clientName: string,
    whatsapp: string,
    selectedServices: Service[],
    barberId?: string,
    dependents?: Dependent[]
  ) => void;
  removeFromQueue: (id: string) => void;
  callClient: (entryId: string, barberId: string) => void;
  finishClient: (entryId: string) => void;
  toggleShopOpen: () => void;
  toggleQueueOpen: () => void;
  setBarberStatus: (barberId: string, status: Barber['status']) => void;
  getClientEntry: (whatsapp: string) => QueueEntry | undefined;
  cancelEntry: (id: string) => void;
  getBarberQueue: (barberId: string) => QueueEntry[];
  getBarberWaitTime: (barberId: string) => number;
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

  const getBarberQueue = useCallback(
    (barberId: string) => {
      return queue.filter(
        e => e.status === 'waiting' && (e.barberId === barberId || !e.barberId)
      );
    },
    [queue]
  );

  const getBarberWaitTime = useCallback(
    (barberId: string): number => {
      const barber = barbers.find(b => b.id === barberId);
      if (!barber || barber.status === 'available') {
        const waitingForThisBarber = queue.filter(
          e => e.status === 'waiting' && e.barberId === barberId
        );
        if (waitingForThisBarber.length === 0) return 0;
      }

      // Calculate total duration of current client + waiting clients for this barber
      let totalMinutes = barber?.status === 'busy' ? 35 : 0;
      const waiting = queue.filter(
        e => e.status === 'waiting' && (e.barberId === barberId || !e.barberId)
      );

      for (const entry of waiting) {
        const clientDuration = entry.services.reduce((acc, s) => acc + s.duration, 0);
        const dependentsDuration = (entry.dependents || []).reduce(
          (acc, dep) => acc + dep.services.reduce((dAcc, s) => dAcc + s.duration, 0),
          0
        );
        totalMinutes += clientDuration + dependentsDuration;
      }

      return Math.max(0, totalMinutes);
    },
    [barbers, queue]
  );

  const calculateEstimatedWait = useCallback(
    (position: number, barberId?: string): number => {
      if (barberId) {
        return getBarberWaitTime(barberId);
      }
      const avgServiceTime = 35;
      const activeBarbers = barbers.filter(b => b.status === 'available' || b.status === 'busy').length || 1;
      return Math.ceil((position / activeBarbers) * avgServiceTime);
    },
    [barbers, getBarberWaitTime]
  );

  const recalculatePositions = useCallback(
    (currentQueue: QueueEntry[]): QueueEntry[] => {
      const waitingEntries = currentQueue.filter(e => e.status === 'waiting');
      return currentQueue.map(entry => {
        if (entry.status !== 'waiting') return entry;
        const pos = waitingEntries.findIndex(e => e.id === entry.id) + 1;
        return {
          ...entry,
          position: pos,
          estimatedWait: calculateEstimatedWait(pos, entry.barberId),
        };
      });
    },
    [calculateEstimatedWait]
  );

  const addToQueue = useCallback(
    (
      clientName: string,
      whatsapp: string,
      selectedServices: Service[],
      barberId?: string,
      dependents?: Dependent[]
    ) => {
      const waitingCount = queue.filter(e => e.status === 'waiting').length;
      const position = waitingCount + 1;

      const chosenBarber = barbers.find(b => b.id === barberId);

      const newEntry: QueueEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientName,
        whatsapp,
        services: selectedServices,
        barberId: barberId && barberId !== 'any' ? barberId : undefined,
        barberName: chosenBarber ? chosenBarber.name : undefined,
        dependents: dependents || [],
        status: 'waiting',
        position,
        joinedAt: Date.now(),
        estimatedWait: calculateEstimatedWait(position, barberId),
      };

      setQueue(prev => [...prev, newEntry]);
    },
    [queue, barbers, calculateEstimatedWait]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      setQueue(prev => {
        const updated = prev.filter(e => e.id !== id);
        return recalculatePositions(updated);
      });
    },
    [recalculatePositions]
  );

  const cancelEntry = useCallback(
    (id: string) => {
      setQueue(prev => {
        const updated = prev.map(e =>
          e.id === id ? { ...e, status: 'cancelled' as const } : e
        );
        return recalculatePositions(updated.filter(e => e.status !== 'cancelled'));
      });
    },
    [recalculatePositions]
  );

  const callClient = useCallback(
    (entryId: string, barberId: string) => {
      const barberObj = barbers.find(b => b.id === barberId);
      setQueue(prev =>
        recalculatePositions(
          prev.map(e =>
            e.id === entryId
              ? {
                  ...e,
                  status: 'being-served' as const,
                  barberId,
                  barberName: barberObj?.name,
                  position: 0,
                }
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
    },
    [barbers, recalculatePositions]
  );

  const finishClient = useCallback(
    (entryId: string) => {
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
    },
    [queue, recalculatePositions]
  );

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

  const getClientEntry = useCallback(
    (whatsapp: string): QueueEntry | undefined => {
      const cleanPhone = whatsapp.replace(/\D/g, '');
      return queue.find(
        e =>
          e.whatsapp.replace(/\D/g, '') === cleanPhone &&
          (e.status === 'waiting' || e.status === 'being-served')
      );
    },
    [queue]
  );

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
        getBarberQueue,
        getBarberWaitTime,
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
