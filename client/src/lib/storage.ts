export type StoredHistoryEntry = { id: string; type: string; title: string; content: string; date: string };

export function limitHistory(entries: StoredHistoryEntry[], limit = 20) {
  return entries.slice(0, limit);
}
