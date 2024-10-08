// src/pages/InboxPage.tsx

import React, { useState, useEffect } from 'react'
import axios from '../api/axiosInstance' // Use the configured axios instance
import { Page, Block, Button, ListInput, BlockTitle, Card, Popover, List, ListButton, Notification } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import bunnyLogo from '../images/bunny-mascot.png'

interface Academy {
    id: number
    name: string
    createdAt: string
    logoUrl: string
    coverPhotoUrl: string
    creator: {
        name: string
        email: string
    }
}

const constructImageUrl = (url: string) => {
    return `https://subscribes.lt/${url}`
}

const InboxPage: React.FC = () => {
    const [academies, setAcademies] = useState<Academy[]>([])
    const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({})
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [selectedAcademyId, setSelectedAcademyId] = useState<number | null>(null)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchPendingAcademies = async () => {
            try {
                const response = await axios.get('/api/inbox')
                const data = Array.isArray(response.data) ? response.data : [] // Ensure data is an array
                setAcademies(data)
            } catch (error) {
                console.error('Error fetching pending academies:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPendingAcademies()
    }, [])

    const handleApprove = async () => {
        if (selectedAcademyId !== null) {
            try {
                await axios.post(`/api/inbox/${selectedAcademyId}/approve`)
                setAcademies((prev) => prev.filter((academy) => academy.id !== selectedAcademyId))
                setNotificationText('Academy approved successfully.')
                setNotificationOpen(true)
            } catch (error) {
                console.error('Error approving academy:', error)
                setNotificationText('Failed to approve academy.')
                setNotificationOpen(true)
            }
        }
        setPopoverOpen(false)
        setSelectedAcademyId(null)
    }

    const handleReject = async () => {
        if (selectedAcademyId !== null) {
            try {
                await axios.post(`/api/inbox/${selectedAcademyId}/reject`, {
                    reason: rejectReason[selectedAcademyId] || ''
                })
                setAcademies((prev) => prev.filter((academy) => academy.id !== selectedAcademyId))
                setNotificationText('Academy rejected successfully.')
                setNotificationOpen(true)
                setRejectReason((prev) => ({ ...prev, [selectedAcademyId]: '' }))
            } catch (error) {
                console.error('Error rejecting academy:', error)
                setNotificationText('Failed to reject academy.')
                setNotificationOpen(true)
            }
        }
        setPopoverOpen(false)
        setSelectedAcademyId(null)
    }

    const handleViewApplication = (id: number) => {
        // Implement logic to view the full application details, e.g., navigate to a detailed view page
        console.log(`Viewing application for academy ID: ${id}`)
        // For example:
        // navigate(`/academy/${id}`);
    }

    const openPopover = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedAcademyId(id)
        setPopoverTarget(event.currentTarget)
        setPopoverOpen(true)
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center absolute top-8 !mb-18">
                <BlockTitle large>Inbox</BlockTitle>
            </div>

            <div className="mt-18">
                {loading ? (
                    <Spinner />
                ) : academies.length > 0 ? (
                    academies.map((academy) => (
                        <Block key={academy.id}>
                            <Card
                                className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600"
                                style={{
                                    backgroundImage: `url(${constructImageUrl(academy.coverPhotoUrl)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Background overlay for image */}
                                <div className="absolute inset-0 bg-white dark:bg-black opacity-50 rounded-xl z-0"></div>

                                {/* Content goes here, with a higher z-index to be above the overlay */}
                                <div className="relative z-10 p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2">{academy.name}</h3>
                                            <p className="text-sm">
                                                Creator: {academy.creator?.name} ({academy.creator?.email})
                                            </p>
                                            <p className="text-sm">Submitted on: {new Date(academy.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <img alt={academy.name} className="h-16 w-16 rounded-full" src={constructImageUrl(academy.logoUrl)} />
                                    </div>
                                </div>

                                {/* Button section, also above the overlay */}
                                <div className="flex justify-center w-full relative z-10 mb-2">
                                    <Button
                                        key={`academy-${academy.id}`} // Unique key to ensure each button is unique
                                        className="rounded-full items-center justify-center"
                                        raised
                                        onClick={(e) => openPopover(academy.id, e)} // Ensure correct academy is passed
                                    >
                                        Actions
                                    </Button>
                                </div>
                            </Card>
                        </Block>
                    ))
                ) : (
                    <p className="mx-4 text-center">No pending academies found.</p>
                )}
            </div>

            {/* Popover for actions */}
            <Popover opened={popoverOpen} target={popoverTarget} onBackdropClick={() => setPopoverOpen(false)} onClose={() => setPopoverOpen(false)} angle>
                <div className="text-center p-4">
                    <List>
                        <ListButton onClick={() => handleViewApplication(selectedAcademyId!)}>
                            <span className="text-primary text-lg">View Application</span>
                        </ListButton>
                        <ListInput
                            label="Rejection Reason"
                            type="text"
                            placeholder="Reason for rejection"
                            outline
                            clearButton
                            value={rejectReason[selectedAcademyId!] || ''}
                            onChange={(e) =>
                                setRejectReason((prev) => ({
                                    ...prev,
                                    [selectedAcademyId!]: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                        <ListButton onClick={handleApprove}>
                            <span className="text-green-600 text-lg">Approve</span>
                        </ListButton>
                        <ListButton onClick={handleReject}>
                            <span className="text-red-600 text-lg">Reject</span>
                        </ListButton>
                    </List>
                </div>
            </Popover>

            {/* Notification */}
            <Notification
                className="fixed top-0 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Message from Coinbeats Bunny"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />
        </Page>
    )
}

export default InboxPage
