// client/src/pages/CreateAcademyPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Page,
  Block,
  List,
  ListInput,
  Button,
  Notification,
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import useCategoryChainStore from '../store/useCategoryChainStore';
import useAcademyStore from '../store/useAcademyStore';
import bunnyLogo from '../images/bunny-mascot.png';

const CreateAcademyPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null);

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
    currentStep,
    submitBasicAcademy,
    submitAcademy,
    setField,
    setInitialAnswer,
    toggleCorrectAnswer,
    fetchQuestions,
    resetAcademyData,
    nextStep,
    prevStep,
  } = useAcademyStore();

  const navigate = useNavigate();

  const {
    categories: categoryList,
    chains: chainList,
    fetchCategoriesAndChains,
  } = useCategoryChainStore();

  useEffect(() => {
    fetchQuestions();
    fetchCategoriesAndChains();
  }, [fetchQuestions, fetchCategoriesAndChains]);

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      useAcademyStore.getState().setField(field, file);
    } else {
      useAcademyStore.getState().setField(field, null);
    }
  };

  const handleImagePreview = (file: File | null) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleCharacterLimit = (e: React.ChangeEvent<HTMLTextAreaElement>, limit: number) => {
    if (e.target.value.length > limit) {
      e.target.value = e.target.value.substring(0, limit);
    }
    autoresize(e);
  };

  const toggleTooltip = (tooltipIndex: number) => {
    if (visibleTooltip === tooltipIndex) {
      setVisibleTooltip(null);
    } else {
      setVisibleTooltip(tooltipIndex);
      setTimeout(() => setVisibleTooltip(null), 2000);
    }
  };

  const removeCategory = (index: number) => {
    setField('categories', categories.filter((_, i) => i !== index));
  };

  const removeChain = (index: number) => {
    setField('chains', chains.filter((_, i) => i !== index));
  };

  const handleSubmitBasic = async () => {
    try {
      await submitBasicAcademy();
      resetAcademyData();
      navigate('/my-academies', { state: { notificationType: 'basic' } });
      console.log("Academy submitted and state reset.");
    } catch (error) {
      console.error('Error submitting academy:', error);
      setNotificationText('Failed to submit academy');
      setNotificationOpen(true);
    }
  };
  
  const handleSubmitComplete = async () => {
    try {
      await submitAcademy();
      resetAcademyData();
      navigate('/my-academies', { state: { notificationType: 'complete' } });
      console.log("Academy submitted and state reset.");
    } catch (error) {
      console.error('Error submitting academy:', error);
      setNotificationText('Failed to submit academy');
      setNotificationOpen(true);
    }
  };  

  const renderIntroSlide = () => (
    <Block key="slide-intro" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4 text-center">
        Great, you have created the content part of the academy!
      </h2>
      <p className="text-center mb-6">
        Let's now add a multiple-choice quiz for each lesson to make sure people are learning?
      </p>
      <Button
        onClick={nextStep}
        className="w-full bg-brand-primary text-white rounded-full mt-4"
        large
        raised
      >
        Yes, let's add quizzes
      </Button>
      <Button
        onClick={handleSubmitBasic}
        className="w-full !bg-gray-500 text-white rounded-full"
        large
        raised
      >
        No, just submit the Academy
      </Button>
    </Block>
  );

  const renderInitialQuestionSlide = (questionIndex: number) => {
    const answerLimit = 1000;

    if (questionIndex === 3) {
      // Custom render for the tokenomics question slide
      return (
        <Block key={`initial-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-center relative">
            <h2 className="text-lg font-bold mb-4 text-center">Answer Initial Question</h2>
            <button
              className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
              onClick={() => toggleTooltip(questionIndex)}
            >
              ?
            </button>
            {visibleTooltip === questionIndex && (
              <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                Provide detailed tokenomics information for your academy.
                <button
                  className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                  onClick={() => setVisibleTooltip(null)}
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          <div className="mb-4 rounded-lg shadow-sm z-10">
          <p className="font-medium mb-2">{`Question 4: ${initialAnswers[3]?.question}`}</p>
            <List>
              <ListInput
                label="Token Chain"
                type="select"
                outline
              onChange={(e) => {
                const updatedChains = [...chains, e.target.value];
                setField('chains', updatedChains);
                setInitialAnswer(3, 'chains', updatedChains);
              }}
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
                <div key={index} className="relative">
                  <span onClick={() => removeChain(index)} className="bg-green-200 px-2 py-1 rounded-lg">
                    {chain}
                  </span>
                </div>
              ))}
            </div>
              <ListInput
                label="Token Utility"
                type="textarea"
                outline
                placeholder="Enter Token Utility"
                inputClassName="!resize-none"
                className="!ml-0 !mr-0"
                value={initialAnswers[questionIndex].utility || ''}
                maxLength={answerLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'utility', e.target.value);
                  handleCharacterLimit(e, answerLimit);
                }}
              />
              {/* Total Supply Input */}
              <ListInput
                label="Total Supply"
                type="number"
                outline
                placeholder="Enter Total Supply"
                value={initialAnswers[questionIndex].totalSupply || ''}
                onChange={(e) => setInitialAnswer(questionIndex, 'totalSupply', e.target.value)}
              />
              {/* Tokenomics Logic and Issuance Input */}
              <ListInput
                label="Tokenomics Logic and Issuance"
                type="textarea"
                outline
                placeholder="Describe Tokenomics Logic and Issuance"
                inputClassName="!resize-none"
                className="!ml-0 !mr-0"
                value={initialAnswers[questionIndex].logic || ''}
                maxLength={answerLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'logic', e.target.value);
                  handleCharacterLimit(e, answerLimit);
                }}
              />
              {/* Coingecko Link */}
              <ListInput
                label="CoinGecko Link"
                type="url"
                outline
                placeholder="Enter CoinGecko Link"
                value={coingecko}
                onChange={(e) => {
                  setField('coingecko', e.target.value);
                  setInitialAnswer(questionIndex, 'coingecko', e.target.value);
                }}
              />
              {/* DexScreener Link */}
              <ListInput
                label="DexScreener Link"
                type="url"
                outline
                placeholder="Enter DexScreener Link"
                value={initialAnswers[questionIndex].dexScreener || ''}
                onChange={(e) => setInitialAnswer(questionIndex, 'dexScreener', e.target.value)}
              />
              {/* Contract Address */}
              <ListInput
                label="Contract Address"
                type="text"
                outline
                placeholder="Enter Contract Address"
                value={initialAnswers[questionIndex].contractAddress || ''}
                onChange={(e) => setInitialAnswer(questionIndex, 'contractAddress', e.target.value)}
              />
            </List>
          </div>
          <div className="flex justify-between">
            <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
              Back
            </Button>
            <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
              Next
            </Button>
          </div>
        </Block>
      );
    }

    // Default render for other initial question slides
    return (
      <Block key={`initial-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-center relative">
          <h2 className="text-lg font-bold mb-4 text-center">Answer Initial Question</h2>
          <button
            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
            onClick={() => toggleTooltip(questionIndex)}
          >
            ?
          </button>
          {visibleTooltip === questionIndex && (
            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
              Provide a detailed answer to the initial question presented.
              <button
                className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                onClick={() => setVisibleTooltip(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <div className="mb-4 rounded-lg shadow-sm z-10">
          <p className="font-medium mb-2">{`Question ${questionIndex + 1}: ${initialAnswers[questionIndex].question}`}</p>
          <List>
            <div className="relative mb-6">
              <ListInput
                label={`Your Answer to Question ${questionIndex + 1}`}
                outline
                type="textarea"
                placeholder="Enter your answer"
                inputClassName="!resize-none"
                className="!ml-0 !mr-0"
                value={initialAnswers[questionIndex].answer || ''}
                maxLength={answerLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'answer', e.target.value);
                  handleCharacterLimit(e, answerLimit);
                }}
              />
              <span className="absolute -top-6 right-2 text-xs text-gray-500 mt-2 mr-2">
                {initialAnswers[questionIndex].answer.length}/{answerLimit}
              </span>
            </div>
          </List>
        </div>
        <div className="flex justify-between">
          <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
            Back
          </Button>
          <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
            Next
          </Button>
        </div>
      </Block>
    );
  };

  const renderAcademyDetailsSlide = () => (
    <Block key="slide-details" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Academy Details</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(1)}
        >
          ?
        </button>
        {visibleTooltip === 1 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
            Provide detailed information about your academy, including the webpage URL, logo, cover photo, and associated blockchain chains.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Webpage URL"
          type="textarea"
          inputClassName="!resize-none z-10"
          outline
          placeholder="Enter Webpage URL"
          value={webpageUrl}
          onChange={(e) => {
            setField('webpageUrl', e.target.value);
            autoresize(e);
          }}
        />
        <div className="relative mb-4">
          <label className="block font-medium mb-2 mt-6">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange('logo', e.target.files ? e.target.files[0] : null)
            }
          />
          {logo && (
            <div className="relative mt-2">
              <img
                src={handleImagePreview(logo)}
                alt="Logo Preview"
                className="w-32 h-32 object-cover"
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                onClick={() => setField('logo', null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <div className="relative mb-10">
          <label className="block font-medium mb-2">Upload Cover Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)
            }
          />
          {coverPhoto && (
            <div className="relative mt-2">
              <img
                src={handleImagePreview(coverPhoto)}
                alt="Cover Photo Preview"
                className="w-full h-48 object-cover"
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                onClick={() => setField('coverPhoto', null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </List>
      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderSocialLinksSlide = () => (
    <Block key="slide-social-links" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Social Links</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(2)}
        >
          ?
        </button>
        {visibleTooltip === 2 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
            Enter the social media links for your academy. These links will help users connect with your academy on various platforms like Twitter, Telegram, and Discord.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Twitter Account"
          type="textarea"
          inputClassName="!resize-none z-10"
          outline
          placeholder="Enter Twitter Account"
          value={twitter}
          onChange={(e) => {
            setField('twitter', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="Telegram Account"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Telegram Account"
          value={telegram}
          onChange={(e) => {
            setField('telegram', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="Discord Channel"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Discord Channel"
          value={discord}
          onChange={(e) => {
            setField('discord', e.target.value);
            autoresize(e);
          }}
        />
      </List>
      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderEducationalQuizSlide = (questionIndex: number) => {
    const quizQuestionLimit = 100;

    const handleToggleCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
      const updatedAnswers = [...initialAnswers];
      // Ensure only one correct answer
      updatedAnswers[questionIndex].choices.forEach((choice, index) => {
        choice.correct = index === choiceIndex;
      });
      setField('initialAnswers', updatedAnswers);
    };

    return (
      <Block key={`quiz-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-center relative">
          <h2 className="text-lg font-bold mb-4 text-center">Educational Quiz Section</h2>
          <button
            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
            onClick={() => toggleTooltip(questionIndex)}
          >
            ?
          </button>
          {visibleTooltip === questionIndex && (
            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
              Set up quiz questions for your learners. Provide multiple choices and mark the correct answer.
              <button
                className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                onClick={() => setVisibleTooltip(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <div className="mb-4 rounded-lg shadow-sm">
          <p className="font-medium mb-2">{`Quiz Question ${questionIndex + 1}: ${initialAnswers[questionIndex].question}`}</p>
          <List>
            <div className="relative">
              <ListInput
                label={`Quiz Question`}
                outline
                type="textarea"
                inputClassName="!resize-none"
                placeholder={`Quiz question for Question ${questionIndex + 1}`}
                value={initialAnswers[questionIndex].quizQuestion || ''}
                maxLength={quizQuestionLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'quizQuestion', e.target.value);
                  handleCharacterLimit(e, quizQuestionLimit);
                }}
              />
              <span className="absolute -top-6 right-2 text-xs text-gray-500 mt-2 mr-2">
                {initialAnswers[questionIndex].quizQuestion.length}/{quizQuestionLimit}
              </span>
            </div>
            <div className="flex justify-between">
              <h4 className="font-medium mt-2">Choices</h4>
              <h4 className="font-medium mt-2">Correct<br />answer</h4>
            </div>
            {initialAnswers[questionIndex].choices.slice(0, 4).map((choice, choiceIndex) => (
              <div key={choiceIndex} className="flex items-center">
                <ListInput
                  label={`Answer ${choiceIndex + 1}`}
                  type="textarea"
                  inputClassName="!resize-none"
                  outline
                  placeholder={`Enter Answer ${choiceIndex + 1}`}
                  value={choice.answer}
                  onChange={(e) => {
                    setInitialAnswer(questionIndex, 'choices', {
                      index: choiceIndex,
                      choice: { ...choice, answer: e.target.value },
                    });
                    autoresize(e);
                  }}
                />
                <input
                  type="radio"
                  checked={choice.correct}
                  onChange={() => handleToggleCorrectAnswer(questionIndex, choiceIndex)}
                  className="custom-radio ml-2"
                  disabled={!choice.answer}
                />
              </div>
            ))}
          </List>
        </div>
        <div className="flex justify-between">
          <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
            Back
          </Button>
          <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
            Next
          </Button>
        </div>
      </Block>
    );
  };

  const renderReviewSlide = () => (
    <Block key="slide-review" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Review and Submit</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(5)}
        >
          ?
        </button>
        {visibleTooltip === 5 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Review all the details you have entered. Make sure everything is correct before submitting your academy for review.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
  
      {/* Protocol Name and Ticker */}
      <div className="mb-4">
        <h3 className="font-medium">Protocol Name:</h3>
        <p>{name || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Ticker:</h3>
        <p>{ticker || 'N/A'}</p>
      </div>
  
      {/* Academy Details */}
      <div className="mb-4">
        <h3 className="font-medium">Webpage URL:</h3>
        <p>{webpageUrl || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Logo:</h3>
        {logo ? <img src={handleImagePreview(logo)} alt="Logo Preview" className="mt-2 w-32 h-32 object-cover" /> : <p>N/A</p>}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Cover Photo:</h3>
        {coverPhoto ? <img src={handleImagePreview(coverPhoto)} alt="Cover Photo Preview" className="mt-2 w-full h-48 object-cover" /> : <p>N/A</p>}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Categories:</h3>
        <p>{categories.length > 0 ? categories.join(', ') : 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Chains:</h3>
        <p>{chains.length > 0 ? chains.join(', ') : 'N/A'}</p>
      </div>
  
      {/* Initial Questions and Answers */}
      <div className="mb-4">
        <h3 className="font-medium">Initial Questions and Answers:</h3>
        {initialAnswers.map((question, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium">{`Question ${index + 1}: ${question.question}`}</h4>
            {index === 3 ? (
              <div className="ml-4">
                <p><strong>Token Chain:</strong> {question.chains?.join(', ') || 'N/A'}</p>
                <p><strong>Token Utility:</strong> {question.utility || 'N/A'}</p>
                <p><strong>Total Supply:</strong> {question.totalSupply || 'N/A'}</p>
                <p><strong>Tokenomics Logic and Issuance:</strong> {question.logic || 'N/A'}</p>
                <p><strong>CoinGecko Link:</strong> {question.coingecko || 'N/A'}</p>
                <p><strong>DexScreener Link:</strong> {question.dexScreener || 'N/A'}</p>
                <p><strong>Contract Address:</strong> {question.contractAddress || 'N/A'}</p>
              </div>
            ) : (
              <p>{question.answer || 'N/A'}</p>
            )}
          </div>
        ))}
      </div>
  
      {/* Social Links */}
      <div className="mb-4">
        <h3 className="font-medium">Twitter Account:</h3>
        <p>{twitter || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Telegram Account:</h3>
        <p>{telegram || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Discord Channel:</h3>
        <p>{discord || 'N/A'}</p>
      </div>
  
      {/* Educational Quiz Section */}
      <div className="mb-4">
        <h3 className="font-medium">Educational Quiz Section:</h3>
        {initialAnswers.map((question, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium">{`Add quiz to lesson ${index + 1}: ${question.quizQuestion}`}</h4>
            <p><strong>Choices:</strong></p>
            <ul className="list-disc ml-5">
              {question.choices.slice(0, 4).map((choice, choiceIndex) => (
                <li key={choiceIndex}>{choice.answer || 'N/A'} {choice.correct && '(Correct)'}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
  
      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={handleSubmitComplete} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Submit Academy
        </Button>
      </div>
    </Block>
  );
  
  const slides = [
    // First slide for Protocol Name, Ticker, and Category
    <Block key="slide1" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Create Academy Form</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(6)}
        >
          ?
        </button>
        {visibleTooltip === 6 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
            Fill in the protocol name, ticker (optional), and select category for your academy. This is the first step to create a new academy.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Protocol Name"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Protocol Name"
          value={name}
          onChange={(e) => {
            setField('name', e.target.value);
            autoresize(e);
          }}
          required
        />
        <ListInput
          label="Ticker (optional)"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Ticker"
          value={ticker}
          onChange={(e) => {
            setField('ticker', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="Add Category"
          type="select"
          outline
          onChange={(e) => {
            setField('categories', [...categories, e.target.value]);
          }}
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
            <div key={index} className="relative">
              <span onClick={() => removeCategory(index)} className="bg-blue-200 px-2 py-1 rounded-lg">
                {category}
              </span>
            </div>
          ))}
        </div>
      </List>
      <Button onClick={nextStep} large raised className="w-full bg-brand-primary text-white mt-4 rounded-full">
        Next
      </Button>
    </Block>,

    // Dynamically render each initial question slide
    ...initialAnswers.map((_, index) => renderInitialQuestionSlide(index)),

    // Slide for Academy Details
    renderAcademyDetailsSlide(),

    // Slide for Social Links
    renderSocialLinksSlide(),

    renderIntroSlide(),

    // Dynamically render each educational quiz slide
    ...initialAnswers.map((_, index) => renderEducationalQuizSlide(index)),

    // Review and Submit slide
    renderReviewSlide(),
  ];

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setVisibleTooltip(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      {/* Render the current slide */}
      {slides[currentStep]}

      {/* Notification */}
      <Notification
        opened={notificationOpen}
        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
        title="Message from Coinbeats Bunny"
        text={notificationText}
        button={
          <Button onClick={() => setNotificationOpen(false)}>
            Close
          </Button>
        }
        onClose={() => setNotificationOpen(false)}
      />
    </Page>
  );
};

export default CreateAcademyPage;
