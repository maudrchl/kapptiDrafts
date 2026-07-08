import * as React from 'react';
import { ReactNode } from 'react';
import { FormikConfig, FormikValues, useField } from 'formik';
type FormProps = {
    className?: string;
    children: ReactNode;
    validationSchema?: any | (() => any);
    /**
     *  Allows accessing the underlying form element's reference.
     *  Used to interact with the form directly, like triggering form validation or submitting the form programmatically.
     *  For example, you can pass it a formik ref like this : const formikRef = useRef<FormikProps<any>>(null)
     *  And use it like this : formikRef.current?.submitForm()
     */
    innerRef?: any;
};
/**
 * enableReinitialize is used to enable reinitialization of the form when the initialValues changes.
 * For example, when we save a form, and we want to edit it again, we need to reinitialize the form with the new values.
 */
type FormConfig<Values> = Pick<FormikConfig<Values>, 'initialValues' | 'onSubmit' | 'validateOnChange' | 'enableReinitialize'> & FormProps;
/**
 * A Formik form
 */
declare const Form: {
    <Values extends FormikValues>({ className, children, validationSchema, initialValues, innerRef, enableReinitialize, onSubmit, validateOnChange, }: FormConfig<Values>): JSX.Element;
    Input: (props: {
        canCopy?: boolean | undefined;
        disabled?: boolean | undefined;
        fullWidth?: boolean | undefined;
        label?: string | undefined;
        maxLength?: number | undefined;
        name: string;
        placeholder?: string | undefined;
        prefix?: React.ReactNode;
        size?: import("../../../utils").Size | undefined;
        suffix?: React.ReactNode;
        type?: string | undefined;
        borderless?: boolean | undefined;
        onChange?: any;
        mono?: boolean | undefined;
    }) => JSX.Element;
    Select: (props: {
        name: string;
        label?: string | undefined;
        size?: import("../../../utils").Size | undefined;
        options: import("../../Select/Select").Option[];
        defaultValue?: any;
        searchable?: boolean | undefined;
        mode?: import("../../Select/Select").SelectMode | undefined;
        placeholder?: string | undefined;
        width?: string | undefined;
        minWidth?: string | undefined;
        maxWidth?: string | undefined;
        maxSelectedCount?: number | undefined;
        value?: any;
        icon?: any;
        clearable?: boolean | undefined;
        fullWidth?: boolean | undefined;
        withDifferentFullLabel?: boolean | undefined;
        onChange?: ((value: any) => void) | undefined;
        onToggleDropdown?: ((open: boolean) => void) | undefined;
        disabled?: boolean | undefined;
        borderless?: boolean | undefined;
    }) => JSX.Element;
    IconSelector: ({ icons, label, name }: {
        name: string;
        icons: import("../../IconSelector/IconSelector").IconOption[];
        label?: string | undefined;
    }) => JSX.Element;
    PhoneNumberInput: (props: {
        disabled?: boolean | undefined;
        fullWidth?: boolean | undefined;
        label?: string | undefined;
        name: string;
        placeholder?: string | undefined;
        size?: import("../../../utils").Size | undefined;
        onChange?: ((value: string, countryCode: string, countryName?: string | undefined) => void) | undefined;
        international?: boolean | undefined;
    }) => JSX.Element;
    useContext<T = FormikValues>(): import("formik").FormikContextType<T>;
    useField: typeof useField;
};
export default Form;
