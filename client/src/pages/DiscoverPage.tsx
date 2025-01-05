// src/pages/DiscoverPage.tsx

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, List, ListInput, Card, Searchbar } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import useDiscoverStore from '../store/useDiscoverStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import BottomTabBar from '../components/BottomTabBar'
import { Icon } from '@iconify/react'

const DiscoverPage: React.FC = () => {
    const navigate = useNavigate()
    const [category, setCategory] = useState('')
    const [chain, setChain] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [activeTab, setActiveTab] = useState('tab-5') // for BottomTabBar usage

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

    // We remove "Top" from the tab labels
    const tabs = ['All', 'Educators', 'Podcasts', 'Youtube Channels', 'TG Groups', 'Tutorials']

    // Filter data
    const filteredData = useMemo(() => {
        let data: any[] = []
        switch (activeFilter) {
            case 'Educators':
                data = educators.map((item) => ({ ...item, contentType: 'Educator' }))
                break
            case 'Podcasts':
                data = podcasts.map((item) => ({ ...item, contentType: 'Podcast' }))
                break
            case 'Youtube Channels':
                data = youtubeChannels.map((item) => ({ ...item, contentType: 'YoutubeChannel' }))
                break
            case 'TG Groups':
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

        // Category filter
        if (category) {
            data = data.filter((item) => {
                if (item.categories) {
                    return item.categories.some((cat: any) => cat.name === category)
                }
                return false
            })
        }

        // Chain filter
        if (chain) {
            data = data.filter((item) => {
                if (item.chains) {
                    return item.chains.some((ch: any) => ch.name === chain)
                }
                return false
            })
        }

        // Search
        if (searchQuery) {
            data = data.filter((item) => {
                const nameOrTitle = item.name || item.title || ''
                return nameOrTitle.toLowerCase().includes(searchQuery.toLowerCase())
            })
        }

        return data
    }, [activeFilter, category, chain, searchQuery, educators, podcasts, tutorials, youtubeChannels, telegramGroups])

    // Card click => navigate to details
    const handleCardClick = (item: any) => {
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

    // Construct image URLs
    const constructImageUrl = (url: string) => `https://telegram.coinbeats.xyz/${url}`

    // We can show icons if the item has links (like youtubeUrl, spotifyUrl, telegramUrl, etc.)
    // We'll define logic similar to detail pages
    const detectPlatformLinks = (item: any) => {
        // You can add more if you like (Spotify, Apple, etc.)
        const links: Array<{ icon: string; color: string; url: string; label: string }> = []

        if (item.youtubeUrl) {
            links.push({
                icon: 'mdi:youtube',
                color: 'rgba(255,0,0,0.9)',
                url: item.youtubeUrl,
                label: 'YouTube'
            })
        }
        if (item.spotifyUrl) {
            links.push({
                icon: 'mdi:spotify',
                color: 'rgba(29,185,84,0.9)',
                url: item.spotifyUrl,
                label: 'Spotify'
            })
        }
        if (item.appleUrl) {
            links.push({
                icon: 'mdi:apple',
                color: 'rgba(153,153,153,0.9)',
                url: item.appleUrl,
                label: 'Apple'
            })
        }
        if (item.telegramUrl) {
            links.push({
                icon: 'mdi:telegram',
                color: 'rgba(34,158,217,0.9)',
                url: item.telegramUrl,
                label: 'Telegram'
            })
        }
        if (item.twitterUrl) {
            links.push({
                icon: 'mdi:twitter',
                color: 'rgba(29,161,242,0.9)',
                url: item.twitterUrl,
                label: 'Twitter'
            })
        }
        if (item.discordUrl) {
            links.push({
                icon: 'mdi:discord',
                color: 'rgba(88,101,242,0.9)',
                url: item.discordUrl,
                label: 'Discord'
            })
        }

        return links
    }

    // New tab styling logic, like on detail pages
    const renderTabButtons = () => {
        return (
            <div className="flex gap-2 px-4 mt-4 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`px-4 py-1 rounded-full border text-sm font-bold transition-all ${
                            activeFilter === tab
                                ? 'bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0]'
                                : 'bg-gray-800 text-white border-gray-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        )
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
            {renderTabButtons()}

            {/* Render total items */}
            <div className="text-gray-300 text-xs mt-2 ml-6">
                <span className="text-white font-bold">{filteredData.length} </span> Items
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-0 px-2 pt-1 pb-16">
                {filteredData.map((item) => {
                    // detect links
                    const links = detectPlatformLinks(item)

                    return (
                        <div key={`${item.contentType}-${item.id}`} className="relative cursor-pointer" onClick={() => handleCardClick(item)}>
                            <Card
                                className={`relative flex flex-col items-center text-center p-0 !mb-4 !m-2 rounded-2xl shadow-lg overflow-visible z-10 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600`}
                            >
                                {/* Type label at top-left */}
                                <span className="absolute top-1 left-1 text-2xs bg-black bg-opacity-70 text-white px-1 py-0 rounded">{item.contentType}</span>

                                {/* Main image / name */}
                                {item.contentType === 'Educator' && (
                                    <>
                                        {item.avatarUrl && (
                                            <div className="flex items-center justify-center w-full mt-2">
                                                <img
                                                    alt={item.name}
                                                    className="h-20 w-20 rounded-full mb-2"
                                                    src={constructImageUrl(item.avatarUrl)}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="text-md font-bold mb-2">{item.name}</div>
                                    </>
                                )}

                                {item.contentType === 'Podcast' && (
                                    <>
                                        {item.logoUrl ? (
                                            <div className="flex items-center justify-center w-full mt-2">
                                                <img
                                                    alt={item.name}
                                                    className="h-20 w-20 rounded-full mb-2"
                                                    src={constructImageUrl(item.logoUrl)}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-300 mb-2 mt-1"></div>
                                        )}
                                        <div className="text-md font-bold mb-2">{item.name}</div>
                                    </>
                                )}

                                {item.contentType === 'Tutorial' && (
                                    <>
                                        {item.logoUrl ? (
                                            <div className="flex items-center justify-center w-full mt-2">
                                                <img
                                                    alt={item.title}
                                                    className="h-20 w-20 rounded-full mb-2"
                                                    src={constructImageUrl(item.logoUrl)}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-300 mb-2 mt-1"></div>
                                        )}
                                        <div className="text-md font-bold mb-2">{item.title}</div>
                                    </>
                                )}

                                {item.contentType === 'YoutubeChannel' && (
                                    <>
                                        {item.logoUrl ? (
                                            <div className="flex items-center justify-center w-full mt-2">
                                                <img
                                                    alt={item.name}
                                                    className="h-20 w-20 rounded-full mb-2"
                                                    src={constructImageUrl(item.logoUrl)}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-300 mb-2 mt-1"></div>
                                        )}
                                        <div className="text-md font-bold mb-2">{item.name}</div>
                                    </>
                                )}

                                {item.contentType === 'TelegramGroup' && (
                                    <>
                                        {item.logoUrl ? (
                                            <div className="flex items-center justify-center w-full mt-2">
                                                <img
                                                    alt={item.name}
                                                    className="h-20 w-20 rounded-full mb-2"
                                                    src={constructImageUrl(item.logoUrl)}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-300 mb-2 mt-1"></div>
                                        )}
                                        <div className="text-md font-bold mb-2">{item.name}</div>
                                    </>
                                )}

                                {/* Icons for any platform links */}
                                {links.length > 0 && (
                                    <div className="flex gap-1 mt-1 mb-2 justify-center">
                                        {links.map((link, i) => (
                                            <div
                                                key={i}
                                                title={link.label}
                                                className="p-1 rounded-full"
                                                style={{ backgroundColor: '#444' }}
                                                onClick={(e) => {
                                                    // Prevent card click from also navigating
                                                    e.stopPropagation()
                                                    window.open(link.url, '_blank')
                                                }}
                                            >
                                                <Icon icon={link.icon} style={{ color: link.color }} className="w-5 h-5" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Smaller badges */}
                                <div className="flex flex-wrap gap-1 justify-center mt-1 mb-2">
                                    {/* Categories */}
                                    {item.categories &&
                                        item.categories.map((cat: any, index: number) => (
                                            <span key={`category-${index}`} className="bg-blue-200 dark:bg-blue-800 px-1 !py-0 rounded-full text-[0.5rem]">
                                                {cat.name}
                                            </span>
                                        ))}
                                    {/* Chains */}
                                    {item.chains &&
                                        item.chains.map((ch: any, index: number) => (
                                            <span key={`chain-${index}`} className="bg-green-200 dark:bg-green-800 px-1 py-0 rounded-full text-[0.5rem]">
                                                {ch.name}
                                            </span>
                                        ))}
                                </div>
                            </Card>
                        </div>
                    )
                })}
            </div>

            <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </Page>
    )
}

export default DiscoverPage
