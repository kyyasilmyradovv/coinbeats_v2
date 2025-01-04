// src/pages/DiscoverPage.tsx

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, List, ListInput, Card, Button, Searchbar } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import useDiscoverStore from '../store/useDiscoverStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import BottomTabBar from '../components/BottomTabBar'
import coming from '../images/svgs/coming-soon3.svg'

const DiscoverPage: React.FC = () => {
    const navigate = useNavigate()
    const [category, setCategory] = useState('')
    const [chain, setChain] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [activeTab, setActiveTab] = useState('tab-5') // Example usage for bottom tab bar

    const { categories, chains, fetchCategories, fetchChains } = useCategoryChainStore((state) => ({
        categories: state.categories,
        chains: state.chains,
        fetchCategories: state.fetchCategories,
        fetchChains: state.fetchChains
    }))

    const {
        educators,
        podcasts,
        tutorials,
        youtubeChannels,
        telegramGroups,
        fetchEducators,
        fetchPodcasts,
        fetchTutorials,
        fetchYoutubeChannels,
        fetchTelegramGroups
    } = useDiscoverStore((state) => ({
        educators: state.educators,
        podcasts: state.podcasts,
        tutorials: state.tutorials,
        youtubeChannels: state.youtubeChannels,
        telegramGroups: state.telegramGroups,
        fetchEducators: state.fetchEducators,
        fetchPodcasts: state.fetchPodcasts,
        fetchTutorials: state.fetchTutorials,
        fetchYoutubeChannels: state.fetchYoutubeChannels,
        fetchTelegramGroups: state.fetchTelegramGroups
    }))

    // Fetch categories/chains on mount
    useEffect(() => {
        fetchCategories()
        fetchChains()
    }, [fetchCategories, fetchChains])

    // Fetch all content on mount
    useEffect(() => {
        fetchEducators()
        fetchPodcasts()
        fetchTutorials()
        fetchYoutubeChannels()
        fetchTelegramGroups()
    }, [fetchEducators, fetchPodcasts, fetchTutorials, fetchYoutubeChannels, fetchTelegramGroups])

    // Tab filters
    const tabs = ['All', 'Top Educators', 'Top Podcasts', 'Top Youtube Channels', 'Top TG Groups', 'Tutorials']

    // Filter the data based on activeFilter, category, chain, search query
    const filteredData = useMemo(() => {
        let data: any[] = []

        switch (activeFilter) {
            case 'Top Educators':
                data = educators.map((item) => ({ ...item, contentType: 'Educator' }))
                break
            case 'Top Podcasts':
                data = podcasts.map((item) => ({ ...item, contentType: 'Podcast' }))
                break
            case 'Top Youtube Channels':
                data = youtubeChannels.map((item) => ({ ...item, contentType: 'YoutubeChannel' }))
                break
            case 'Top TG Groups':
                data = telegramGroups.map((item) => ({ ...item, contentType: 'TelegramGroup' }))
                break
            case 'Tutorials':
                data = tutorials.map((item) => ({ ...item, contentType: 'Tutorial' }))
                break
            default:
                // 'All' includes everything
                data = [
                    ...educators.map((item) => ({ ...item, contentType: 'Educator' })),
                    ...podcasts.map((item) => ({ ...item, contentType: 'Podcast' })),
                    ...youtubeChannels.map((item) => ({ ...item, contentType: 'YoutubeChannel' })),
                    ...telegramGroups.map((item) => ({ ...item, contentType: 'TelegramGroup' })),
                    ...tutorials.map((item) => ({ ...item, contentType: 'Tutorial' }))
                ]
        }

        // Apply category filter
        if (category) {
            data = data.filter((item) => {
                if (item.categories) {
                    return item.categories.some((cat: any) => cat.name === category)
                }
                return false
            })
        }

        // Apply chain filter
        if (chain) {
            data = data.filter((item) => {
                if (item.chains) {
                    return item.chains.some((ch: any) => ch.name === chain)
                }
                return false
            })
        }

        // Apply search query
        if (searchQuery) {
            data = data.filter((item) => {
                const nameOrTitle = item.name || item.title || ''
                return nameOrTitle.toLowerCase().includes(searchQuery.toLowerCase())
            })
        }

        return data
    }, [activeFilter, category, chain, searchQuery, educators, podcasts, tutorials, youtubeChannels, telegramGroups])

    // Handle navigation to detail page
    const handleMoreClick = (item: any) => {
        switch (item.contentType) {
            case 'Educator':
                navigate(`/discover/educators/${item.id}`, { state: { item } })
                break
            case 'Podcast':
                navigate(`/discover/podcasts/${item.id}`, { state: { item } })
                break
            case 'Tutorial':
                navigate(`/discover/tutorials/${item.id}`, { state: { item } })
                break
            case 'YoutubeChannel':
                navigate(`/discover/youtube-channels/${item.id}`, { state: { item } })
                break
            case 'TelegramGroup':
                navigate(`/discover/telegram-groups/${item.id}`, { state: { item } })
                break
            default:
                navigate(`/discover/${item.id}`, { state: { item } })
                break
        }
    }

    // Construct full URL for images
    const constructImageUrl = (url: string) => {
        return `https://telegram.coinbeats.xyz/${url}`
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Filters */}
            <div className="flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl mx-2 shadow-lg p-0 py-0">
                <div className="flex flex-row w-full mt-1 items-center ml-4">
                    <span className="text-xs text-gray-800 dark:text-gray-300 ml-2">Filter by:</span>
                </div>
                <div className="flex flex-row w-full space-x-0">
                    <div className="!flex w-1/3">
                        <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full !my-0">
                            <ListInput
                                label="Category"
                                type="select"
                                dropdown
                                outline
                                inputClassName="!bg-zinc-900 !text-white !m-1 !pl-2 !h-6"
                                inputStyle={{ fontSize: '0.85rem' }}
                                placeholder="Please choose..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </ListInput>
                        </List>
                    </div>
                    <div className="!flex w-1/3">
                        <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full !my-0">
                            <ListInput
                                label="Chain"
                                type="select"
                                dropdown
                                outline
                                inputClassName="!bg-zinc-900 !text-white !m-1 !pl-2 !h-6"
                                inputStyle={{ fontSize: '0.85rem' }}
                                placeholder="Please choose..."
                                value={chain}
                                onChange={(e) => setChain(e.target.value)}
                            >
                                <option value="">All</option>
                                {chains.map((ch) => (
                                    <option key={ch.id} value={ch.name}>
                                        {ch.name}
                                    </option>
                                ))}
                            </ListInput>
                        </List>
                    </div>
                    <div className="flex w-1/3 items-center justify-center text-center pr-2 z-0">
                        <Searchbar
                            inputStyle={{ height: '1.9rem', fontSize: '0.85rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="!text-2xs z-0 !items-center !justify-center !my-auto !h-7 !placeholder:text-sm"
                            clearButton
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mt-4">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            rounded
                            outline
                            small
                            onClick={() => setActiveFilter(tab)}
                            className={`${
                                activeFilter === tab
                                    ? '!bg-gray-100 dark:!bg-gray-800 !shadow-lg !text-2xs !w-auto !px-2 !min-w-0'
                                    : '!bg-white dark:!bg-gray-900 !shadow-lg !text-2xs !w-auto !px-2 !min-w-0'
                            }`}
                            style={{
                                color: '#fff'
                            }}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Render the total number of items */}
            <div className="text-gray-300 text-xs mt-2 ml-6">
                <span className="text-white font-bold">{filteredData.length} </span> Items
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-0 px-2 pt-1 pb-16">
                {filteredData.map((item) => (
                    <div key={`${item.contentType}-${item.id}`} className="relative">
                        <Card
                            className={`relative flex flex-col items-center text-center p-0 !mb-4 !m-2 rounded-2xl shadow-lg overflow-visible z-10 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600`}
                        >
                            {/* Display item content based on contentType */}
                            {item.contentType === 'Educator' && (
                                <>
                                    {item.avatarUrl && (
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img
                                                alt={item.name}
                                                className="h-16 w-16 rounded-full mb-2"
                                                src={constructImageUrl(item.avatarUrl)}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="text-md font-bold">{item.name}</div>
                                </>
                            )}

                            {item.contentType === 'Podcast' && (
                                <>
                                    {item.logoUrl ? (
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img alt={item.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(item.logoUrl)} loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 mb-2"></div>
                                    )}
                                    <div className="text-md font-bold">{item.name}</div>
                                </>
                            )}

                            {item.contentType === 'Tutorial' && (
                                <>
                                    {item.logoUrl ? (
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img
                                                alt={item.title}
                                                className="h-16 w-16 rounded-full mb-2"
                                                src={constructImageUrl(item.logoUrl)}
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 mb-2"></div>
                                    )}
                                    <div className="text-md font-bold">{item.title}</div>
                                </>
                            )}

                            {/* NEW: YouTubeChannel */}
                            {item.contentType === 'YoutubeChannel' && (
                                <>
                                    {item.logoUrl ? (
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img alt={item.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(item.logoUrl)} loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 mb-2"></div>
                                    )}
                                    <div className="text-md font-bold">{item.name}</div>
                                </>
                            )}

                            {/* NEW: TelegramGroup */}
                            {item.contentType === 'TelegramGroup' && (
                                <>
                                    {item.logoUrl ? (
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img alt={item.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(item.logoUrl)} loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 mb-2"></div>
                                    )}
                                    <div className="text-md font-bold">{item.name}</div>
                                </>
                            )}

                            <Button
                                outline
                                rounded
                                onClick={() => handleMoreClick(item)}
                                className="!text-xs !w-24 !mx-auto mt-1 font-bold shadow-xl !h-6 !mb-1 !whitespace-nowrap"
                                style={{
                                    background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff'
                                }}
                            >
                                View Details
                            </Button>

                            {/* Display selected categories and chains as tags */}
                            <div className="flex flex-wrap gap-1 justify-center mt-1 mb-2">
                                {/* Categories */}
                                {item.categories &&
                                    item.categories.map((cat: any, index: number) => (
                                        <span key={`category-${index}`} className="bg-blue-200 dark:bg-blue-600 !px-[4px] rounded-full text-2xs">
                                            {cat.name}
                                        </span>
                                    ))}
                                {/* Chains */}
                                {item.chains &&
                                    item.chains.map((ch: any, index: number) => (
                                        <span key={`chain-${index}`} className="bg-green-200 dark:bg-green-600 !px-[4px] rounded-full text-2xs">
                                            {ch.name}
                                        </span>
                                    ))}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Bottom Tab Bar */}
            <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </Page>
    )
}

export default DiscoverPage
