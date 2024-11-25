// src/components/NotificationDialog.tsx

import React from 'react'
import { Dialog, Button } from 'konsta/react'
import useNotificationStore from '../store/useNotificationStore'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../animations/bunny.json' // Adjust the path if necessary

const NotificationDialog: React.FC = () => {
    const { open: notificationOpen, currentNotification, closeNotification, markAsRead } = useNotificationStore()

    const handleNotificationClose = () => {
        if (currentNotification) {
            markAsRead(currentNotification.id)
        }
        closeNotification()
    }

    // Bunny animation options
    const bunnyAnimationOptions = {
        loop: true,
        autoplay: true,
        animationData: bunnyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    return (
        <>
            {currentNotification && (
                <Dialog opened={notificationOpen} onBackdropClick={handleNotificationClose} className="!m-0 !p-0 rounded-2xl">
                    <div className="p-4 relative">
                        {/* Close Button */}
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleNotificationClose}>
                            ✕
                        </button>
                        {/* Icon or Animation */}
                        <div className="flex items-center justify-center mb-4">
                            {currentNotification.icon || (
                                <div style={{ width: '150px', height: '150px' }}>
                                    <Lottie options={bunnyAnimationOptions} />
                                </div>
                            )}
                        </div>
                        {/* Title */}
                        <div className="text-xl font-bold text-center mb-2">{currentNotification.title}</div>
                        {/* Message */}
                        <div className="text-center mb-4">{currentNotification.text}</div>
                        {/* Close Button */}
                        <Button
                            outline
                            rounded
                            onClick={handleNotificationClose}
                            className="mx-auto"
                            style={{
                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                color: '#fff'
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </Dialog>
            )}
        </>
    )
}

export default NotificationDialog
