import { PressableKeys } from './utils';
declare const useMultiKeyPress: <T extends PressableKeys[]>(keysToWatch?: T | undefined, callback?: ((keys: PressableKeys[]) => void) | undefined) => PressableKeys[];
export { useMultiKeyPress };
