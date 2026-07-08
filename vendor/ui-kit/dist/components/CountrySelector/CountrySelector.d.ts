import * as React from 'react';
import { ComponentProps } from 'react';
import Select from '../Select/Select';
type CountryOption = {
    label: string;
    value: string;
    flag: string;
    name: string;
    fullLabel: string;
    searchLabel: string;
    callingCode: string;
};
type CountrySelectorProps = {
    value?: string;
    onChange?: (countryCode: string, countryData?: CountryOption) => void;
    placeholder?: React.ReactNode;
    /** To display calling code next to the country name inside the dropdown. */
    withCallingCode?: boolean;
    /** To display the flag next to the country name inside the dropdown. */
    withFlag?: boolean;
    minimized?: boolean;
    /** To override Antd theme (AntdTheme.tsx) properties for the Select component 🎨 */
    antdSelectThemeOverride?: Record<string, any>;
} & Omit<ComponentProps<typeof Select>, 'value' | 'onChange' | 'options' | 'placeholder' | 'themeOverride'>;
/**
 * 🌍 Country selector component with flags and optional calling codes
 */
declare const CountrySelector: ({ value, onChange, placeholder, withCallingCode, withFlag, minimized, antdSelectThemeOverride: themeOverride, ...selectProps }: CountrySelectorProps) => JSX.Element;
export default CountrySelector;
