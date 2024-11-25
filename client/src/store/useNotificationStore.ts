// src/store/useNotificationStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from '../api/axiosInstance'

interface NotificationItem {
    id: number
    text: string
    title: string
    icon: React.ReactNode | null
    type: string
    read: boolean
}

interface NotificationState {
    notifications: NotificationItem[]
    open: boolean
    currentNotification: NotificationItem | null
    fetchNotifications: () => Promise<void>
    setNotifications: (notifications: NotificationItem[]) => void
    showNotification: (notification: NotificationItem) => void
    closeNotification: () => void
    markAsRead: (notificationId: number) => Promise<void>
    markAllAsRead: () => Promise<void>
}

const useNotificationStore = create<NotificationState>()(
    devtools((set, get) => ({
        notifications: [],
        open: false,
        currentNotification: null,
        fetchNotifications: async () => {
            try {
                const response = await axios.get('/api/notifications')
                const notifications = response.data.map((notif: any) => ({
                    id: notif.id,
                    text: notif.message,
                    title: notif.type === 'LEVEL_UP' ? 'Level Up!' : 'Notification',
                    icon: null,
                    type: notif.type,
                    read: notif.read
                }))
                get().setNotifications(notifications)
                // If there are unread notifications, show the first one
                const unreadNotifications = notifications.filter((n) => !n.read)
                if (unreadNotifications.length > 0) {
                    get().showNotification(unreadNotifications[0])
                }
            } catch (error) {
                console.error('Error fetching notifications:', error)
            }
        },
        setNotifications: (notifications) => set({ notifications }),
        showNotification: (notification) => set({ currentNotification: notification, open: true }),
        closeNotification: () => set({ open: false }),
        markAsRead: async (notificationId) => {
            try {
                await axios.post(`/api/notifications/${notificationId}/mark-as-read`)
                set((state) => ({
                    notifications: state.notifications.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
                }))
            } catch (error) {
                console.error('Error marking notification as read:', error)
            }
        },
        markAllAsRead: async () => {
            try {
                const { notifications } = get()
                const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
                await Promise.all(unreadIds.map((id) => axios.post(`/api/notifications/${id}/mark-as-read`)))
                set((state) => ({
                    notifications: state.notifications.map((notif) => ({ ...notif, read: true }))
                }))
            } catch (error) {
                console.error('Error marking all notifications as read:', error)
            }
        }
    }))
)

export default useNotificationStore
