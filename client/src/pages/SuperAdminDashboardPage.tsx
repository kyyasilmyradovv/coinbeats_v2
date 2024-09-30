// src/pages/SuperAdminDashboardPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, Card, Block, BlockTitle, Button, ListInput, List } from 'konsta/react'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import { Person, School, Assessment, AttachMoney, Group } from '@mui/icons-material'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axios from '../api/axiosInstance'

const SuperAdminDashboardPage: React.FC = () => {
    // Dashboard statistics state
    const [stats, setStats] = useState({
        sessions: 0,
        users: 0,
        academies: 0,
        subscriptions: 0,
        monthlyIncome: 0
    })

    // Subscription management state
    const [subscriptionEnabled, setSubscriptionEnabled] = useState(false)
    const [subscriptionFee, setSubscriptionFee] = useState(0)
    const [rightPanelOpened, setRightPanelOpened] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    // Default Academy XP state
    const [defaultAcademyXp, setDefaultAcademyXp] = useState(0)

    // Fetch statistics data
    const fetchData = async () => {
        try {
            const response = await axios.get('/api/superadmin/stats') // Adjust the endpoint as needed
            const data = response.data
            setStats(data)
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        }
    }

    const fetchDefaultAcademyXp = async () => {
        try {
            const response = await axios.get('/api/settings/default-academy-xp')
            setDefaultAcademyXp(response.data.defaultXp)
        } catch (error) {
            console.error('Error fetching default academy XP:', error)

            if (error.response) {
                console.log('Error response data:', error.response.data)
                console.log('Error response status:', error.response.status)
                console.log('Error response headers:', error.response.headers)

                if (error.response.status === 401) {
                    alert('Unauthorized. Please log in again.')
                } else if (error.response.status === 403) {
                    alert('Access denied. You do not have permission to view this resource.')
                } else if (error.response.status === 404) {
                    alert('Resource not found.')
                } else {
                    alert('An error occurred while fetching default academy XP.')
                }
            } else if (error.request) {
                console.log('Error request:', error.request)
                alert('No response from server. Please try again later.')
            } else {
                console.log('Error message:', error.message)
                alert('An error occurred. Please try again.')
            }
        }
    }

    useEffect(() => {
        fetchData()
        fetchDefaultAcademyXp()
    }, [])

    // Handle the toggle change
    const handleToggleChange = () => {
        setSubscriptionEnabled(!subscriptionEnabled)
    }

    // Handle applying the subscription fee
    const applySubscriptionFee = () => {
        // Implement logic to apply the subscription fee to all academies
        console.log(`Applying subscription fee: ${subscriptionFee}`)
    }

    const applyDefaultAcademyXp = async () => {
        try {
            await axios.post('/api/settings/default-academy-xp', { defaultXp: defaultAcademyXp })
            alert('Default academy XP updated successfully.')
        } catch (error) {
            console.error('Error setting default academy XP:', error)

            if (error.response) {
                console.log('Error response data:', error.response.data)
                console.log('Error response status:', error.response.status)
                console.log('Error response headers:', error.response.headers)

                if (error.response.status === 401) {
                    alert('Unauthorized. Please log in again.')
                } else if (error.response.status === 403) {
                    alert('Access denied. You do not have permission to perform this action.')
                } else {
                    alert('An error occurred while setting default academy XP.')
                }
            } else if (error.request) {
                console.log('Error request:', error.request)
                alert('No response from server. Please try again later.')
            } else {
                console.log('Error message:', error.message)
                alert('An error occurred. Please try again.')
            }
        }
    }

    // Chart data configuration
    const chartData = {
        labels: ['Monthly Income'],
        datasets: [
            {
                label: 'Income',
                data: [stats.monthlyIncome],
                backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }
        ]
    }

    const toggleSidebar = () => {
        setRightPanelOpened(!rightPanelOpened)
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <Block className="space-y-4">
                {/* First Card: General Stats */}
                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                    <BlockTitle className="text-center mb-4 !mt-0">Dashboard Statistics</BlockTitle>
                    <Block className="flex justify-around items-center !my-0">
                        <div className="flex flex-col items-center">
                            <Assessment fontSize="large" style={{ color: 'blue' }} />
                            <div className="text-xl font-bold">{stats.sessions}</div>
                            <span className="text-sm text-center">Total Sessions</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Person fontSize="large" style={{ color: 'green' }} />
                            <div className="text-xl font-bold">{stats.users}</div>
                            <span className="text-sm text-center">Total Users</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <School fontSize="large" style={{ color: 'red' }} />
                            <div className="text-xl font-bold">{stats.academies}</div>
                            <span className="text-sm text-center">Total Academies</span>
                        </div>
                    </Block>
                </Card>

                {/* Second Card: Subscription and Income Stats */}
                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                    <BlockTitle className="text-center mb-2 !mt-0">Financial Overview</BlockTitle>
                    <Block className="flex justify-around items-center !my-0">
                        <div className="flex flex-col items-center">
                            <Group fontSize="large" style={{ color: 'purple' }} />
                            <div className="text-xl font-bold">{stats.subscriptions}</div>
                            <span className="text-sm text-center">Total Subscriptions</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <AttachMoney fontSize="large" style={{ color: 'goldenrod' }} />
                            <div className="text-xl font-bold">${stats.monthlyIncome}</div>
                            <span className="text-sm text-center">Monthly Income</span>
                        </div>
                    </Block>
                    <Block className="mt-4 !mb-0">
                        <Bar data={chartData} options={{ responsive: true }} />
                    </Block>
                </Card>

                {/* Third Card: Subscription Management */}
                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                    <BlockTitle className="text-center !m-0 !p-0 !mb-4">Subscription Management</BlockTitle>
                    <Block className="flex flex-col md:flex-row justify-around items-center !m-0 !p-0">
                        <div className="flex flex-col items-center mb-4">
                            <span className="font-medium">Enable Subscriptions</span>
                            <Button
                                rounded
                                active={subscriptionEnabled}
                                onClick={handleToggleChange}
                                className={`mt-2 ${subscriptionEnabled ? 'bg-green-500' : 'bg-gray-500'} text-white`}
                            >
                                {subscriptionEnabled ? 'On' : 'Off'}
                            </Button>
                        </div>
                        <div className="flex flex-col items-center">
                            <List className=" !m-0 !p-0">
                                <ListInput
                                    outline
                                    label="Global subscription fee"
                                    type="number"
                                    value={subscriptionFee}
                                    placeholder="Subscription Fee"
                                    onChange={(e) => setSubscriptionFee(parseFloat(e.target.value))}
                                    className="input input-outline mt-2 w-32"
                                />
                            </List>
                        </div>
                        <Button outline rounded onClick={applySubscriptionFee}>
                            Apply Fee
                        </Button>
                    </Block>
                </Card>

                {/* Fourth Card: Default Academy XP */}
                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                    <BlockTitle className="text-center !m-0 !p-0">Academy XP Management</BlockTitle>
                    <Block className="flex flex-col md:flex-row justify-around items-center !m-0 !p-0">
                        <div className="flex flex-col items-center">
                            <List className=" !m-0 !p-0">
                                <ListInput
                                    outline
                                    label="Default academy xp"
                                    type="number"
                                    value={defaultAcademyXp}
                                    placeholder="Default XP"
                                    onChange={(e) => setDefaultAcademyXp(parseInt(e.target.value, 10))}
                                    className="input input-outline mt-2 w-32"
                                />
                            </List>
                        </div>
                        <Button outline rounded onClick={applyDefaultAcademyXp}>
                            Apply
                        </Button>
                    </Block>
                </Card>
            </Block>
        </Page>
    )
}

export default SuperAdminDashboardPage
