// src/pages/AcademyDetailPage.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { Page, Block, Card, Button, List, ListInput, BlockTitle } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'

const AcademyDetailPage: React.FC = () => {
    const { academyId } = useParams<{ academyId: string }>()
    const [academy, setAcademy] = useState<any | null>(null)
    const [creatorEmail, setCreatorEmail] = useState('')
    const [selectedCoins, setSelectedCoins] = useState<{ id: string; name: string }[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([])
    const navigate = useNavigate()
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchAcademy = async () => {
            try {
                const response = await axios.get(`/api/academies/superadmin/${academyId}`)
                setAcademy(response.data)
                setCreatorEmail(response.data.creator.email)
                setSelectedCoins(response.data.coins)
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
                creatorEmail: creatorEmail, // For transferring ownership
                coinIds: selectedCoins.map((coin) => coin.id)
            })
            navigate('/academy-management') // Redirect back to academy management page
        } catch (error) {
            console.error('Error saving academy:', error)
        }
    }

    const handleSearch = async (term: string) => {
        setSearchTerm(term)
        if (term.length > 1) {
            try {
                const response = await axiosInstance.get(`/api/coins/search?keyword=${term}&limit=10`)
                setSearchResults(response.data)
            } catch (error) {
                console.error('Error searching coins:', error)
            }
        } else {
            setSearchResults([])
        }
    }

    const addCoin = (coin: { id: string; name: string }) => {
        if (!selectedCoins.some((selectedCoin) => selectedCoin.id === coin.id)) {
            setSelectedCoins([...selectedCoins, coin])
        }
    }

    const removeCoin = (index: number) => {
        const newSelectedCoins = [...selectedCoins]
        newSelectedCoins.splice(index, 1)
        setSelectedCoins(newSelectedCoins)
    }

    const clearSearch = () => {
        setSearchTerm('')
        setSearchResults([])
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            clearSearch()
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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

                        {/* Coins */}
                        <div className="m-4 relative" ref={searchRef}>
                            <label className="block text-sm font-medium text-gray-300">Attach Coins</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent text-white"
                                    placeholder="Search for coins"
                                />
                                {searchTerm && (
                                    <button onClick={clearSearch} className="absolute right-4 top-2 text-lg text-gray-400 hover:text-gray-700">
                                        &times;
                                    </button>
                                )}
                            </div>
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 bottom-full mb-2 w-full bg-black border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {searchResults.map((coin) => (
                                        <div key={coin.id} className="cursor-pointer p-2 hover:bg-gray-700 text-white" onClick={() => addCoin(coin)}>
                                            {coin.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 m-4">
                            {selectedCoins.map((coin, index) => (
                                <div key={index} className="relative">
                                    <span className="bg-gray-600 px-2 py-1 rounded-lg">
                                        {coin?.name}
                                        <button onClick={() => removeCoin(index)} className="ml-2 text-red-500">
                                            &times;
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>

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
