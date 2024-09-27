// client/src/pages/GamesPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, Button, Dialog } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import axios from '../api/axiosInstance'
import coinStackIcon from '../images/coin-stack.png'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { initUtils } from '@telegram-apps/sdk'
import { Fax, X } from '@mui/icons-material'

interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
    _count: {
        userVerification: number
    }
}

export default function GamesPage() {
    const [activeTab, setActiveTab] = useState('tab-3')
    const [tasks, setTasks] = useState<VerificationTask[]>([])
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null) // Tooltip state

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/verification-tasks/games')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            }
        }

        fetchTasks()
    }, [])

    const toggleTooltip = (tooltipIndex: number) => {
        if (visibleTooltip === tooltipIndex) {
            setVisibleTooltip(null)
        } else {
            setVisibleTooltip(tooltipIndex)
            // Optionally, auto-hide the tooltip after a certain time
            // setTimeout(() => setVisibleTooltip(null), 2000);
        }
    }

    const platformIcons = {
        X: <X className="w-8 h-8 !mb-3 text-blue-500 !p-0 !m-0" />,
        FACEBOOK: <FaFacebook className="w-8 h-8 !mb-3 text-blue-700 !p-0 !m-0" />,
        INSTAGRAM: <FaInstagram className="w-8 h-8 !mb-3 text-pink-500 !p-0 !m-0" />,
        TELEGRAM: <FaTelegramPlane className="w-8 h-8 !mb-3 text-blue-400 !p-0 !m-0" />,
        DISCORD: <FaDiscord className="w-8 h-8 !mb-3 text-indigo-600 !p-0 !m-0" />,
        YOUTUBE: <FaYoutube className="w-8 h-8 !mb-3 text-red-600 !p-0 !m-0" />,
        EMAIL: <FaEnvelope className="w-8 h-8 !mb-3 text-green-500 !p-0 !m-0" />
        // Add other platforms as needed
    }

    function getActionLabel(verificationMethod: string) {
        switch (verificationMethod) {
            case 'TWEET':
                return 'Tweet'
            case 'RETWEET':
                return 'Retweet'
            case 'FOLLOW_USER':
                return 'Follow'
            case 'LIKE_TWEET':
                return 'Like'
            case 'COMMENT_ON_TWEET':
                return 'Comment'
            case 'JOIN_TELEGRAM_CHANNEL':
                return 'Join'
            case 'INVITE_TELEGRAM_FRIEND':
                return 'Invite'
            case 'PROVIDE_EMAIL':
                return 'Submit'
            // Add other mappings as needed
            default:
                return 'Action'
        }
    }

    const handleAction = (task: VerificationTask) => {
        switch (task.verificationMethod) {
            case 'TWEET':
                const tweetText = encodeURIComponent(task.description)
                window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
                break
            case 'INVITE_TELEGRAM_FRIEND':
                // Handle invite action
                axios
                    .get('/api/users/me')
                    .then((response) => {
                        const userReferralCode = response.data.referralCode
                        if (!userReferralCode) {
                            alert('Referral code not available.')
                            return
                        }
                        const botUsername = 'CoinbeatsMiniApp_bot/miniapp' // Replace with your bot's username
                        const referralLink = `https://t.me/${botUsername}?startapp=${userReferralCode}`
                        setReferralCode(userReferralCode)
                        setReferralLink(referralLink)
                        setReferralModalOpen(true)
                    })
                    .catch((error) => {
                        console.error('Error fetching user data:', error)
                    })
                break
            // Handle other methods...
            default:
                break
        }
    }

    const handleInviteFriend = () => {
        const utils = initUtils()
        const inviteLink = `https://t.me/CoinbeatsMiniApp_bot/miniapp?startapp=${referralCode}`
        const shareText = `Join me on this awesome app!`

        const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
        utils.openTelegramLink(fullUrl)
    }

    const copyReferralLink = () => {
        navigator.clipboard
            .writeText(referralLink)
            .then(() => {
                alert('Referral link copied to clipboard!')
            })
            .catch((error) => {
                console.error('Error copying referral link:', error)
            })
    }

    function handleVerify(task: VerificationTask) {
        if (task.verificationMethod === 'TWEET') {
            const twitterHandle = prompt('Please enter your Twitter handle (without @):')
            if (twitterHandle) {
                axios
                    .post('/api/users/complete-task', { taskId: task.id, twitterHandle })
                    .then((response) => {
                        alert(response.data.message)
                    })
                    .catch((error) => {
                        console.error('Error verifying task:', error)
                        alert(error.response?.data?.message || 'Verification failed')
                    })
            }
        } else {
            // Handle other verification methods
        }
    }

    const inviteTask = tasks.find((task) => task.verificationMethod === 'INVITE_TELEGRAM_FRIEND')

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    <div className="text-center flex w-full items-center justify-center absolute top-0">
                        <BlockTitle className="!m-0 !p-0">Earn by doing tasks</BlockTitle>
                    </div>

                    {/* Referral Dialog */}
                    <Dialog
                        opened={referralModalOpen}
                        onBackdropClick={() => setReferralModalOpen(false)}
                        title="Invite a Friend"
                        className="!m-0 !p-0 rounded-2xl"
                    >
                        <div className="p-0">
                            <p>Share this link with your friends:</p>
                            <div className="w-full border border-gray-300 rounded mt-2 p-2 bg-white dark:bg-gray-800">{referralLink}</div>
                            <div className="flex flex-col space-y-2 mt-2">
                                <Button
                                    outline
                                    rounded
                                    onClick={copyReferralLink}
                                    className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    Copy Invite Link
                                </Button>
                                <Button
                                    outline
                                    rounded
                                    onClick={handleInviteFriend}
                                    className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    <FaTelegramPlane className="inline-block mr-2 !h-5 !w-5" />
                                    Invite Friend
                                </Button>
                            </div>
                        </div>
                    </Dialog>

                    <div className="mt-0 px-4 py-10 mb-8">
                        {/* Invite Task at the Top */}
                        {inviteTask && (
                            <div
                                key={inviteTask.id}
                                className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-2 flex flex-row items-start px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                            >
                                {/* Platform Icon */}
                                <div className="w-12 h-16 flex items-center justify-center pb-2">
                                    {platformIcons[inviteTask.platform] || <div className="w-10 h-10 text-gray-500 p-2">?</div>}
                                </div>

                                <div className="flex flex-col flex-grow mx-2">
                                    {/* Task Name and Question Mark Button */}
                                    <h3
                                        className={`font-bold text-left break-words whitespace-normal ${
                                            inviteTask.name.length > 50 ? 'text-xs' : 'text-sm'
                                        } flex items-center relative`}
                                    >
                                        {inviteTask.name}
                                        {/* Question Mark Button */}
                                        <button
                                            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                            onClick={() => toggleTooltip(inviteTask.id)}
                                        >
                                            ?
                                        </button>
                                        {/* Tooltip */}
                                        {visibleTooltip === inviteTask.id && (
                                            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                                                {inviteTask.description}
                                                <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => setVisibleTooltip(null)}>
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </h3>

                                    {/* XP and Users Completed */}
                                    <div className="flex items-center mt-1">
                                        {/* +XP with coin-stack icon */}
                                        <div className="flex items-center">
                                            <span className="mx-1 text-xs text-gray-100">+{inviteTask.xp}</span>
                                            <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                        </div>
                                        {/* Spacer */}
                                        <div className="mx-2"></div>
                                        {/* Head count */}
                                        {/* <div className="flex items-center">
                                            <span role="img" aria-label="User" className="text-sm">
                                                👨
                                            </span>
                                            <span className="ml-1 text-sm text-gray-100">{inviteTask._count.userVerification}</span>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col space-y-1 justify-center items-center mr-2">
                                    {/* Action Button */}
                                    <Button
                                        rounded
                                        onClick={() => handleAction(inviteTask)}
                                        className="!text-2xs font-bold shadow-xl !w-16 !h-6"
                                        style={{
                                            background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                            color: '#fff'
                                        }}
                                    >
                                        {getActionLabel(inviteTask.verificationMethod)}
                                    </Button>

                                    {/* Verify Button */}
                                    <Button
                                        rounded
                                        outline
                                        onClick={() => handleVerify(inviteTask)}
                                        className="!text-2xs font-bold shadow-xl !w-16 !h-6"
                                        style={{
                                            borderColor: '#3b82f6',
                                            color: '#fff'
                                        }}
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Other Tasks */}
                        {tasks
                            .filter((task) => task.verificationMethod !== 'INVITE_TELEGRAM_FRIEND')
                            .map((task) => (
                                <div
                                    key={task.id}
                                    className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                                >
                                    {/* Platform Icon */}
                                    <div className="w-12 h-16 flex items-center justify-center pt-2">
                                        {platformIcons[task.platform] || <div className="w-8 h-8 text-gray-500">?</div>}
                                    </div>

                                    <div className="flex flex-col flex-grow mx-2 py-1">
                                        {/* Task Name and Question Mark Button */}
                                        <h3 className={`font-semibold text-left break-words whitespace-normal text-xs flex items-center relative`}>
                                            {task.name}
                                            {/* Question Mark Button */}
                                            <button
                                                className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                                onClick={() => toggleTooltip(task.id)}
                                            >
                                                ?
                                            </button>
                                            {/* Tooltip */}
                                            {visibleTooltip === task.id && (
                                                <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                                                    {task.description}
                                                    <button
                                                        className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                                                        onClick={() => setVisibleTooltip(null)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            )}
                                        </h3>

                                        {/* XP and Users Completed */}
                                        <div className="flex items-center mt-1">
                                            {/* +XP with coin-stack icon */}
                                            <div className="flex items-center">
                                                <span className="mx-1 text-sm text-gray-100">+{task.xp}</span>
                                                <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                            </div>
                                            {/* Spacer */}
                                            <div className="mx-2"></div>
                                            {/* Head count */}
                                            {/* <div className="flex items-center">
                                                <span role="img" aria-label="User" className="text-sm">
                                                    👨
                                                </span>
                                                <span className="ml-1 text-sm text-gray-100">{task._count.userVerification}</span>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col space-y-1 justify-center mr-2">
                                        {/* Action Button */}
                                        <Button
                                            rounded
                                            onClick={() => handleAction(task)}
                                            className="!text-2xs font-bold shadow-xl !w-16 !h-6"
                                            style={{
                                                background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                                color: '#fff'
                                            }}
                                        >
                                            {getActionLabel(task.verificationMethod)}
                                        </Button>

                                        {/* Verify Button */}
                                        <Button
                                            rounded
                                            outline
                                            onClick={() => handleVerify(task)}
                                            className="!text-2xs font-bold shadow-xl !w-16 !h-6"
                                            style={{
                                                borderColor: '#3b82f6',
                                                color: '#fff'
                                            }}
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </Page>
    )
}
