import React from "react";
import type { BottomSheetProps, ConfirmModalProps, DetailModalProps, DrawerProps, FullScreenModalProps, ImageModalProps } from "./Modal.types";
import { Button, Drawer, Modal, Tabs } from "antd";

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

// export const FormModal: React.FC<FormModalProps> = ({
//     isOpen,
//     onClose,
//     footer,
//     onSubmit,
//     isSubmitting,
//     submitText,
//     cancelText,
//     ...props
// }) => {
//     return(
//         <>
//             <Modal
            
//                 open={isOpen}
//                 title={title}
//                 onCancel={onClose}
//                 cancelText={cancelText}
//                 footer={[
//                     <Button key="Cancel" onClick={onClose}> 
//                         {cancelText || 'Cancel'}
//                     </Button>,
//                     <Button key="confirm" onClick={() => console.log("help needed to implement forms here")}> 
//                         {'Confirm'}
//                     </Button>
//                 ]}

//             >
//                 Implement after form implementation
//             </Modal>
//         </>
//     )
// }

export const DetailModal: React.FC<DetailModalProps> = ({
    isOpen,
    onClose,
    title,
    style,
    tabs,
    ...props
})=>{
    return(
        <>
            <Modal
                    open={isOpen}
                    onCancel={onClose}
                    title={title || "Detailed Summary"}
                    footer={null}
                    style={style}>

                {tabs && tabs.length > 0 ? (
                    <Tabs
                    
                        defaultActiveKey={tabs[0].id}
                        items={tabs.map((tab) => ({
                            key:tab.id,
                            label:tab.label,
                            children:tab.content
                        }))}/>
                ) : (
                    <p>No details available currently</p>
                )}

            </Modal>
        </>
    )
}

export const ImageModel:React.FC<ImageModalProps> = ({
    src,
    alt,
    allowDownload,
    isOpen,
    title,
    size,
    ...props
}) => {
    return (
        <>
            <Modal
                open={isOpen}
                title={title}
                onCancel={props.onClose}>

                    <img src={src} alt={alt || 'Image Preview'} style={{width:'25%'}}/>
                    {allowDownload && (
                        <a href={src} download>
                            Download
                        </a>
                    )}
            </Modal>
        </>
    )
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
    isOpen,
    onClose,
    title,
    style,
    footer,
    content,
    ...props
}) => {
    return (
        <>
            <Modal
            
                open={isOpen}
                onCancel={onClose}
                title={title}
                footer={footer}
                closable={true}
                centered={true}
                width="100vw"
                style={{
                    top:0,
                    margin:0,
                    padding: 0,
                    height: "100vh",
                    maxWidth:"100vw",
                    ...style,
                }}                                   
                {...props}>

                    {content}
            </Modal>
        </>
    )
}

export const DrawerModal:React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    position,
    width,
    content,
    ...props
}) => {
    return (
        <>
            <Drawer
                open={isOpen}
                autoFocus={true}
                footer={props.footer}
                style={props.style}
                title={title}
                placement={position}
                onClose={onClose}
                >
                    {content}
                
            </Drawer>
        </>
    )
}

export const BottomSheet:React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    snapPoints,
    defaultSnap,
    enableSwipeToClose = true,
    content,
    ...props
}) => {
    return (
        <>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: isOpen ? 0 : '-100%',
                        height: defaultSnap,
                        width: '100%',
                        backgroundColor: 'gray',
                        transition: 'bottom 0.5s ease-in-out',
                        ...props.style
                    }}

                >
                    {content} {/*should include a closing button when */}
                </div>
            )}
        </>
    )
}

