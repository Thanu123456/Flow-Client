import React, { useState } from "react"

import { Button } from "antd"
import { ConfirmModal } from "./Modal"

export const ModalExample: React.FC = () => {
    const[isModalOpen, setIsModalOpen] = useState(false);

    const handleOk = () => {
        console.log(`this is handle okya function speaking`)
    }

    const handleClose = () => {
        console.log(`this is handle on close function speaking`)
        setIsModalOpen(false);
    }

    const handleConfirm = () => {
        console.log(`this is handle confirm function speaking`)
    }

    return(
        <>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Delete this Item?</Button>
            <ConfirmModal isOpen={isModalOpen}
                            onClose={handleClose}
                            onConfirm={handleConfirm}
                            cancelText="NOO Please stop"
                            title="Confrim Dletetion"
                            confirmText="Yes.DElete"
                            message="Are you sure you want to dleete this Product"
                            onOk={handleOk}
            />
        </>
    )
}