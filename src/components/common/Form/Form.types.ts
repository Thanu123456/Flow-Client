import { extend } from "dayjs";
import type React from "react";

export interface FormProps {
    initialValues?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void;
    children: React.ReactNode;
    className?:string;
}

export interface FromWrapperValidationProp extends FormProps {}

export interface FormFieldProp extends FormProps{
    //to do implement interface
}

export interface FromSectionProp extends FormProps{
    //to do implement interface
}

export interface FormRowProp extends FormProps{
    //to do implement interface
}

export interface FormActionsProp extends FormProps{
    //to do implement interface
}

export interface InlineEditformProp extends FormProps{
    //to do implement interface
}
