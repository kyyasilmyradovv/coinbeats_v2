// OverallRaffleManagementPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, List, ListInput, Button, Card, ListItem, Block, Toggle, Notification, Preloader } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import AddRafflesPage from './AddRafflesPage'
import Spinner from '../components/Spinner'
import bunnyLogo from '../images/bunny-mascot.png'

interface RaffleDataInterface {
    id: number
    minAmount: number
    winnersCount: number
    deadline: string
    reward: string
    isActive: boolean
    academyId: number
    type: string
}

interface RafflesHistoryInterface {
    id: number
    name: string
    startDate: string
    endDate: string
    winnersCount: number
    minRaffles: number
}

interface WinnersInterface {
    id: number
    winningAmount: number
    raffleAmount: number
    user: object
}

interface Academy {
    id: number
    name: string
    createdAt: string
    status: string
    logoUrl: string
    coverPhotoUrl: string
}

interface NotificationInterface {
    title: string
    text: string
}

const OverallRaffleManagementPage: React.FC = () => {
    const [overallRaffles, setOverallRaffles] = useState<Partial<RaffleDataInterface>[]>([])
    const [academies, setAcademies] = useState<Academy[]>([])
    const [rafflesHistory, setRafflesHistory] = useState<RafflesHistoryInterface[]>([])
    const [selectedRaffle, setSelectedRaffle] = useState('')
    const [selectedHistory, setSelectedHistory] = useState<RafflesHistoryInterface | null>(null)
    const [winners, setWinners] = useState<WinnersInterface[]>([])
    const [updatedRaffleIds, setUpdatedRaffleIds] = useState<number[] | undefined>([])
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<NotificationInterface | null>(null)
    const [sendEmailLoading, setSendEmailLoading] = useState(false)
    const [seeHistoryLoading, setSeeHistoryLoading] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [addNewRaffle, setAddNewRaffle] = useState(false)

    const updateOverallRafflesState = (payload: Partial<RaffleDataInterface>) => {
        // Update only the selected raffle in the array
        const updatedRaffles = overallRaffles.map((raffle) => (raffle.id === payload.id ? { ...raffle, ...payload } : raffle))

        setOverallRaffles(updatedRaffles)

        if (!updatedRaffleIds?.includes(payload.id)) {
            setUpdatedRaffleIds((prev) => [...prev, payload?.id])
        }

        // data.deadline = convertToCetTime(data?.deadline)
    }

    const convertToCetTime = (time: string) => {
        const convertedTime = format(new Date(time), "yyyy-MM-dd' 'HH:mm")
        return convertedTime
    }

    useEffect(() => {
        const fetchAcademies = async () => {
            try {
                const response = await axiosInstance.get('/api/academies/my')
                setAcademies(response.data)
            } catch (error) {
                console.error('Error fetching academies:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAcademies()
    }, [])

    useEffect(() => {
        const fetchOverallRaffle = async () => {
            try {
                const response = await axiosInstance.get('/api/raffle/overall')

                for (let r of response.data) {
                    r.deadline = convertToCetTime(r.deadline)
                }

                setOverallRaffles(response.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching overall raffle:', error)
            }
        }
        fetchOverallRaffle()
    }, [])

    const handleSave = async (overallRaffle: RaffleDataInterface) => {
        if (!saveLoading) {
            try {
                setSaveLoading(true)
                await axiosInstance.put(`/api/raffle/overall/${overallRaffle.id}`, overallRaffle)
                setUpdatedRaffleIds((prev) => prev?.filter((e) => e != overallRaffle?.id))
                setNotification({ title: 'Success', text: 'Raffle settings updated' })
            } catch (error) {
                console.error('Error updating raffle text:', error)
                alert('Failed to update raffle text.')
            }
            setSaveLoading(false)
        }
    }

    const fetchHistories = async (id: number, name: string) => {
        if (!seeHistoryLoading) {
            try {
                setSeeHistoryLoading(true)
                const response = await axiosInstance.get(`/api/raffle/history/${id}`)

                setRafflesHistory(response.data)
                setSelectedHistory(null)

                if (!name?.length && overallRaffles[0]?.type === 'PLATFORM') name = 'Overall Coinbeats'
                setSelectedRaffle(name)
            } catch (error) {
                console.error('Error updating raffle text:', error)
                alert('Failed to update raffle text.')
            }
            setSeeHistoryLoading(false)
        }
    }

    const fetchWinners = async (history: RafflesHistoryInterface) => {
        try {
            const response = await axiosInstance.get(`/api/raffle/winners/${history.id}`)
            setWinners(response.data)
            setSelectedHistory(history)
        } catch (error) {
            console.error('Error fetching raffle winners:', error)
        }
    }

    const sendCSVEmail = async () => {
        if (!sendEmailLoading) {
            if (!winners || winners.length === 0) {
                alert('No data to send.')
                return
            }

            setSendEmailLoading(true)

            let fileName = `${selectedHistory?.name?.replace(/[: ]/g, '_')}_Winners_List_${selectedHistory?.endDate}.csv`

            try {
                await axiosInstance.post('/api/download-csv-email', {
                    dataType: 'raffle_winners',
                    data: winners,
                    selectedWalletType: '',
                    fileName
                })

                setNotification({ title: 'Success', text: 'CSV file has been sent to your email.' })
            } catch (error) {
                console.error('Error sending CSV file via email:', error)
                setNotification({ title: 'Fail', text: 'Error sending CSV file via email' })
            }
            setSendEmailLoading(false)
        }
    }

    const handleAffNewRaffle = () => {
        setAddNewRaffle((prev) => !prev)

        // try {
        //     setSaveLoading(true)
        //     await axiosInstance.put(`/api/raffle/overall/${overallRaffle.id}`, overallRaffle)
        //     setUpdatedRaffleIds((prev) => prev?.filter((e) => e != overallRaffle?.id))
        //     setNotification({ title: 'Success', text: 'Raffle settings updated' })
        // } catch (error) {
        //     console.error('Error updating raffle text:', error)
        //     alert('Failed to update raffle text.')
        // }
        // setSaveLoading(false)

        // <AddRafflesPage setOverallRaffles={setOverallRaffles} />
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            {!addNewRaffle && overallRaffles?.length ? (
                <>
                    <BlockTitle large>
                        <p>Raffle Management </p>
                        <Button onClick={() => handleAffNewRaffle()} style={{ width: '120px' }}>
                            New raffle
                        </Button>
                    </BlockTitle>

                    {overallRaffles.map((overallRaffle) => (
                        <List strong inset key={overallRaffle.id} className="p-3">
                            {overallRaffle?.type !== 'PLATFORM' && (
                                <p className="font-bold p-1">
                                    Academy name: {academies?.find((academy) => academy.id === overallRaffle.academyId)?.name || ''}
                                </p>
                            )}
                            <ListInput
                                label="Min Tickets for Winners List"
                                placeholder="Enter minimum tickets number"
                                type="number"
                                outline
                                value={overallRaffle?.minAmount}
                                onChange={(e) => updateOverallRafflesState({ id: overallRaffle.id, minAmount: e.target?.value })}
                                max={100000}
                            />
                            <ListInput
                                label="Winners Count"
                                type="number"
                                outline
                                value={overallRaffle?.winnersCount}
                                onChange={(e) => updateOverallRafflesState({ id: overallRaffle.id, winnersCount: e.target?.value })}
                                placeholder="Enter winners count"
                            />
                            <ListInput
                                label="Raffle End Date"
                                type="datetime-local"
                                outline
                                value={overallRaffle?.deadline}
                                onChange={(e) => updateOverallRafflesState({ id: overallRaffle.id, deadline: e.target?.value })}
                                placeholder="Enter deadline"
                                style={{ colorScheme: 'dark' }}
                            />

                            <ListInput
                                label="Reward"
                                type="string"
                                outline
                                value={overallRaffle?.reward}
                                onChange={(e) => updateOverallRafflesState({ id: overallRaffle.id, reward: e.target?.value })}
                                placeholder="Enter reward with currency"
                                style={{ flex: 1 }}
                            />
                            <Block style={{ display: 'flex', alignItems: 'center' }}>
                                <p style={{ marginRight: '8px' }}>Active</p>
                                <Toggle
                                    checked={overallRaffle?.isActive}
                                    onChange={(e) => updateOverallRafflesState({ id: overallRaffle.id, isActive: e.target?.checked })}
                                />
                            </Block>

                            <Button
                                large
                                rounded
                                onClick={() =>
                                    fetchHistories(overallRaffle?.id, academies?.find((academy) => academy.id === overallRaffle.academyId)?.name || '')
                                }
                                style={{ backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', margin: '6px 0 16px 0' }}
                                disabled={seeHistoryLoading}
                            >
                                <span>See History</span>
                                {seeHistoryLoading && <Preloader size="small" style={{ color: 'black' }} />}
                            </Button>

                            <Button
                                large
                                rounded
                                onClick={() => handleSave(overallRaffle)}
                                disabled={!updatedRaffleIds?.includes(overallRaffle.id)}
                                className="!flex !items-center !justify-center !gap-2"
                            >
                                <span>Save</span>
                                <span style={{ width: saveLoading ? 'auto' : '16px', display: 'flex', alignItems: 'center' }}>
                                    {saveLoading && <Preloader size="small" />}
                                </span>
                            </Button>
                        </List>
                    ))}
                </>
            ) : (
                (addNewRaffle || overallRaffles?.length == 0) && <AddRafflesPage setOverallRaffles={setOverallRaffles} />
            )}

            {selectedRaffle ? (
                rafflesHistory?.length > 0 ? (
                    <>
                        <BlockTitle large>Raffles History: {selectedRaffle}</BlockTitle>
                        <List strong inset>
                            {rafflesHistory.map((history) => (
                                <ListItem
                                    key={history.id}
                                    title={`${history.name} | ${history.endDate} | ${history.winnersCount} winner${history.winnersCount > 1 ? 's' : ''}`}
                                    link
                                    onClick={() => fetchWinners(history)}
                                />
                            ))}
                        </List>
                    </>
                ) : (
                    <BlockTitle large>No history: {selectedRaffle}</BlockTitle>
                )
            ) : null}

            {selectedHistory && (
                <>
                    <Card className="mt-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs text-gray-300">Winners List:</h2>
                            <h2 className="text-md text-white">{selectedHistory.name}</h2>
                        </div>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs text-gray-300">Start date:</h2>
                            <h2 className="text-md text-white">{selectedHistory.startDate}</h2>
                        </div>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs text-gray-300">End date:</h2>
                            <h2 className="text-md text-white"> {selectedHistory.endDate}</h2>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">Winners Count:</p>
                            <p className="text-md text-white">{selectedHistory.winnersCount}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">Minimum required raffle tickets was:</p>
                            <p className="text-md text-white">{selectedHistory.minRaffles} </p>
                        </div>
                        <Button
                            large
                            rounded
                            onClick={() => sendCSVEmail()}
                            className="!w-[90%] mt-8 !mx-auto flex items-center justify-center gap-2"
                            disabled={sendEmailLoading}
                        >
                            <span>Send CSV to Email</span>
                            {sendEmailLoading && <Preloader size="small" />}
                        </Button>

                        <List strong inset>
                            {winners.map((winner, index) => (
                                <ListItem key={winner.id} title={`${index + 1}. ${winner.user?.name}`} />
                            ))}
                        </List>
                    </Card>
                </>
            )}

            <Notification
                opened={notification?.title?.length}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title={notification?.title}
                text={notification?.text}
                button={<Button onClick={() => setNotification(null)}>OK</Button>}
                onClose={() => setNotification(null)}
                className="fixed"
            />
        </Page>
    )
}

export default OverallRaffleManagementPage
