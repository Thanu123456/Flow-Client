import React from "react";
import type { ConfirmModalProps, FormModalProps } from "./Modal.types";
import { Button, message, Modal } from "antd";
import { title } from "process";

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    message,
    confirmText,
    cancelText,
    onConfirm,
    title,
    onClose,
    ...props
})=>{
    return (
        <Modal
            open={isOpen}
            title={title}
            onCancel={onClose}
            footer={[
                <Button key="Cancel" onClick={onClose}> 
                    {cancelText || 'Cancel'}
                </Button>,
                <Button key="confirm" onClick={onConfirm}> 
                    {confirmText || 'Confirm'}
                </Button>

            ]}
            {...props}
        >
            {message}
        </Modal>
    )
}

export const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    footer,
    onSubmit,
    isSubmitting,
    submitText,
    cancelText,
    ...props
}) => {
    return(
        <>
            <Modal
            
                open={isOpen}
                title={title}
                onCancel={onClose}
                cancelText={cancelText}
                footer={[
                    <Button key="Cancel" onClick={onClose}> 
                        {cancelText || 'Cancel'}
                    </Button>,
                    <Button key="confirm" onClick={() => console.log("help needed to implement forms here")}> 
                        {'Confirm'}
                    </Button>
                ]}

            >

            </Modal>
        </>
    )
}