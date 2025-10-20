import type { FormLayout } from "antd/es/form/Form";
import type React from "react";

export interface FormProps {
    initialValues?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void;
    children: React.ReactNode;
    className?:string;
    //content?: React.ReactNode;
}

export interface FormWrapperValidationProp extends FormProps {
    disabled?:boolean;
    scrollToFirsterror?: boolean;
    layout?:FormLayout;
}

export interface FormFieldProp extends FormProps{
    colon?: boolean;
    hidden?: boolean;
    label?:string;
    name?:string;
    required?: boolean;
}

export interface FormSectionProp extends FormProps{
    sectionTitle?:string;
}

export interface FormRowProp extends FormProps{
    gutter?: number;
    colSpan?: number;
}

export interface FormActionsProp extends FormProps{
    onCancel?: () => void;
    submitText?: string;
    cancelText?: string;
    buttonType?: "link" | "default" | "text" | "primary" | "dashed" | undefined;
}

export interface InlineEditformProp extends FormProps{
    value:string;
    onSave: (newValue:string) => void;
}
