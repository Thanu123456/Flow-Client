import React, { Children, useState } from "react"
import type { FormActionsProp, FormFieldProp, FormRowProp, FormSectionProp, FormWrapperValidationProp, InlineEditformProp } from "./Form.types"
import { Button, Card, Col, Form, Input, Row, Space } from "antd"

export const FormWrapper: React.FC<FormWrapperValidationProp> = ({
    disabled,
    onSubmit,
    children,
    scrollToFirsterror,
    ...props
}) => {
    return (
        <>
            <Form
            
                layout={props.layout}
                onFinish={onSubmit}
                scrollToFirstError={scrollToFirsterror}
                >
                    {children}
            </Form>
        </>
    )

}

export const FormField: React.FC<FormFieldProp> = ({
    colon,
    hidden,
    label,
    name,
    required,
    ...props
}) => {
    return (
        <>
            <Form.Item
            
                colon={colon}
                hidden={hidden}
                label={label}
                name={name}
                >

                    {props.children ? props.children : <input/>}
            </Form.Item>
        </>
    )
}

export const FormSection: React.FC<FormSectionProp> = ({
    sectionTitle,
    ...props
}) => {
    return (
        <Card title={sectionTitle} style={{ marginBottom: "16px" }}>
        { props.children}
        </Card>
    )
}

export const FormRow: React.FC<FormRowProp> = ({
    children,
    gutter,
    colSpan,
}) => {
    return (
        <Row gutter={gutter}>
            {React.Children.map(children, (child) => (
                <Col span={colSpan}>{child}</Col>
            ))}
        </Row>
    )
}

export const FormActions: React.FC<FormActionsProp> = ({
    onCancel,
    onSubmit,
    submitText,
    cancelText,
    buttonType,
}) => {
    return(
        <Space style={{ marginTop: "16px" }}>
            {onCancel && <Button onClick={onCancel}>{cancelText}</Button>}
            {onSubmit && (
                <Button type={buttonType} onClick={onSubmit}>
                    {submitText}
                </Button>
            )}
        </Space>
    )
}

export const InlineEditForm: React.FC<InlineEditformProp> = ({
    value,
    onSave,
}) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleSave = () => {
        onSave(inputValue);
        setEditing(false);
    };

    const handleCancel = () => {
        setInputValue(value);
        setEditing(false);
    };

    return editing ? (
        <Space>
        <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            size="small"
        />
        <Button onClick={handleSave} type="primary" size="small">
            Save
        </Button>
        <Button onClick={handleCancel} size="small">
            Cancel
        </Button>
        </Space>
    ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
            {value || <i>Click to edit</i>}
        </div>
    );
}