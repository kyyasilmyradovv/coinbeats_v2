import React, { useEffect, useState } from 'react'
import { Page, Block, List, ListInput, Button, Notification, Toggle } from 'konsta/react'
import bunnyLogo from '../images/bunny-mascot.png'
import axiosInstance from '~/api/axiosInstance'
import Spinner from '~/components/Spinner'

interface RaffleDataInterface {
    id: number
    minAmount: number
    winnersCount: number
    deadline: string
    reward: string
    isActive: boolean
    academyId: number
}

type AddRafflesPageProps = {
    setOverallRaffles: React.Dispatch<React.SetStateAction<Partial<RaffleDataInterface>[]>>
}

interface Academy {
    id: number
    name: string
    createdAt: string
    status: string
    logoUrl: string
    coverPhotoUrl: string
}

const AddRafflesPage: React.FC<AddRafflesPageProps> = ({ setOverallRaffles }) => {
    const [academies, setAcademies] = useState<Academy[]>([])
    const [newRaffleData, setNewRaffleData] = useState<Partial<RaffleDataInterface>>({})
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({
        minAmount: '',
        reward: '',
        winnersCount: '',
        deadline: '',
        academyId: ''
    })

    const validateInputs = () => {
        // let newErrors = { minAmount: '', reward: '', winnersCount: '', deadline: '', academyId: '' }
        let newErrors = {}

        if (!newRaffleData.minAmount) {
            newErrors.minAmount = 'Enter the minimum tickets for winners.'
        }

        if (!newRaffleData.winnersCount) {
            newErrors.winnersCount = 'Specify the number of winners.'
        }

        if (!newRaffleData.deadline) {
            newErrors.deadline = 'Provide a valid deadline.'
        }

        if (!newRaffleData.reward) {
            newErrors.reward = 'Specify the raffle reward.'
        }

        if (!newRaffleData.academyId) {
            newErrors.academyId = 'Select an academy.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 // Return true if no errors
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

    const saveRaffle = async () => {
        if (!loading) {
            if (!validateInputs()) {
                return // Prevent save if validation fails
            }
            setLoading(true)

            try {
                const response = await axiosInstance.post('/api/raffle/overall', newRaffleData)
                setOverallRaffles((prevRaffles) => [...prevRaffles, response.data])
                if (response.status === 200) {
                    setNotificationOpen(true)
                }
            } catch (error) {
                console.error('Error saving raffles:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    return (
        <Page className="pt-6">
            <Block strongIos className="m-4 p-4 bg-white rounded-xl shadow-md">
                <h2 className="text-lg font-bold mb-4">Add Academy Raffle</h2>
                <List>
                    <Block className="mb-4 p-4 border rounded-lg shadow-sm relative">
                        <ListInput
                            label="Min Tickets for Winners List"
                            type="number"
                            placeholder="Enter number"
                            outline
                            required
                            value={newRaffleData?.minAmount}
                            onChange={(e) => setNewRaffleData({ ...newRaffleData, minAmount: e.target?.value })}
                        />
                        {errors.minAmount && <p className="text-red-500 text-sm mt-1">{errors.minAmount}</p>}
                        <ListInput
                            label="Winners Count"
                            type="number"
                            placeholder="Enter number"
                            outline
                            value={newRaffleData?.winnersCount}
                            onChange={(e) => setNewRaffleData({ ...newRaffleData, winnersCount: e.target?.value })}
                        />
                        {errors.winnersCount && <p className="text-red-500 text-sm mt-1">{errors.winnersCount}</p>}
                        <ListInput
                            label="Raffle End Date"
                            type="datetime-local"
                            placeholder="Enter deadline"
                            outline
                            value={newRaffleData?.deadline}
                            onChange={(e) => setNewRaffleData({ ...newRaffleData, deadline: e.target?.value })}
                            style={{ colorScheme: 'dark' }}
                        />
                        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                        <ListInput
                            label="Reward"
                            type="string"
                            placeholder="For ex: 10 USDC"
                            outline
                            value={newRaffleData?.reward}
                            onChange={(e) => setNewRaffleData({ ...newRaffleData, reward: e.target?.value })}
                        />
                        {errors.reward && <p className="text-red-500 text-sm mt-1">{errors.reward}</p>}
                        <ListInput
                            label="Select Academy"
                            type="select"
                            outline
                            required
                            value={newRaffleData?.academyId || ''}
                            onChange={(e) => setNewRaffleData({ ...newRaffleData, academyId: e.target?.value })}
                        >
                            <option value="" disabled>
                                Select Academy
                            </option>
                            {academies?.map((academy) => (
                                <option key={academy.id} value={academy.id}>
                                    {academy.name}
                                </option>
                            ))}
                        </ListInput>
                        {errors.academyId && <p className="text-red-500 text-sm mt-1">{errors.academyId}</p>}
                        <Block>
                            <p>Active</p>
                            <Toggle checked={newRaffleData?.isActive} onChange={(e) => setNewRaffleData({ ...newRaffleData, isActive: e.target?.checked })} />
                        </Block>
                    </Block>
                </List>
                <Button onClick={saveRaffle} className="rounded-full">
                    Start
                </Button>
            </Block>

            <Notification
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Success"
                text="You successfully created your Academy's Raffle"
                button={<Button onClick={() => setNotificationOpen(false)}>OK</Button>}
                onClose={() => setNotificationOpen(false)}
            />
        </Page>
    )
}

export default AddRafflesPage
