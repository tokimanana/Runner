export type PanelState<T> =
  | { mode: 'idle' }
  | { mode: 'create' }
  | { mode: 'edit'; item: T };
