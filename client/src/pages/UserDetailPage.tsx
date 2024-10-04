// src/pages/UserDetailPage.tsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { Page, Block, Card, Button, List, ListInput, BlockTitle } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'

const UserDetailPage: React.FC<{
    theme: string
    setTheme: (theme: string) => void
    setColorTheme: (color: string) => void
}> = ({ theme, setTheme, setColorTheme }) => {
    const { userId } = useParams<{ userId: string }>()
    const [user, setUser] = useState<any | null>(null)
    const [rightPanelOpened, setRightPanelOpened] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/users/details/${userId}`) // Use the new endpoint
                setUser(response.data)
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        fetchUser()
    }, [userId])

    const handleSaveUser = async () => {
        try {
            await axios.put(`/api/users/${user.id}`, user)
            navigate('/user-management') // Redirect back to user management page
        } catch (error) {
            console.error('Error saving user:', error)
        }
    }

    const toggleSidebar = () => {
        setRightPanelOpened(!rightPanelOpened)
    }

    if (!user) return null // Return null if user is not loaded

    return (
        <Page>
            <Navbar onToggleSidebar={toggleSidebar} />
            <Sidebar opened={rightPanelOpened} onClose={() => setRightPanelOpened(false)} theme={theme} setTheme={setTheme} setColorTheme={setColorTheme} />

            <div className="text-center flex w-full items-center justify-center top-8 mb-10">
                <BlockTitle large className="text-3xl font-bold">
                    User Details
                </BlockTitle>
            </div>

            <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <Block className="!my-0">
                    <h3 className="text-lg font-semibold text-center mb-0">Edit User</h3>
                    <List strong>
                        <ListInput label="Name" type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} outline />
                        <ListInput label="Email" type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} outline />
                        <ListInput label="Role" type="text" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })} outline />
                        <div>
                            <span className="font-semibold">Total Points:</span> <span className="font-bold">{user.totalPoints}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Session Count:</span> <span className="font-bold">{user.sessionCount}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Subscription Status:</span> <span className="font-bold">{user.subscriptionStatus}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Valid Until:</span> <span className="font-bold">{user.subscriptionValidUntil}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Created At:</span>{' '}
                            <span className="font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-2 justify-between mt-4">
                            <Button onClick={handleSaveUser} className="bg-green-500 text-white rounded-full">
                                Save
                            </Button>
                            <Button onClick={() => navigate('/user-management')} className="bg-gray-500 text-white rounded-full">
                                Cancel
                            </Button>
                        </div>
                    </List>
                </Block>
            </Card>
        </Page>
    )
}

export default UserDetailPage
