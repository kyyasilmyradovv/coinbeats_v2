// client/src/store/useAcademyStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from '../api/axiosInstance';
import useAuthStore from './useAuthStore';

interface Choice {
  answer: string;
  correct: boolean;
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
  logo: string | null;
  coverPhoto: string | null;
  webpageUrl: string;
  initialAnswers: InitialAnswer[];
  tokenomics: string;
  teamBackground: string;
  congratsVideo: string;
  getStarted: string;
  raffles: Raffle[];
  quests: Quest[];
  visibleQuestionsCount: number;
  currentStep: number;
  setField: (
    field: keyof Omit<
      AcademyState,
      'setField' | 'setInitialAnswer' | 'toggleCorrectAnswer' | 'addRaffle' | 'addQuest' | 'submitAcademy' | 'resetAcademyData' | 'fetchQuestions' | 'nextStep' | 'prevStep' | 'removeRaffle' | 'removeQuest'
    >,
    value: any
  ) => void;
  setInitialAnswer: (index: number, field: keyof InitialAnswer, value: any) => void;
  toggleCorrectAnswer: (questionIndex: number, choiceIndex: number) => void;
  addRaffle: () => void;
  removeRaffle: (index: number) => void;
  addQuest: () => void;
  removeQuest: (index: number) => void;
  submitAcademy: () => Promise<void>;
  resetAcademyData: () => void;
  fetchQuestions: () => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
}

const useAcademyStore = create<AcademyState>()(
  devtools(
    (set, get) => ({
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
      currentStep: 0,

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
          const updatedAnswers = [...state.initialAnswers];
          if (field === 'choices') {
            const newChoices = [...updatedAnswers[index].choices];
            newChoices[value.index] = {
              ...newChoices[value.index],
              ...value.choice,
            };
            updatedAnswers[index].choices = newChoices;
          } else {
            updatedAnswers[index][field] = value;
          }
          return { initialAnswers: updatedAnswers };
        }),

      toggleCorrectAnswer: (questionIndex, choiceIndex) =>
        set((state) => {
          const updatedAnswers = [...state.initialAnswers];
          const currentCorrect = updatedAnswers[questionIndex].choices[choiceIndex].correct;
          updatedAnswers[questionIndex].choices[choiceIndex].correct = !currentCorrect;

          console.log(`Toggling: Question ${questionIndex + 1}, Choice ${choiceIndex + 1} set to ${!currentCorrect}`);
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

      removeRaffle: (index: number) =>
        set(
          (state) => ({
            raffles: state.raffles.filter((_, i) => i !== index),
          }),
          false,
          'removeRaffle'
        ),

      addQuest: () =>
        set(
          (state) => ({
            quests: [...state.quests, { name: '', link: '', platform: '' }],
          }),
          false,
          'addQuest'
        ),

      removeQuest: (index: number) =>
        set(
          (state) => ({
            quests: state.quests.filter((_, i) => i !== index),
          }),
          false,
          'removeQuest'
        ),

      submitAcademy: async () => {
        const state = get();
        const { accessToken } = useAuthStore.getState();

        if (!accessToken) {
          console.error('Authorization token is missing');
          throw new Error('Authorization token is missing');
        }

        try {
          const payload = {
            name: state.name || '',
            ticker: state.ticker || '',
            categories: state.categories || [],
            chains: state.chains || [],
            twitter: state.twitter || '',
            telegram: state.telegram || '',
            discord: state.discord || '',
            coingecko: state.coingecko || '',
            webpageUrl: state.webpageUrl || '',
            tokenomics: state.tokenomics || '',
            teamBackground: state.teamBackground || '',
            congratsVideo: state.congratsVideo || '',
            getStarted: state.getStarted || '',
            initialAnswers: state.initialAnswers || [],
            raffles: state.raffles || [],
            quests: state.quests || [],
            status: 'pending',
          };

          await axios.post('/api/academies', payload, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          alert(`Your academy "${state.name}" is under review.`);
          state.resetAcademyData();
        } catch (error) {
          console.error('Error creating academy:', error);
        }
      },

      resetAcademyData: () =>
        set({
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
          currentStep: 0,
        }),

      fetchQuestions: async () => {
        try {
          const questionsResponse = await axios.get('/api/questions/initial-questions');
          const questions = questionsResponse.data;

          if (!Array.isArray(questions)) {
            throw new Error('Unexpected response format');
          }

          set(() => ({
            initialAnswers: questions.map((question) => ({
              initialQuestionId: question.id,
              question: question.question,
              answer: '',
              quizQuestion: '',
              choices: Array(5).fill({ answer: '', correct: false }),
              video: '',
            })),
          }));
        } catch (error) {
          console.error('Error fetching initial questions:', error);
        }
      },

      // Modify the nextStep function to handle the correct number of slides
nextStep: () => {
  const state = get();
  const totalSlides = 1 + state.initialAnswers.length + 4 + state.initialAnswers.length + 1; // Calculate the total number of slides
  if (state.currentStep < totalSlides - 1) {
    set({ currentStep: state.currentStep + 1 });
  }
},

// Modify the prevStep function to handle the correct number of slides
prevStep: () => {
  const state = get();
  if (state.currentStep > 0) {
    set({ currentStep: state.currentStep - 1 });
  }
},
    }),
    { name: 'AcademyStore' }
  )
);

export default useAcademyStore;
