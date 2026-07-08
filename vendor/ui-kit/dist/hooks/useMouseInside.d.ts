import { RefObject } from 'react';
/**
 * Determines whether the mouse is inside the given DOM element.
 *
 * @param {RefObject<HTMLDivElement>} element - The ref object for the DOM element.
 * @returns {boolean} - True if the mouse is inside the element, otherwise false.
 */
export declare const useMouseInside: (element: RefObject<HTMLDivElement>) => boolean;
