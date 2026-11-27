// Central Date Utilities for YouX GovTech
// WCAG 2.2 Accessible & Dynamic Reference Date Management

const STORAGE_KEY = 'youx_reference_date';

/**
 * Parses a date from various formats into a local Date object without UTC drift.
 */
export function parseDate(input: string | Date | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  // Handle DD/MM/YYYY or DD/MM/YYYY, HH:mm
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split(',')[0].split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day, 12, 0, 0);
      }
    }

    // Handle YYYY-MM-DD or ISO
    if (trimmed.includes('-')) {
      const datePart = trimmed.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 12, 0, 0);
      }
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Returns the current active reference date.
 * If overridden via localStorage, returns the stored date; otherwise returns real system date.
 */
export function getReferenceDate(): Date {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseDate(stored);
        if (parsed) return parsed;
      }
    } catch {
      // Fallback if localStorage blocked
    }
  }
  return new Date();
}

/**
 * Check if the reference date is currently overridden by demo selector.
 */
export function isReferenceDateOverridden(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

/**
 * Sets or clears the demo reference date in localStorage.
 * Dispatches a custom event to notify all listeners.
 */
export function setReferenceDate(dateStr: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (dateStr && dateStr.trim()) {
      localStorage.setItem(STORAGE_KEY, dateStr.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('youx_reference_date_change', { detail: dateStr }));
  } catch (err) {
    console.error('Error setting reference date:', err);
  }
}

/**
 * Formats a date into Brazilian format (DD/MM/YYYY).
 */
export function formatDateBR(dateInput: string | Date | undefined | null): string {
  const d = parseDate(dateInput);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a Date into standard ISO date string (YYYY-MM-DD).
 */
export function formatDateISO(dateInput: Date | string): string {
  const d = parseDate(dateInput);
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Computes a relative date label (e.g., "Hoje", "Ontem", "Há 3 dias")
 * dynamically calculated from the reference date.
 */
export function getRelativeDateLabel(
  dateInput: string | Date | undefined | null,
  referenceDate: Date = getReferenceDate(),
  options: { includeFullDate?: boolean } = { includeFullDate: true }
): string {
  const target = parseDate(dateInput);
  if (!target) return 'Data não informada';

  // Normalize both dates to midnight local time for calendar day diff
  const refStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = Math.round((targetStart - refStart) / (24 * 60 * 60 * 1000));

  const dayNumber = target.getDate();
  const monthName = MONTH_NAMES_PT[target.getMonth()];
  const year = target.getFullYear();

  if (diffDays === 0) {
    return options.includeFullDate 
      ? `Hoje (${dayNumber} de ${monthName})`
      : 'Hoje';
  }

  if (diffDays === -1) {
    return options.includeFullDate 
      ? `Ontem (${dayNumber} de ${monthName})`
      : 'Ontem';
  }

  if (diffDays === 1) {
    return options.includeFullDate 
      ? `Amanhã (${dayNumber} de ${monthName})`
      : 'Amanhã';
  }

  if (diffDays < -1 && diffDays >= -6) {
    return `Há ${Math.abs(diffDays)} dias`;
  }

  if (diffDays > 1 && diffDays <= 6) {
    return `Em ${diffDays} dias`;
  }

  // Older or further in the future: format full date
  return `${dayNumber} de ${monthName} de ${year}`;
}

/**
 * Calculates deadline date = sprintStartDate - (leadDays + slackDays).
 * Returns YYYY-MM-DD.
 */
export function calculateDeadline(
  sprintStartDate: string | Date,
  leadDays: number,
  slackDays: number = 5
): string {
  const sprintStart = parseDate(sprintStartDate) || new Date();
  const totalDays = leadDays + slackDays;
  const deadlineDate = new Date(sprintStart.getTime() - totalDays * 24 * 60 * 60 * 1000);
  return formatDateISO(deadlineDate);
}
