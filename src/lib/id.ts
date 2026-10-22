/** Small collision-resistant id helper used across features. */
export const uid = (prefix = "id"): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
