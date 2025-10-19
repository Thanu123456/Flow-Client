import React, { useState } from "react"

import { Button } from "antd"
import { BottomSheet, ConfirmModal, DetailModal, DrawerModal, FullScreenModal, ImageModel } from "./Modal"
import { Content } from "antd/es/layout/layout";

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

    const content: React.ReactNode = (
        <div>
            <p>This is test content to check the full screen modal
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Excepturi expedita reiciendis voluptatem enim rerum, dicta impedit iusto, perferendis, blanditiis quidem quas quasi repellat quo dolore? Quasi atque sunt deleniti quia!
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil veritatis nulla laboriosam, iusto culpa sit. Ab pariatur hic magni sed, amet ratione cupiditate accusantium quae incidunt. Quas inventore repellendus aliquid.
            </p>
        </div>
    )

    const data: Record<string, string> = {};

    return(
        <>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Delete this Item?</Button>
            {/* <ConfirmModal isOpen={isModalOpen}
                            onClose={handleClose}
                            onConfirm={handleConfirm}
                            cancelText="NOO Please stop"
                            title="Confrim Dletetion"
                            confirmText="Yes.Delete"
                            message="Are you sure you want to dleete this Product"
                            onOk={handleOk}
            /> */}

            <br/><br/>

            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Detailed Modal with Tabs
            </Button>

            {/* <DetailModal
            
                isOpen={isModalOpen}
                onClose={handleClose}
                tabs={[
                    {
                        id:"item 1",
                        label: "Product 1",
                        content: (
                            <div>
                                <p>Product</p>
                                <p>Category: music</p>
                            </div>
                        )
                    },

                    {
                        id:"item 2",
                        label: "Product 2",
                        content: (
                            <div>
                                <p>Product 2</p>
                                <p>Category: Vegitables</p>
                            </div>
                        )
                    },

                ]}/> */}

                <br/><br/>

                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Image Modal View
                </Button>

                {/* <ImageModel
                
                    src="vite.svg"
                    alt="Test Picture"
                    allowDownload={true}
                    footer={null}
                    title="Test Picture demostration"
                    size="large"
                    onClose={handleClose}
                    isOpen={isModalOpen}
                    /> */}

            <br/><br/>

            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Full Screen Modal
            </Button>

            {/* <FullScreenModal
            
                isOpen={isModalOpen}
                onClose={handleClose}
                title="Full Screen Modal example"
                footer={null}
                content={content}/> */}

            <br/><br/>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Drawer Component
            </Button>

            {/* <DrawerModal
                footer={null}
                title="Drawer Title"
                position="left"
                onClose={handleClose}
                isOpen={isModalOpen}
                content={content}
                style={{
                    color:'orange'
                }}/> */}

            <br/><br/>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Bottom Sheet
            </Button>
            <BottomSheet
                
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    snapPoints={['30%', '70%', '100%']}
                    defaultSnap="30%"
                    content={content}
                    />
        </>
    )
}