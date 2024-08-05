// src/store/useAcademyStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import useUserStore from './useUserStore';

interface Choice {
  answer: string;
  correct: boolean; // Track if the answer is correct
}

interface InitialAnswer {
  initialQuestionId: number;
  question: string;
  answer: string;
  quizQuestion: string;
  choices: Choice[];
  video: string;
}

interface Raffle {
  amount: string;
  reward: string;
  currency: string;
  chain: string;
  dates: string;
  totalPool: string;
}

interface Quest {
  name: string;
  link: string;
  platform: string;
}

interface AcademyState {
  name: string;
  ticker: string;
  categories: string[];
  chains: string[];
  twitter: string;
  telegram: string;
  discord: string;
  coingecko: string;
  logo: File | null; // Use File type for uploads
  coverPhoto: File | null; // Use File type for uploads
  webpageUrl: string;
  initialAnswers: InitialAnswer[];
  tokenomics: string;
  teamBackground: string;
  congratsVideo: string;
  getStarted: string;
  raffles: Raffle[];
  quests: Quest[];
  visibleQuestionsCount: number;
  setField: (field: keyof Omit<AcademyState, 'setField' | 'setInitialAnswer' | 'toggleCorrectAnswer' | 'addRaffle' | 'addQuest' | 'submitAcademy' | 'resetAcademyData' | 'fetchQuestions'>, value: any) => void;
  setInitialAnswer: (index: number, field: keyof InitialAnswer, value: any) => void;
  toggleCorrectAnswer: (questionIndex: number, choiceIndex: number) => void;
  addRaffle: () => void;
  addQuest: () => void;
  submitAcademy: () => Promise<void>;
  resetAcademyData: () => void;
  fetchQuestions: () => Promise<void>;
}

const useAcademyStore = create<AcademyState>()(
  devtools(
    (set, get) => ({
      // Initial state
      name: '',
      ticker: '',
      categories: [],
      chains: [],
      twitter: '',
      telegram: '',
      discord: '',
      coingecko: '',
      logo: null,
      coverPhoto: null,
      webpageUrl: '',
      initialAnswers: [],
      tokenomics: '',
      teamBackground: '',
      congratsVideo: '',
      getStarted: '',
      raffles: [
        {
          amount: '',
          reward: '',
          currency: '',
          chain: '',
          dates: '',
          totalPool: '',
        },
      ],
      quests: [{ name: '', link: '', platform: '' }],
      visibleQuestionsCount: 1,

      // Actions
      setField: (field, value) =>
        set(
          (state) => ({
            ...state,
            [field]: value,
          }),
          false,
          `setField: ${field}`
        ),

      setInitialAnswer: (index, field, value) =>
        set((state) => {
          console.log(
            `Setting initial answer - index: ${index}, field: ${field}, value: `,
            value
          );
          const updatedAnswers = [...state.initialAnswers];
          if (field === 'choices') {
            const newChoices = [...updatedAnswers[index].choices]; // Create a new array for choices
            console.log('Current choices:', newChoices);
            newChoices[value.index] = {
              ...newChoices[value.index],
              ...value.choice,
            };
            console.log('Updated choice:', newChoices[value.index]);
            updatedAnswers[index].choices = newChoices; // Assign the new array back to the choices
          } else {
            updatedAnswers[index][field] = value;
          }
          console.log('Updated initial answers:', updatedAnswers);
          return { initialAnswers: updatedAnswers };
        }),

      toggleCorrectAnswer: (questionIndex, choiceIndex) =>
        set((state) => {
          console.log(
            `Toggling correct answer for question ${questionIndex}, choice ${choiceIndex}`
          );
          const updatedAnswers = [...state.initialAnswers];
          const currentCorrect = updatedAnswers[questionIndex].choices[choiceIndex].correct;
          updatedAnswers[questionIndex].choices[choiceIndex].correct = !currentCorrect;
          console.log('Updated initial answers with toggled correct:', updatedAnswers);
          return { initialAnswers: updatedAnswers };
        }),

      addRaffle: () =>
        set(
          (state) => ({
            raffles: [
              ...state.raffles,
              {
                amount: '',
                reward: '',
                currency: '',
                chain: '',
                dates: '',
                totalPool: '',
              },
            ],
          }),
          false,
          'addRaffle'
        ),

      addQuest: () =>
        set(
          (state) => ({
            quests: [...state.quests, { name: '', link: '', platform: '' }],
          }),
          false,
          'addQuest'
        ),

        submitAcademy: async () => {
          const state = get(); // Get the current state
          const { token } = useUserStore.getState(); // Retrieve token from Zustand store
        
          try {
            const formData = new FormData();
            formData.append('name', state.name);
            formData.append('ticker', state.ticker);
            formData.append('categories', JSON.stringify(state.categories));
            formData.append('chains', JSON.stringify(state.chains));
            formData.append('twitter', state.twitter);
            formData.append('telegram', state.telegram);
            formData.append('discord', state.discord);
            formData.append('coingecko', state.coingecko);
            formData.append('webpageUrl', state.webpageUrl);
            formData.append('tokenomics', state.tokenomics);
            formData.append('teamBackground', state.teamBackground);
            formData.append('congratsVideo', state.congratsVideo);
            formData.append('getStarted', state.getStarted);
            formData.append('initialAnswers', JSON.stringify(state.initialAnswers));
            formData.append('raffles', JSON.stringify(state.raffles));
            formData.append('quests', JSON.stringify(state.quests));
            formData.append('status', 'pending');
        
            if (state.logo) {
              formData.append('logo', state.logo);
            }
            if (state.coverPhoto) {
              formData.append('coverPhoto', state.coverPhoto);
            }
        
            // Check if the token is retrieved correctly
            if (!token) {
              console.error("Authorization token is missing");
              throw new Error("Authorization token is missing");
            }
        
            // Send the formData using axios
            await axios.post('http://localhost:7000/api/academies', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,  // Attach the token here
              },
            });
        
            alert(`Your academy "${state.name}" is under review.`);
            state.resetAcademyData(); // Reset data after submission
          } catch (error) {
            console.error('Error creating academy:', error);
          }
        },      

      resetAcademyData: () =>
        set(
          {
            name: '',
            ticker: '',
            categories: [],
            chains: [],
            twitter: '',
            telegram: '',
            discord: '',
            coingecko: '',
            logo: null,
            coverPhoto: null,
            webpageUrl: '',
            initialAnswers: [],
            tokenomics: '',
            teamBackground: '',
            congratsVideo: '',
            getStarted: '',
            raffles: [
              {
                amount: '',
                reward: '',
                currency: '',
                chain: '',
                dates: '',
                totalPool: '',
              },
            ],
            quests: [{ name: '', link: '', platform: '' }],
            visibleQuestionsCount: 1,
          },
          false,
          'resetAcademyData'
        ),

      // Ensure choices are initialized as arrays correctly
      fetchQuestions: async () => {
        try {
          console.log('Fetching initial questions');
          const questionsResponse = await axios.get(
            'http://localhost:7000/api/initial-questions'
          );
          const questions = questionsResponse.data;
          console.log('Fetched initial questions: ', questions);

          set(
            () => ({
              initialAnswers: questions.map((question: any) => ({
                initialQuestionId: question.id,
                question: question.question,
                answer: '',
                quizQuestion: '',
                choices: Array(5).fill({ answer: '', correct: false }), // Initialize with correct as false
                video: '',
              })),
            }),
            false,
            'fetchQuestions'
          );
        } catch (error) {
          console.error('Error fetching initial questions:', error);
        }
      },
    }),
    { name: 'AcademyStore' }
  )
);

export default useAcademyStore;
