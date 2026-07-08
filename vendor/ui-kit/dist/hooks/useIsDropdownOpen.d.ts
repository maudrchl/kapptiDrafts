/**
 * Used with Drawer's and Modal's maskClosable props and Select's onToggleDropdown prop
 * to prevent these overlays from being closed when clicking outside them to close the dropdown of a Select component.
 */
export declare const useIsDropdownOpen: () => {
    isDropdownOpen: boolean;
    handleToggleDropdown: () => void;
};
