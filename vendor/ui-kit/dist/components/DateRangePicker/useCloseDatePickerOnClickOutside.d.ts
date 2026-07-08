/// <reference types="react" />
/**
 *  🖱️Closes the date picker when clicking outside. ℹ️ We can't let the Antd Popover handle this because we need to
 *  have control over the "open" prop to open the date picker when clicking on "custom" in the shortcut selector.
 *  @return The ref to apply on the date picker
 */
export declare const useCloseDatePickerOnClickOutside: (isTimezoneModalOpen: boolean, closeDatePicker: () => void) => import("react").MutableRefObject<any>;
