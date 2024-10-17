// client/src/components/ProductPage/LeaveConfirmationDialog.tsx

import React from 'react'
import { Dialog, Button } from 'konsta/react'
import bunnyImage from '../../images/bunny-head.png'

interface LeaveConfirmationDialogProps {
    opened: boolean
    onConfirm: () => void
    onCancel: () => void
}

const LeaveConfirmationDialog: React.FC<LeaveConfirmationDialogProps> = ({ opened, onConfirm, onCancel }) => {
    return (
        <Dialog opened={opened} onBackdropClick={onCancel} className="rounded-2xl p-2 !w-[80%]">
            <div className="text-center">
                <img src={bunnyImage} alt="Bunny" className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Are you sure you want to leave? Your points may be lost!</p>
                <div className="flex justify-center mt-4 gap-4">
                    <Button
                        rounded
                        outline
                        onClick={onConfirm}
                        style={{
                            color: '#fff'
                        }}
                        className="!text-xs !w-32"
                    >
                        I'm sure
                    </Button>
                    <Button
                        rounded
                        outline
                        onClick={onCancel}
                        className="!text-xs !w-32"
                        style={{
                            background: 'linear-gradient(to left, #ff0077, #7700ff)',
                            color: '#fff'
                        }}
                    >
                        Let's continue
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default LeaveConfirmationDialog
