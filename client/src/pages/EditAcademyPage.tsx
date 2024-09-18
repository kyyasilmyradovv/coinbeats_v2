// client/src/pages/EditAcademyPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, Block, List, ListInput, Button, Card } from 'konsta/react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import axios from '../api/axiosInstance'
import useCategoryChainStore from '../store/useCategoryChainStore'
import useAcademyStore from '../store/useAcademyStore'

const EditAcademyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { categories: categoryList, chains: chainList, fetchCategoriesAndChains } = useCategoryChainStore()

    const {
        name,
        ticker,
        categories,
        chains,
        twitter,
        telegram,
        discord,
        coingecko,
        logo,
        coverPhoto,
        webpageUrl,
        initialAnswers,
        raffles,
        quests,
        updateAcademy,
        setField,
        setInitialAnswer,
        toggleCorrectAnswer,
        addRaffle,
        removeRaffle,
        addQuest,
        removeQuest,
        submitAcademy,
        setPrefilledAcademyData,
        resetAcademyData
    } = useAcademyStore()

    const [loading, setLoading] = useState(true)
    const [logoFile, setLogoFile] = useState<File | null>(null) // Local state for file handling
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null) // Local state for file handling

    useEffect(() => {
        const fetchAcademyData = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/academies/${id}`)
                setPrefilledAcademyData(response.data)
            } catch (error) {
                console.error('Error fetching academy data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAcademyData()

        return () => {
            resetAcademyData()
            console.log('Academy store reset after leaving EditAcademyPage.')
        }
    }, [id, setPrefilledAcademyData, resetAcademyData])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    const handleFileChange = (field: 'logo' | 'coverPhoto', file: File | null) => {
        if (field === 'logo') {
            setLogoFile(file) // Update local state
        } else {
            setCoverPhotoFile(file) // Update local state
        }
    }

    const constructImageUrl = (url: string) => {
        return `https://subscribes.lt/${url}`
    }

    const handleSubmit = async () => {
        try {
            if (id) {
                await updateAcademy(parseInt(id, 10), logoFile, coverPhotoFile)
            } else {
                console.error('No academy ID found for updating.')
            }
            console.log('Academy updated successfully.')
            navigate('/my-academies')
        } catch (error) {
            console.error('Error updating academy:', error)
        }
    }

    const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    const renderInitialQuestionSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        // Check if this is the "Tokenomics details" question
        if (question.question === 'Tokenomics details') {
            // Parse the tokenomics data from the answer field
            const tokenomics = question.answer ? JSON.parse(question.answer) : {}

            return (
                <Card
                    key={`initial-question-${questionIndex}`}
                    className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600"
                >
                    <h2 className="text-lg font-bold mb-4">Tokenomics Details</h2>
                    <List>
                        <ListInput
                            label="Total Supply"
                            type="text"
                            value={tokenomics.totalSupply || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, totalSupply: e.target.value }))}
                            outline
                            colors={{
                                bgIos: 'bg-black', // iOS theme background color inside the input
                                bgMaterial: 'bg-black' // Material theme background color inside the input
                            }}
                        />
                        <ListInput
                            label="Utility"
                            type="text"
                            value={tokenomics.utility || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, utility: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="Logic"
                            type="text"
                            value={tokenomics.logic || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, logic: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="CoinGecko"
                            type="text"
                            value={tokenomics.coingecko || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, coingecko: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="Dex Screener"
                            type="text"
                            value={tokenomics.dexScreener || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, dexScreener: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="Contract Address"
                            type="text"
                            value={tokenomics.contractAddress || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, contractAddress: e.target.value }))}
                            outline
                        />
                        <ListInput label="Add Chain" type="select" onChange={(e) => setField('chains', [...chains, e.target.value])} value="" outline>
                            <option value="">Select Chain</option>
                            {chainList.map((chain) => (
                                <option key={chain.id} value={chain.name}>
                                    {chain.name}
                                </option>
                            ))}
                        </ListInput>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {chains.map((chain, index) => (
                                <div key={index} className="relative">
                                    <span
                                        onClick={() =>
                                            setField(
                                                'chains',
                                                chains.filter((_, i) => i !== index)
                                            )
                                        }
                                        className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg"
                                    >
                                        {chain}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <ListInput
                            label={`Quiz Question ${questionIndex + 1}`}
                            type="textarea"
                            value={question.quizQuestion || ''}
                            onChange={(e) => {
                                setInitialAnswer(questionIndex, 'quizQuestion', e.target.value)
                                autoresize(e)
                            }}
                            outline
                        />
                        {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center">
                                <ListInput
                                    label={`Choice ${choiceIndex + 1}`}
                                    type="textarea"
                                    value={choice.answer || ''}
                                    onChange={(e) =>
                                        setInitialAnswer(questionIndex, 'choices', {
                                            index: choiceIndex,
                                            choice: { ...choice, answer: e.target.value }
                                        })
                                    }
                                    outline
                                />
                                <input
                                    type="radio"
                                    checked={choice.correct || false}
                                    onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
                                    className="custom-radio ml-2"
                                />
                            </div>
                        ))}
                        <ListInput
                            label="Video URL"
                            type="url"
                            value={question.video || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
                            outline
                        />
                        {question.video && (
                            <iframe
                                title={`video-${questionIndex}`}
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${question.video}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </List>
                </Card>
            )
        }

        return (
            <Card
                key={`initial-question-${questionIndex}`}
                className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600"
            >
                <h2 className="text-lg font-bold mb-4">Initial Question {questionIndex + 1}</h2>
                <List>
                    <div className="mb-4">
                        <label className="block text-gray-700">Question {questionIndex + 1}</label>
                        <p className="text-gray-500">{question.question}</p>
                    </div>
                    <ListInput
                        label={`Answer ${questionIndex + 1}`}
                        type="textarea"
                        value={question.answer || ''}
                        onChange={(e) => {
                            setInitialAnswer(questionIndex, 'answer', e.target.value)
                            autoresize(e)
                        }}
                        outline
                    />
                    <ListInput
                        label={`Quiz Question ${questionIndex + 1}`}
                        type="textarea"
                        value={question.quizQuestion || ''}
                        onChange={(e) => {
                            setInitialAnswer(questionIndex, 'quizQuestion', e.target.value)
                            autoresize(e)
                        }}
                        outline
                    />
                    {question.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center">
                            <ListInput
                                label={`Choice ${choiceIndex + 1}`}
                                type="textarea"
                                value={choice.answer || ''}
                                onChange={(e) =>
                                    setInitialAnswer(questionIndex, 'choices', {
                                        index: choiceIndex,
                                        choice: { ...choice, answer: e.target.value }
                                    })
                                }
                                outline
                            />
                            <input
                                type="radio"
                                checked={choice.correct || false}
                                onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
                                className="custom-radio ml-2"
                            />
                        </div>
                    ))}
                    <ListInput
                        label="Video URL"
                        type="url"
                        value={question.video || ''}
                        onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
                        outline
                    />
                    {question.video && (
                        <iframe
                            title={`video-${questionIndex}`}
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${question.video}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </List>
            </Card>
        )
    }

    const renderRaffleSlide = () => (
        <Card key="raffle-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Raffles</h2>
            {Array.isArray(raffles) && raffles.length > 0 ? (
                raffles.map((raffle, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
                        <List>
                            <ListInput
                                label="Amount"
                                type="number"
                                value={raffle.amount}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], amount: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Reward"
                                type="text"
                                value={raffle.reward}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], reward: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Currency"
                                type="text"
                                value={raffle.currency}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], currency: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Chain"
                                type="text"
                                value={raffle.chain}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], chain: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Dates"
                                type="text"
                                value={raffle.dates}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], dates: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Total Pool"
                                type="number"
                                value={raffle.totalPool}
                                onChange={(e) => setField('raffles', { ...raffles, [index]: { ...raffles[index], totalPool: e.target.value } })}
                                outline
                            />
                        </List>
                        <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => removeRaffle(index)}>
                            &times;
                        </button>
                    </div>
                ))
            ) : (
                <p>No raffles available</p>
            )}
            <Button onClick={addRaffle} large outline className="w-full rounded-full mt-2">
                Add Raffle
            </Button>
        </Card>
    )

    const renderQuestSlide = () => (
        <Card key="quest-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Quests</h2>
            {Array.isArray(quests) && quests.length > 0 ? (
                quests.map((quest, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
                        <List>
                            <ListInput
                                label="Quest Name"
                                type="text"
                                value={quest.name}
                                onChange={(e) => setField('quests', { ...quests, [index]: { ...quests[index], name: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Quest Link"
                                type="url"
                                value={quest.link}
                                onChange={(e) => setField('quests', { ...quests, [index]: { ...quests[index], link: e.target.value } })}
                                outline
                            />
                            <ListInput
                                label="Platform"
                                type="select"
                                value={quest.platform}
                                onChange={(e) => setField('quests', { ...quests, [index]: { ...quests[index], platform: e.target.value } })}
                                outline
                            >
                                <option value="">Select Platform</option>
                                <option value="facebook">Facebook</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="twitter">Twitter</option>
                            </ListInput>
                        </List>
                    </div>
                ))
            ) : (
                <p>No quests available</p>
            )}
            <Button onClick={addQuest} large outline className="w-full border rounded-full mt-2">
                Add Quest
            </Button>
        </Card>
    )

    const renderAcademyDetailsSlide = () => (
        <Card key="academy-details-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Academy Details</h2>
            <List>
                <ListInput label="Protocol Name" type="text" value={name} onChange={(e) => setField('name', e.target.value)} outline />
                <ListInput label="Ticker" type="text" value={ticker} onChange={(e) => setField('ticker', e.target.value)} outline />
                <ListInput label="Webpage URL" type="url" value={webpageUrl} onChange={(e) => setField('webpageUrl', e.target.value)} outline />
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {logo && (
                        <div className="relative mt-2">
                            <img src={constructImageUrl(logo)} alt="Logo Preview" className="w-32 h-32 object-cover rounded-full" />
                            <Button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full !w-7 !m-1" onClick={() => setField('logo', null)}>
                                &times;
                            </Button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {coverPhoto && (
                        <div className="relative mt-2 !rounded-2xl">
                            <img src={constructImageUrl(coverPhoto)} alt="Cover Photo Preview" className="w-full h-48 object-cover rounded-2xl" />
                            <Button
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full !w-7 !m-1"
                                onClick={() => setField('coverPhoto', null)}
                            >
                                &times;
                            </Button>
                        </div>
                    )}
                </div>
                <ListInput label="Add Category" type="select" onChange={(e) => setField('categories', [...categories, e.target.value])} value="" outline>
                    <option value="">Select Category</option>
                    {categoryList.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category, index) => (
                        <div key={index} className="relative">
                            <span
                                onClick={() =>
                                    setField(
                                        'categories',
                                        categories.filter((_, i) => i !== index)
                                    )
                                }
                                className="bg-blue-200 dark:bg-blue-600 px-2 py-1 rounded-lg"
                            >
                                {category}
                            </span>
                        </div>
                    ))}
                </div>
            </List>
        </Card>
    )

    const renderSocialLinksSlide = () => (
        <Card key="social-links-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Social Links</h2>
            <List>
                <ListInput label="Twitter" type="url" value={twitter} onChange={(e) => setField('twitter', e.target.value)} outline />
                <ListInput label="Telegram" type="url" value={telegram} onChange={(e) => setField('telegram', e.target.value)} outline />
                <ListInput label="Discord" type="url" value={discord} onChange={(e) => setField('discord', e.target.value)} outline />
                <ListInput label="CoinGecko" type="url" value={coingecko} onChange={(e) => setField('coingecko', e.target.value)} outline />
            </List>
        </Card>
    )

    // Render all initial question slides
    const slides = [
        renderAcademyDetailsSlide(),
        renderSocialLinksSlide(),
        ...initialAnswers.map((_, index) => renderInitialQuestionSlide(index)), // Ensure all questions are rendered
        renderRaffleSlide(),
        renderQuestSlide()
    ]

    return (
        <Page>
            <Navbar />
            <Sidebar />
            {slides.map((slide, index) => (
                <div key={index}>{slide}</div>
            ))}
            <Button onClick={handleSubmit} large raised className="!w-[86%] bg-brand-primary text-white rounded-full mx-auto my-4">
                Save Academy
            </Button>
        </Page>
    )
}

export default EditAcademyPage
