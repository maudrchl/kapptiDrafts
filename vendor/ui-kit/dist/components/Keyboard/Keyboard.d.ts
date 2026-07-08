/// <reference types="react" />
import { PressableKeys } from './utils';
type KeyboardProps = {
    pressedKeys: Set<PressableKeys>;
    setPressedKeys: (keys: Set<PressableKeys>) => void;
};
declare const Keyboard: ({ pressedKeys, setPressedKeys }: KeyboardProps) => JSX.Element;
export default Keyboard;
