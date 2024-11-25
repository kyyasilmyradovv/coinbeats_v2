// src/components/NotificationBell.tsx

import React, { useState, useEffect } from 'react'
import { Popover, Button } from 'konsta/react'
import { FaBell } from 'react-icons/fa'
import useNotificationStore from '../store/useNotificationStore'

const NotificationBell: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotificationStore()
    const [unreadCount, setUnreadCount] = useState(0)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const count = notifications.filter((notif) => !notif.read).length
        setUnreadCount(count)
    }, [notifications])

    const handleBellClick = (e: React.MouseEvent<HTMLElement>) => {
        setPopoverTarget(e.currentTarget)
        setPopoverOpen(!popoverOpen)
    }

    const handleNotificationClick = (id: number) => {
        markAsRead(id)
    }

    return (
        <>
            <button onClick={handleBellClick} className="relative">
                <FaBell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {unreadCount}
                    </span>
                )}
            </button>
            <Popover opened={popoverOpen} target={popoverTarget} onBackdropClick={() => setPopoverOpen(false)} className="w-72">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Notifications</span>
                        <Button small outline onClick={markAllAsRead}>
                            Mark All as Read
                        </Button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="text-center text-gray-500">No notifications</div>
                    ) : (
                        <ul>
                            {notifications.map((notif) => (
                                <li
                                    key={notif.id}
                                    className={`p-2 rounded-lg mb-1 cursor-pointer ${notif.read ? 'bg-gray-100' : 'bg-blue-100'}`}
                                    onClick={() => handleNotificationClick(notif.id)}
                                >
                                    <div className="font-semibold">{notif.title}</div>
                                    <div className="text-sm">{notif.text}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Popover>
        </>
    )
}

export default NotificationBell
