import { useEffect, useState } from 'react';

const STORAGE_KEY = 'daybook-schedules-v1';

function readSchedules() {
  try {
    const savedSchedules = window.localStorage.getItem(STORAGE_KEY);
    const parsedSchedules = savedSchedules ? JSON.parse(savedSchedules) : [];
    return Array.isArray(parsedSchedules) ? parsedSchedules : [];
  } catch {
    return [];
  }
}

export function useSchedules() {
  const [schedules, setSchedules] = useState(readSchedules);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
  }, [schedules]);

  function addSchedule(schedule) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setSchedules((currentSchedules) => [...currentSchedules, { ...schedule, id }]);
  }

  function updateSchedule(id, updates) {
    setSchedules((currentSchedules) => currentSchedules.map((schedule) => (
      schedule.id === id ? { ...schedule, ...updates } : schedule
    )));
  }

  function deleteSchedule(id) {
    setSchedules((currentSchedules) => currentSchedules.filter((schedule) => schedule.id !== id));
  }

  return { schedules, addSchedule, updateSchedule, deleteSchedule };
}