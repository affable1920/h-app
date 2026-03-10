export function filter<T extends { id: string }>(
  items: T[],
  predicate: (item: T) => boolean,
): T[] {
  return items.filter(predicate);
}
