/// <reference types="react" />
/**
 * 🖱️A hook to do something when the user clicks outside an element.
 * @param callback The code to execute when the user clicks outside the element.
 * @param deps The dependencies for the hook.
 * @return The ref to apply on the element you want to listen for clicks outside.
 */
export declare const useOnClickOutside: (callback: (e: MouseEvent) => void, deps: any[]) => import("react").MutableRefObject<any>;
