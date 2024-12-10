// src/pages/AcademyDetailPage.tsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { Page, Block, Card, Button, List, ListInput, BlockTitle } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'

const AcademyDetailPage: React.FC = () => {
    const { academyId } = useParams<{ academyId: string }>()
    const [academy, setAcademy] = useState<any | null>(null)
    const [creatorEmail, setCreatorEmail] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAcademy = async () => {
            try {
                const response = await axios.get(`/api/academies/superadmin/${academyId}`)
                setAcademy(response.data)
                setCreatorEmail(response.data.creator.email)
            } catch (error) {
                console.error('Error fetching academy:', error)
            }
        }

        fetchAcademy()
    }, [academyId])

    const handleSaveAcademy = async () => {
        try {
            await axios.put(`/api/academies/${academy.id}`, {
                name: academy.name,
                xp: academy.xp,
                sponsored: academy.sponsored,
                status: academy.status,
                creatorEmail: creatorEmail // For transferring ownership
            })
            navigate('/academy-management') // Redirect back to academy management page
        } catch (error) {
            console.error('Error saving academy:', error)
        }
    }

    if (!academy) return null // Return null if academy is not loaded

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center top-8 mb-10">
                <BlockTitle large className="text-3xl font-bold">
                    Academy Details
                </BlockTitle>
            </div>

            <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <Block className="!my-0">
                    <h3 className="text-lg font-semibold text-center mb-0">Edit Academy</h3>
                    <List strong>
                        <ListInput label="Name" type="text" value={academy.name} onChange={(e) => setAcademy({ ...academy, name: e.target.value })} outline />
                        <ListInput
                            label="XP"
                            type="number"
                            value={academy.xp}
                            onChange={(e) => setAcademy({ ...academy, xp: parseInt(e.target.value, 10) })}
                            outline
                        />
                        <ListInput
                            label="Sponsored"
                            type="select"
                            value={academy.sponsored.toString()}
                            onChange={(e) => setAcademy({ ...academy, sponsored: e.target.value === 'true' })}
                            outline
                            inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </ListInput>
                        <ListInput
                            label="Status"
                            type="select"
                            value={academy.status}
                            onChange={(e) => setAcademy({ ...academy, status: e.target.value })}
                            outline
                            inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </ListInput>
                        <ListInput
                            label="Creator Email (Change to transfer ownership)"
                            type="email"
                            value={creatorEmail}
                            onChange={(e) => setCreatorEmail(e.target.value)}
                            outline
                        />
                        <div>
                            <span className="font-semibold">Created At:</span>{' '}
                            <span className="font-bold">{new Date(academy.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Academy Type:</span>{' '}
                            <span className="font-bold">{academy.academyType ? academy.academyType.name : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-2 justify-between mt-4">
                            <Button onClick={handleSaveAcademy} className="bg-green-500 text-white rounded-full">
                                Save
                            </Button>
                            <Button onClick={() => navigate('/academy-management')} className="bg-gray-500 text-white rounded-full">
                                Cancel
                            </Button>
                        </div>
                    </List>
                </Block>
            </Card>
        </Page>
    )
}

export default AcademyDetailPage
