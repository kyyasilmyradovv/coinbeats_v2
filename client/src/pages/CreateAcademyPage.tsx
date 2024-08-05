// src/pages/CreateAcademyPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Page,
  Block,
  List,
  ListInput,
  Button,
  Notification,
  Radio,
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import bunny from '../images/bunny-mascot.png';
import useCategoryChainStore from '../store/useCategoryChainStore'; // Import the store
import useAcademyStore from '../store/useAcademyStore'; // Import the academy store

const CreateAcademyPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [notificationOpen, setNotificationOpen] = useState(true);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    webpageUrl,
    coverPhoto,
    initialAnswers,
    tokenomics,
    teamBackground,
    congratsVideo,
    getStarted,
    raffles,
    quests,
    visibleQuestionsCount,
    setField,
    setInitialAnswer,
    toggleCorrectAnswer, // Import the new action
    addRaffle,
    addQuest,
    submitAcademy,
    fetchQuestions, // Fetch questions from the store
  } = useAcademyStore();

  const navigate = useNavigate();

  // Zustand CategoryChain Store
  const {
    categories: categoryList,
    chains: chainList,
    fetchCategoriesAndChains,
  } = useCategoryChainStore((state) => ({
    categories: state.categories,
    chains: state.chains,
    fetchCategoriesAndChains: state.fetchCategoriesAndChains,
  }));

  // Fetch questions and categories & chains from Zustand store on component mount
  useEffect(() => {
    console.log('Fetching questions and categories/chains');
    fetchQuestions(); // Fetch questions into the store
    fetchCategoriesAndChains();
  }, [fetchQuestions, fetchCategoriesAndChains]);

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  const handleFileChange = (field: string, file: File | null) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setField(field, e.target.result);
      }
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setField(field, null);
    }
  };

  const handleChoiceChange = (
    questionIndex: number,
    choiceIndex: number,
    newValue: string
  ) => {
    console.log(
      `Changing choice - questionIndex: ${questionIndex}, choiceIndex: ${choiceIndex}, newValue: ${newValue}`
    );
    const updatedChoice = {
      ...initialAnswers[questionIndex].choices[choiceIndex],
      answer: newValue,
    };
    console.log('Updated choice before setting:', updatedChoice);
    setInitialAnswer(questionIndex, 'choices', {
      index: choiceIndex,
      choice: updatedChoice,
    });
  };

  const handleAddQuestion = () => {
    if (visibleQuestionsCount < initialAnswers.length) {
      setField('visibleQuestionsCount', visibleQuestionsCount + 1);
    }
  };

  const handleCloseNotification = () => {
    const closeCount =
      parseInt(localStorage.getItem('academyNotificationCloseCount') || '0', 10) + 1;
    localStorage.setItem('academyNotificationCloseCount', closeCount.toString());
    if (closeCount >= 3) {
      localStorage.setItem('dontShowAcademyNotification', 'true');
    }
    setNotificationOpen(false);
  };

  useEffect(() => {
    const dontShowNotification =
      localStorage.getItem('dontShowAcademyNotification') === 'true';
    if (dontShowNotification) {
      setNotificationOpen(false);
    }
  }, []);

  return (
    <Page>
      {/* Notification at the top */}
      <Notification
        opened={notificationOpen}
        onClose={handleCloseNotification}
        icon={<img src={bunny} alt="Coinbeats Logo" className="w-10 h-10" />}
        title="Message from Coinbeats Bunny"
        text="To create an Academy, fill in all the required fields and submit the request. Our Admin will work through the application and if something is missing or needs clarifications, you will get a message to your inbox and also on your e-mail. Happy creating."
        button={<Button onClick={handleCloseNotification}>Close</Button>}
        className="!p-6"
      />

      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      {/* Academy Creation Form */}
      <Block
        strong
        className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4"
      >
        <h2 className="text-lg font-bold mb-4 text-center">Create Academy Form</h2>
        <List>
          <ListInput
            label="Academy Name"
            type="text"
            placeholder="Enter Academy Name"
            value={name}
            onChange={(e) => setField('name', e.target.value)}
            required
          />
          <ListInput
            label="Ticker"
            type="text"
            placeholder="Enter Ticker"
            value={ticker}
            onChange={(e) => setField('ticker', e.target.value)}
            required
          />

          <h3 className="text-md font-semibold mt-4">Academy Details</h3>
          <ListInput
            label="Webpage URL"
            type="text"
            placeholder="Enter Webpage URL"
            value={webpageUrl}
            onChange={(e) => setField('webpageUrl', e.target.value)}
          />

          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange('logo', e.target.files ? e.target.files[0] : null)
              }
            />
            {logo && (
              <img
                src={logo}
                alt="Logo Preview"
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Cover Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(
                  'coverPhoto',
                  e.target.files ? e.target.files[0] : null
                )
              }
            />
            {coverPhoto && (
              <img
                src={coverPhoto}
                alt="Cover Photo Preview"
                className="mt-2 w-full h-48 object-cover"
              />
            )}
          </div>

          <h3 className="text-md font-semibold mt-4">Categories</h3>
          {/* Category Selection */}
          <ListInput
            label="Add Category"
            type="select"
            onChange={(e) =>
              setField('categories', [...categories, e.target.value])
            }
            value=""
            placeholder="Select Category"
          >
            <option value="">Select Category</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </ListInput>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <span key={index} className="bg-blue-200 px-2 py-1 rounded-lg">
                {category}
              </span>
            ))}
          </div>

          <h3 className="text-md font-semibold mt-4">Chains</h3>
          {/* Chain Selection */}
          <ListInput
            label="Add Chain"
            type="select"
            onChange={(e) => setField('chains', [...chains, e.target.value])}
            value=""
            placeholder="Select Chain"
          >
            <option value="">Select Chain</option>
            {chainList.map((chain) => (
              <option key={chain.id} value={chain.name}>
                {chain.name}
              </option>
            ))}
          </ListInput>
          <div className="flex flex-wrap gap-2 mb-4">
            {chains.map((chain, index) => (
              <span key={index} className="bg-green-200 px-2 py-1 rounded-lg">
                {chain}
              </span>
            ))}
          </div>

          <h3 className="text-md font-semibold mt-4">Social Links</h3>
          <ListInput
            label="Twitter Account"
            type="text"
            placeholder="Enter Twitter Account"
            value={twitter}
            onChange={(e) => setField('twitter', e.target.value)}
          />
          <ListInput
            label="Telegram Account"
            type="text"
            placeholder="Enter Telegram Account"
            value={telegram}
            onChange={(e) => setField('telegram', e.target.value)}
          />
          <ListInput
            label="Discord Channel"
            type="text"
            placeholder="Enter Discord Channel"
            value={discord}
            onChange={(e) => setField('discord', e.target.value)}
          />
          <ListInput
            label="CoinGeko Address"
            type="text"
            placeholder="Enter CoinGeko Address"
            value={coingecko}
            onChange={(e) => setField('coingecko', e.target.value)}
          />

          <h3 className="text-md font-semibold mt-4">Educational Quiz Section</h3>
          {initialAnswers.slice(0, visibleQuestionsCount).map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="mb-4 p-4 border rounded-lg shadow-sm"
            >
              <p className="font-medium mb-2">{`Question ${
                questionIndex + 1
              }: ${question.question}`}</p>
              <ListInput
                label={`Answer to Question ${questionIndex + 1}`}
                type="text"
                placeholder="Enter your answer"
                value={question.answer || ''}
                onChange={(e) =>
                  setInitialAnswer(questionIndex, 'answer', e.target.value)
                }
              />
              <ListInput
                label={`Quiz Question ${questionIndex + 1}`}
                type="text"
                placeholder={`Enter the quiz question for Question ${
                  questionIndex + 1
                }`}
                value={question.quizQuestion || ''}
                onChange={(e) =>
                  setInitialAnswer(
                    questionIndex,
                    'quizQuestion',
                    e.target.value
                  )
                }
              />
              <h4 className="font-medium mt-2">Choices</h4>
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex items-center mb-2">
                  <ListInput
                    label={`Answer ${choiceIndex + 1}`}
                    type="text"
                    placeholder={`Enter Answer ${choiceIndex + 1}`}
                    value={choice.answer}
                    onChange={(e) =>
                      handleChoiceChange(questionIndex, choiceIndex, e.target.value)
                    }
                  />
                  <Radio
                    type="checkbox"
                    disabled={!choice.answer} // Disable if answer is empty
                    checked={choice.correct} // Use the correct property
                    onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)} // Use the store action
                    className="ml-4"
                  />
                </div>
              ))}
              <ListInput
                label={`Video URL for Question ${questionIndex + 1}`}
                type="text"
                placeholder="Enter Video URL"
                value={question.video || ''}
                onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
              />
            </div>
          ))}
          <Button
            onClick={handleAddQuestion}
            disabled={visibleQuestionsCount >= initialAnswers.length}
            className="rounded-full"
          >
            Add Next Question
          </Button>

          <h3 className="text-md font-semibold mt-4">Details</h3>
          <ListInput
            label="Tokenomics Details"
            type="textarea"
            placeholder="Enter Tokenomics Details"
            value={tokenomics}
            onChange={(e) => setField('tokenomics', e.target.value)}
          />
          <ListInput
            label="Team Background"
            type="text"
            placeholder="Enter Team Background"
            value={teamBackground}
            onChange={(e) => setField('teamBackground', e.target.value)}
          />
          <ListInput
            label="Congrats Video"
            type="text"
            placeholder="Enter Congrats Video Link"
            value={congratsVideo}
            onChange={(e) => setField('congratsVideo', e.target.value)}
          />
          <ListInput
            label="Get Started"
            type="textarea"
            placeholder="Enter Get Started Information"
            value={getStarted}
            onChange={(e) => setField('getStarted', e.target.value)}
          />

          <h3 className="text-md font-semibold mt-4">Raffle Section</h3>
          {raffles.map((raffle, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Raffle {index + 1}</h4>
              <ListInput
                label="Amount of Raffles"
                type="text"
                placeholder="Enter Amount"
                value={raffle.amount}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, amount: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Reward per Raffle"
                type="text"
                placeholder="Enter Reward"
                value={raffle.reward}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, reward: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Raffle Reward Currency"
                type="text"
                placeholder="Enter Currency"
                value={raffle.currency}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, currency: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Chain"
                type="text"
                placeholder="Enter Chain"
                value={raffle.chain}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, chain: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Raffle Dates"
                type="text"
                placeholder="Enter Dates"
                value={raffle.dates}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, dates: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Total Raffle Pool"
                type="text"
                placeholder="Enter Total Pool"
                value={raffle.totalPool}
                onChange={(e) =>
                  setField('raffles', [
                    ...raffles.slice(0, index),
                    { ...raffle, totalPool: e.target.value },
                    ...raffles.slice(index + 1),
                  ])
                }
              />
            </div>
          ))}
          <Button onClick={addRaffle} className="rounded-full">
            Add Raffle
          </Button>

          <h3 className="text-md font-semibold mt-4">Quest Section</h3>
          {quests.map((quest, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Quest {index + 1}</h4>
              <ListInput
                label="Quest Name"
                type="text"
                placeholder="Enter Quest Name"
                value={quest.name}
                onChange={(e) =>
                  setField('quests', [
                    ...quests.slice(0, index),
                    { ...quest, name: e.target.value },
                    ...quests.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Quest Link"
                type="text"
                placeholder="Enter Quest Link"
                value={quest.link}
                onChange={(e) =>
                  setField('quests', [
                    ...quests.slice(0, index),
                    { ...quest, link: e.target.value },
                    ...quests.slice(index + 1),
                  ])
                }
              />
              <ListInput
                label="Platform Binding"
                type="select"
                placeholder="Select Platform"
                value={quest.platform}
                onChange={(e) =>
                  setField('quests', [
                    ...quests.slice(0, index),
                    { ...quest, platform: e.target.value },
                    ...quests.slice(index + 1),
                  ])
                }
              >
                <option value="">Select Platform</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                {/* Add more options as needed */}
              </ListInput>
            </div>
          ))}
          <Button
            onClick={addQuest}
            disabled={quests.length >= 5}
            className="rounded-full"
          >
            Add Quest
          </Button>

          <Button
            onClick={submitAcademy}
            className="w-full bg-brand-primary text-white mt-4 rounded-full"
          >
            Submit Academy
          </Button>
        </List>
      </Block>
    </Page>
  );
};

export default CreateAcademyPage;
