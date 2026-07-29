'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Barber, QueueEntry, Service, ShopConfig, Dependent, HistoryEntry } from '@/types';
import { shopConfig as defaultConfig, initialBarbers, services as defaultServices } from '@/data/shopConfig';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';

interface QueueContextType {
  config: ShopConfig;
  barbers: Barber[];
  queue: QueueEntry[];
  services: Service[];
  history: HistoryEntry[];
  addToQueue: (
    clientName: string,
    whatsapp: string,
    selectedServices: Service[],
    barberId?: string,
    dependents?: Dependent[],
    scheduledTime?: string,
    scheduledDate?: string
  ) => void;
  removeFromQueue: (id: string) => void;
  callClient: (entryId: string, barberId: string) => void;
  finishClient: (entryId: string) => void;
  toggleShopOpen: () => void;
  toggleQueueOpen: () => void;
  setBarberStatus: (barberId: string, status: Barber['status'], breakMinutes?: number) => void;
  getClientEntry: (whatsapp: string) => QueueEntry | undefined;
  cancelEntry: (id: string) => void;
  getBarberQueue: (barberId: string) => QueueEntry[];
  getBarberWaitTime: (barberId: string) => number;
  clearHistory: () => void;
  loadDemoData: () => void;
  clearQueue: () => void;
  updateService: (serviceId: string, price: number, duration: number) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Firebase database paths
const DB_PATHS = {
  queue: 'queue',
  barbers: 'barbers',
  config: 'config',
  history: 'history',
  services: 'services',
};

export function QueueProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ShopConfig>(defaultConfig);
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ===== FIREBASE REAL-TIME LISTENERS =====
  // These listeners auto-update state whenever ANY device writes to Firebase
  useEffect(() => {
    // Listen to queue changes
    const queueRef = ref(database, DB_PATHS.queue);
    const unsubQueue = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase stores objects, convert to array
        const entries: QueueEntry[] = Object.values(data);
        // Ensure data integrity
        const sanitized = entries.map(e => ({
          ...e,
          services: Array.isArray(e?.services) ? e.services : [],
          dependents: Array.isArray(e?.dependents) ? e.dependents : [],
          mode: e?.mode || 'queue' as const,
        }));
        setQueue(sanitized);
      } else {
        setQueue([]);
      }
    });

    // Listen to barbers changes
    const barbersRef = ref(database, DB_PATHS.barbers);
    const unsubBarbers = onValue(barbersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const barbersList: Barber[] = Object.values(data);
        setBarbers(barbersList);
      }
      // If no data in Firebase yet, keep defaults (will be written on first action)
    });

    // Listen to config changes
    const configRef = ref(database, DB_PATHS.config);
    const unsubConfig = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setConfig({ ...defaultConfig, ...data, name: defaultConfig.name });
      }
    });

    // Listen to history changes
    const historyRef = ref(database, DB_PATHS.history);
    const unsubHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries: HistoryEntry[] = Object.values(data);
        const sanitized = entries.map(h => ({
          ...h,
          services: Array.isArray(h?.services) ? h.services : [],
          dependents: Array.isArray(h?.dependents) ? h.dependents : [],
        }));
        // Sort by completedAt descending (newest first)
        sanitized.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
        setHistory(sanitized);
      } else {
        setHistory([]);
      }
    });

    // Listen to services changes
    const servicesRef = ref(database, DB_PATHS.services);
    const unsubServices = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const servicesList: Service[] = Object.values(data);
        setServices(servicesList);
      }
    });

    setIsLoaded(true);

    // Cleanup listeners on unmount
    return () => {
      unsubQueue();
      unsubBarbers();
      unsubConfig();
      unsubHistory();
      unsubServices();
    };
  }, []);

  // ===== HELPER: Write full queue to Firebase =====
  const writeQueueToFirebase = useCallback((entries: QueueEntry[]) => {
    setQueue(entries);
    try {
      const queueObj: Record<string, QueueEntry> = {};
      for (const entry of entries) {
        queueObj[entry.id] = entry;
      }
      const sanitized = JSON.parse(JSON.stringify(queueObj));
      set(ref(database, DB_PATHS.queue), sanitized).catch(err => {
        console.error("Firebase write queue error:", err);
      });
    } catch (err) {
      console.error("Firebase queue ref error:", err);
    }
  }, []);

  // ===== HELPER: Write barbers to Firebase =====
  const writeBarbersToFirebase = useCallback((barbersList: Barber[]) => {
    setBarbers(barbersList);
    try {
      const barbersObj: Record<string, Barber> = {};
      for (const barber of barbersList) {
        barbersObj[barber.id] = barber;
      }
      const sanitized = JSON.parse(JSON.stringify(barbersObj));
      set(ref(database, DB_PATHS.barbers), sanitized).catch(err => {
        console.error("Firebase write barbers error:", err);
      });
    } catch (err) {
      console.error("Firebase barbers ref error:", err);
    }
  }, []);

  // ===== HELPER: Write config to Firebase =====
  const writeConfigToFirebase = useCallback((newConfig: ShopConfig) => {
    setConfig(newConfig);
    try {
      const sanitized = JSON.parse(JSON.stringify(newConfig));
      set(ref(database, DB_PATHS.config), sanitized).catch(err => {
        console.error("Firebase write config error:", err);
      });
    } catch (err) {
      console.error("Firebase config ref error:", err);
    }
  }, []);

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

      let totalMinutes = barber?.status === 'busy' ? 35 : 0;
      const waiting = queue.filter(
        e => e.status === 'waiting' && (e.barberId === barberId || !e.barberId)
      );

      for (const entry of waiting) {
        const clientDuration = (entry.services || []).reduce((acc, s) => acc + (s?.duration || 0), 0);
        const dependentsDuration = (entry.dependents || []).reduce(
          (acc, dep) => acc + (dep?.services || []).reduce((dAcc, s) => dAcc + (s?.duration || 0), 0),
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

  // ===== ACTIONS: All write to Firebase instead of localStorage =====

  const addToQueue = useCallback(
    (
      clientName: string,
      whatsapp: string,
      selectedServices: Service[],
      barberId?: string,
      dependents?: Dependent[],
      scheduledTime?: string,
      scheduledDate?: string
    ) => {
      const waitingCount = queue.filter(e => e.status === 'waiting').length;
      const position = waitingCount + 1;

      const chosenBarber = barbers.find(b => b.id === barberId);
      const isScheduled = !!scheduledTime;

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
        estimatedWait: isScheduled ? 0 : calculateEstimatedWait(position, barberId),
        mode: isScheduled ? 'scheduled' : 'queue',
        scheduledTime: scheduledTime || undefined,
        scheduledDate: scheduledDate || undefined,
      };

      // Write to Firebase — all devices will receive this via onValue listener
      const newQueue = [...queue, newEntry];
      writeQueueToFirebase(newQueue);
    },
    [queue, barbers, calculateEstimatedWait, writeQueueToFirebase]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      const updated = queue.filter(e => e.id !== id);
      const recalculated = recalculatePositions(updated);
      writeQueueToFirebase(recalculated);
    },
    [queue, recalculatePositions, writeQueueToFirebase]
  );

  const cancelEntry = useCallback(
    (id: string) => {
      const updated = queue.filter(e => e.id !== id);
      const recalculated = recalculatePositions(updated);
      writeQueueToFirebase(recalculated);
    },
    [queue, recalculatePositions, writeQueueToFirebase]
  );

  const callClient = useCallback(
    (entryId: string, barberId: string) => {
      const barberObj = barbers.find(b => b.id === barberId);

      const updatedQueue = queue.map(e =>
        e.id === entryId
          ? {
              ...e,
              status: 'being-served' as const,
              barberId,
              barberName: barberObj?.name,
              position: 0,
            }
          : e
      );
      const recalculated = recalculatePositions(updatedQueue);
      writeQueueToFirebase(recalculated);

      const updatedBarbers = barbers.map(b =>
        b.id === barberId
          ? { ...b, status: 'busy' as const, currentClient: entryId }
          : b
      );
      writeBarbersToFirebase(updatedBarbers);
    },
    [barbers, queue, recalculatePositions, writeQueueToFirebase, writeBarbersToFirebase]
  );

  const finishClient = useCallback(
    (entryId: string) => {
      const entry = queue.find(e => e.id === entryId);
      if (!entry) return;

      // Calculate total price
      const totalPrice = (entry.services || []).reduce((sum, s) => sum + (s?.price || 0), 0) +
        (entry.dependents || []).reduce(
          (sum, d) => sum + (d?.services || []).reduce((s, sv) => s + (sv?.price || 0), 0), 0
        );

      const historyItem: HistoryEntry = {
        id: entry.id,
        clientName: entry.clientName,
        whatsapp: entry.whatsapp,
        services: entry.services || [],
        barberId: entry.barberId || '',
        barberName: entry.barberName || '',
        dependents: entry.dependents || [],
        joinedAt: entry.joinedAt,
        completedAt: Date.now(),
        totalPrice,
      };

      // Write history item to Firebase
      const historyRef = ref(database, `${DB_PATHS.history}/${historyItem.id}`);
      set(historyRef, JSON.parse(JSON.stringify(historyItem)));

      // Update barber status
      if (entry.barberId) {
        const updatedBarbers = barbers.map(b =>
          b.id === entry.barberId
            ? { ...b, status: 'available' as const, currentClient: undefined }
            : b
        );
        writeBarbersToFirebase(updatedBarbers);
      }

      // Remove from queue
      const updatedQueue = queue.filter(e => e.id !== entryId);
      const recalculated = recalculatePositions(updatedQueue);
      writeQueueToFirebase(recalculated);
    },
    [queue, barbers, recalculatePositions, writeQueueToFirebase, writeBarbersToFirebase]
  );

  const toggleShopOpen = useCallback(() => {
    const newConfig = { ...config, isOpen: !config.isOpen };
    setConfig(newConfig);
    writeConfigToFirebase(newConfig);
  }, [config, writeConfigToFirebase]);

  const toggleQueueOpen = useCallback(() => {
    const newConfig = { ...config, isQueueOpen: !config.isQueueOpen };
    setConfig(newConfig);
    writeConfigToFirebase(newConfig);
  }, [config, writeConfigToFirebase]);

  const setBarberStatus = useCallback((barberId: string, status: Barber['status'], breakMinutes?: number) => {
    const breakUntil = status === 'break' && breakMinutes ? Date.now() + breakMinutes * 60 * 1000 : undefined;
    const updatedBarbers = barbers.map(b =>
      b.id === barberId
        ? {
            ...b,
            status,
            currentClient: status === 'available' ? undefined : b.currentClient,
            breakUntil: status === 'break' ? breakUntil : undefined,
            breakMinutes: status === 'break' ? breakMinutes : undefined,
          }
        : b
    );
    writeBarbersToFirebase(updatedBarbers);
  }, [barbers, writeBarbersToFirebase]);

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

  const clearHistory = useCallback(() => {
    set(ref(database, DB_PATHS.history), null);
  }, []);

  const loadDemoData = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const demoQueue: QueueEntry[] = [
      {
        id: 'demo-1',
        clientName: 'Gabriel Santos',
        whatsapp: '(11) 98123-4567',
        services: [defaultServices[0], defaultServices[1]],
        barberId: 'barber-1',
        barberName: 'LUCAS',
        status: 'being-served',
        position: 0,
        joinedAt: Date.now() - 25 * 60000,
        estimatedWait: 0,
        mode: 'queue',
      },
      {
        id: 'demo-2',
        clientName: 'Carlos Eduardo',
        whatsapp: '(11) 97654-3210',
        services: [defaultServices[0]],
        barberId: 'barber-1',
        barberName: 'LUCAS',
        status: 'waiting',
        position: 1,
        joinedAt: Date.now() - 15 * 60000,
        estimatedWait: 15,
        mode: 'queue',
      },
      {
        id: 'demo-3',
        clientName: 'Felipe Amorim',
        whatsapp: '(11) 99887-6655',
        services: [defaultServices[2]],
        barberId: 'barber-2',
        barberName: 'RAFAEL',
        status: 'waiting',
        position: 2,
        joinedAt: Date.now() - 10 * 60000,
        estimatedWait: 35,
        mode: 'queue',
      },
      {
        id: 'demo-4',
        clientName: 'Marcelo Oliveira',
        whatsapp: '(11) 95544-3322',
        services: [defaultServices[0]],
        barberId: undefined,
        barberName: undefined,
        status: 'waiting',
        position: 3,
        joinedAt: Date.now() - 5 * 60000,
        estimatedWait: 50,
        mode: 'scheduled',
        scheduledTime: '15:00',
        scheduledDate: todayStr,
      },
    ];

    const demoBarbers: Barber[] = [
      { id: 'barber-1', name: 'LUCAS', avatar: '/images/barber1.png', status: 'busy', currentClient: 'demo-1' },
      { id: 'barber-2', name: 'RAFAEL', avatar: '/images/barber2.png', status: 'available' },
      { id: 'barber-3', name: 'MATHEUS', avatar: '/images/barber3.png', status: 'available' },
    ];

    writeQueueToFirebase(demoQueue);
    writeBarbersToFirebase(demoBarbers);
    const newConfig = { ...config, isOpen: true, isQueueOpen: true };
    writeConfigToFirebase(newConfig);
  }, [config, writeQueueToFirebase, writeBarbersToFirebase, writeConfigToFirebase]);

  const clearQueue = useCallback(() => {
    writeQueueToFirebase([]);
    const resetBarbers = barbers.map(b => ({ ...b, status: 'available' as const, currentClient: undefined }));
    writeBarbersToFirebase(resetBarbers);
  }, [barbers, writeQueueToFirebase, writeBarbersToFirebase]);

  const updateService = useCallback((serviceId: string, newPrice: number, newDuration: number) => {
    setServices(prev => {
      const updated = prev.map(s => s.id === serviceId ? { ...s, price: newPrice, duration: newDuration } : s);
      try {
        const cleanObj = JSON.parse(JSON.stringify(updated));
        set(ref(database, DB_PATHS.services), cleanObj);
      } catch (err) {
        console.error('Firebase services write error:', err);
      }
      return updated;
    });
  }, []);

  return (
    <QueueContext.Provider
      value={{
        config,
        barbers,
        queue,
        services,
        history,
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
        clearHistory,
        loadDemoData,
        clearQueue,
        updateService,
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
