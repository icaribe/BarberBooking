import { format, isToday, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BUSINESS_HOURS } from '../constants';

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
}

/**
 * Gets a friendly date display
 */
export function getFriendlyDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return 'Hoje';
  }
  
  if (isToday(addDays(dateObj, -1))) {
    return 'Ontem';
  }
  
  if (isToday(addDays(dateObj, 1))) {
    return 'Amanhã';
  }
  
  return formatDate(dateObj, 'dd/MM/yyyy');
}

/**
 * Convert a time string (HH:MM) to minutes since start of day
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since start of day to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Checks if a time is within business hours
 */
export function isWithinBusinessHours(time: string): boolean {
  const minutes = timeToMinutes(time);
  const openMinutes = timeToMinutes(BUSINESS_HOURS.OPEN);
  const closeMinutes = timeToMinutes(BUSINESS_HOURS.CLOSE);
  const lunchStartMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_START);
  const lunchEndMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_END);
  
  return (
    (minutes >= openMinutes && minutes < lunchStartMinutes) ||
    (minutes >= lunchEndMinutes && minutes < closeMinutes)
  );
}

/**
 * Generates available time slots for a given day
 */
export function generateTimeSlots(
  date: Date,
  intervalMinutes: number = 15,
  excludedTimes: string[] = []
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  
  // Start and end of business hours in minutes
  const openMinutes = timeToMinutes(BUSINESS_HOURS.OPEN);
  const closeMinutes = timeToMinutes(BUSINESS_HOURS.CLOSE);
  const lunchStartMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_START);
  const lunchEndMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_END);
  
  // Convert excluded times to minutes
  const excludedTimesMinutes = excludedTimes.map(timeToMinutes);
  
  // Generate morning slots
  for (let i = openMinutes; i < lunchStartMinutes; i += intervalMinutes) {
    const timeStr = minutesToTime(i);
    slots.push({
      time: timeStr,
      available: !excludedTimesMinutes.includes(i)
    });
  }
  
  // Generate afternoon slots
  for (let i = lunchEndMinutes; i < closeMinutes; i += intervalMinutes) {
    const timeStr = minutesToTime(i);
    slots.push({
      time: timeStr,
      available: !excludedTimesMinutes.includes(i)
    });
  }
  
  return slots;
}

/**
 * Check if a time slot is available for a service duration
 */
export function isTimeSlotAvailable(
  startTime: string,
  serviceDurationMinutes: number,
  bookedSlots: string[] = []
): boolean {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + serviceDurationMinutes;
  
  // Check if the service would end after closing time or during lunch
  const lunchStartMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_START);
  const lunchEndMinutes = timeToMinutes(BUSINESS_HOURS.LUNCH_END);
  const closeMinutes = timeToMinutes(BUSINESS_HOURS.CLOSE);
  
  if (endMinutes > closeMinutes) return false;
  if (startMinutes < lunchStartMinutes && endMinutes > lunchStartMinutes) return false;
  
  // Check if any part of the service time overlaps with booked slots
  const bookedStartTimes = bookedSlots.map(timeToMinutes);
  
  for (const bookedStart of bookedStartTimes) {
    if (
      (startMinutes <= bookedStart && endMinutes > bookedStart) ||
      (startMinutes >= bookedStart && startMinutes < bookedStart + 15) // assuming booked slots are 15 min
    ) {
      return false;
    }
  }
  
  return true;
}
