/**
 * Utility functions for Vietnamese locale sorting, STT indexing, and column sorting
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = string> {
  key: T | null;
  direction: SortDirection;
}

/**
 * Extracts the last word (given name / tên chính) in a Vietnamese full name for standard alphabetical sorting
 * E.g. "Nguyễn Văn An" -> "An", "Trần Thị Bích" -> "Bích"
 */
export function getVietnameseLastName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || '';
}

/**
 * Compares two values with Vietnamese locale awareness
 */
export function compareVietnameseValues(a: any, b: any, isName: boolean = false): number {
  if (a === null || a === undefined) a = '';
  if (b === null || b === undefined) b = '';

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }

  const strA = String(a).trim();
  const strB = String(b).trim();

  // If sorting full names in Vietnamese, prioritize last word (tên), then full name
  if (isName) {
    const lastNameA = getVietnameseLastName(strA);
    const lastNameB = getVietnameseLastName(strB);
    const lastCompare = lastNameA.localeCompare(lastNameB, 'vi', { sensitivity: 'base', numeric: true });
    if (lastCompare !== 0) return lastCompare;
  }

  return strA.localeCompare(strB, 'vi', { sensitivity: 'base', numeric: true });
}

/**
 * Generic sort function for arrays with Vietnamese collation support
 */
export function sortDataList<T>(
  list: T[],
  sortKey: string | null,
  direction: SortDirection = 'asc',
  valueExtractor?: (item: T, key: string) => any
): T[] {
  if (!sortKey) return list;

  return [...list].sort((itemA, itemB) => {
    let valA: any;
    let valB: any;

    if (valueExtractor) {
      valA = valueExtractor(itemA, sortKey);
      valB = valueExtractor(itemB, sortKey);
    } else {
      valA = (itemA as any)[sortKey];
      valB = (itemB as any)[sortKey];
    }

    const isNameField = sortKey.toLowerCase().includes('name') || 
                        sortKey.toLowerCase().includes('ten') || 
                        sortKey.toLowerCase().includes('gvcn') || 
                        sortKey.toLowerCase().includes('bithu') ||
                        sortKey.toLowerCase().includes('author') ||
                        sortKey.toLowerCase().includes('reportedby');

    const result = compareVietnameseValues(valA, valB, isNameField);
    return direction === 'asc' ? result : -result;
  });
}
