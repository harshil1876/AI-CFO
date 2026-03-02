export type Result<T> =
  | { ok: true; data: T | null }
  | { ok: false; message: string };
