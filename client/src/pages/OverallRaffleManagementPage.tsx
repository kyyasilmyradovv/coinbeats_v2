// OverallRaffleManagementPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, List, ListInput, Button, Card, ListItem } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

interface RaffleDataInterface {
    id: number
    minAmount: number
    minPoints: number
    winnersCount: number
    deadline: string
}

interface RafflesHistoryInterface {
    id: number
    name: string
    startDate: string
    endDate: string
    winnersCount: number
    minPoints: number
    minRaffles: number
}

interface WinnersInterface {
    id: number
    winningAmount: number
    raffleAmount: number
    user: object
}

const OverallRaffleManagementPage: React.FC = () => {
    const [overallRaffleData, setOverallRaffleData] = useState<Partial<RaffleDataInterface>>({})
    const [rafflesHistory, setRafflesHistory] = useState<RafflesHistoryInterface[]>([])
    const [selectedHistory, setSelectedHistory] = useState<RafflesHistoryInterface | null>(null)
    const [selectedWalletType, setSelectedWalletType] = useState<string>('erc20WalletAddress')
    const [winners, setWinners] = useState<WinnersInterface[]>([])

    const updateSetOverallRaffleData = (payload: Partial<RaffleDataInterface>) => {
        setOverallRaffleData({ ...overallRaffleData, ...payload })
    }

    useEffect(() => {
        const fetchOverallRaffle = async () => {
            try {
                const response = await axiosInstance.get('/api/raffle/overall')

                response.data.deadline = format(utcToZonedTime(new Date(response.data.deadline), 'Europe/Berlin'), 'yyyy-MM-dd HH:mm:ss')

                setOverallRaffleData(response.data)
            } catch (error) {
                console.error('Error fetching overall raffle:', error)
            }
        }
        fetchOverallRaffle()
    }, [])

    useEffect(() => {
        const fetchRafflesHistory = async () => {
            try {
                const response = await axiosInstance.get('/api/raffle/history')
                setRafflesHistory(response.data)
            } catch (error) {
                console.error('Error fetching overall raffle:', error)
            }
        }
        fetchRafflesHistory()
    }, [])

    const handleSave = async () => {
        try {
            await axiosInstance.put('/api/raffle/overall', overallRaffleData)
            alert('Raffle text updated successfully.')
        } catch (error) {
            console.error('Error updating raffle text:', error)
            alert('Failed to update raffle text.')
        }
    }

    const handleHistoryClick = async (history: RafflesHistoryInterface) => {
        setSelectedHistory(history)

        try {
            const response = await axiosInstance.get(`/api/raffle/winners?historyId=${history.id}`)
            setWinners(response.data)
            // setWeeklyLeaderboard(leaderboardResponse.data)
        } catch (error) {
            console.error('Error fetching raffle winners:', error)
        }
    }

    const handleSendCSVEmail = async () => {
        if (!winners || winners.length === 0) {
            alert('No data to send.')
            return
        }

        let fileName = `${selectedHistory?.name?.replace(/[: ]/g, '_')}_Winners_List_${selectedHistory?.endDate}.csv`

        try {
            const response = await axiosInstance.post('/api/download-csv-email', {
                dataType: 'raffle_winners',
                data: winners,
                selectedWalletType,
                fileName
            })

            alert('CSV file has been sent to your email.')
        } catch (error) {
            console.error('Error sending CSV file via email:', error)
            alert('Failed to send CSV via email.')
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="mt-16">
                <BlockTitle large>Overall Raffle Management</BlockTitle>
                <List strong inset>
                    <ListInput
                        label="Min Tickets for Winners List"
                        type="number"
                        outline
                        value={overallRaffleData?.minAmount}
                        onChange={(e) => updateSetOverallRaffleData({ minAmount: e.target?.value })}
                        placeholder="Enter minimum tickets number"
                    />
                    <ListInput
                        label="Min Points for Winners List"
                        type="number"
                        outline
                        value={overallRaffleData?.minPoints}
                        onChange={(e) => updateSetOverallRaffleData({ minPoints: e.target?.value })}
                        placeholder="Enter minimum points number"
                    />
                    <ListInput
                        label="Winners Count"
                        type="number"
                        outline
                        value={overallRaffleData?.winnersCount}
                        onChange={(e) => updateSetOverallRaffleData({ winnersCount: e.target?.value })}
                        placeholder="Enter winners count"
                    />
                    <ListInput
                        label="Raffle End Date"
                        type="datetime-local"
                        outline
                        value={overallRaffleData.deadline}
                        onChange={
                            // (e) => updateSetOverallRaffleData({ deadline: e.target?.value })
                            (e) =>
                                updateSetOverallRaffleData({
                                    deadline: format(utcToZonedTime(new Date(e.target?.value), 'Europe/Berlin'), 'yyyy-MM-dd HH:mm:ss')
                                })
                        }
                        placeholder="Enter deadline"
                    />
                </List>
                <Button large rounded onClick={handleSave} className="!w-[90%] !mx-auto">
                    Save
                </Button>

                <BlockTitle large>Raffles History</BlockTitle>
                <List strong inset>
                    {rafflesHistory?.map((history) => (
                        <ListItem
                            key={history.id}
                            title={`${history?.endDate} | ${history.winnersCount} winner${history?.winnersCount > 1 ? 's' : ''}`}
                            link
                            onClick={() => handleHistoryClick(history)}
                        />
                    ))}
                </List>

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
                                <p className="text-xs text-gray-300">Minimum required points was:</p>
                                <p className="text-md text-white">{selectedHistory.minPoints}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-300">Minimum required raffle tickets was:</p>
                                <p className="text-md text-white">{selectedHistory.minRaffles} </p>
                            </div>
                            <List strong inset className="!m-0 !p-0">
                                <ListInput
                                    outline
                                    label="Select Wallet"
                                    type="select"
                                    className="!m-0 !p-0"
                                    value={selectedWalletType}
                                    onChange={(e) => setSelectedWalletType(e.target.value)}
                                >
                                    <option value="erc20WalletAddress">ERC20 Wallet Address</option>
                                    <option value="solanaWalletAddress">Solana Wallet Address</option>
                                    <option value="tonWalletAddress">TON Wallet Address</option>
                                </ListInput>
                            </List>
                            <Button large rounded onClick={() => handleSendCSVEmail()} className="!w-[90%] !mx-auto">
                                Send CSV to Email
                            </Button>
                            <List strong inset>
                                {winners.map((winner, index) => (
                                    <ListItem key={winner.id} title={`${index + 1}. ${winner.user?.name}`} />
                                ))}
                            </List>
                        </Card>
                    </>
                )}
            </div>
        </Page>
    )
}

export default OverallRaffleManagementPage
