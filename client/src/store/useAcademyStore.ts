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
  chains?: string[]; // Added for question 4
  utility?: string;  // Added for question 4
  totalSupply?: string;  // Added for question 4
  logic?: string;  // Added for question 4
  coingecko?: string;  // Added for question 4
  dexScreener?: string;  // Added for question 4
  contractAddress?: string;  // Added for question 4
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
  logo: File | null;
  coverPhoto: File | null;
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
  videoUrls: { initialQuestionId: number; url: string }[];
  setVideoUrl: (index: number, url: string) => void;
  submitVideoLessons: (academyId: number) => Promise<void>;
  setField: (
    field: keyof Omit<
      AcademyState,
      | 'setField'
      | 'setInitialAnswer'
      | 'toggleCorrectAnswer'
      | 'addRaffle'
      | 'addQuest'
      | 'submitAcademy'
      | 'resetAcademyData'
      | 'fetchQuestions'
      | 'nextStep'
      | 'prevStep'
      | 'removeRaffle'
      | 'removeQuest'
      | 'setVideoUrl'
      | 'submitVideoLessons'
      | 'setPrefilledAcademyData'
    >,
    value: any
  ) => void;
  setInitialAnswer: (index: number, field: keyof InitialAnswer, value: any) => void;
  toggleCorrectAnswer: (questionIndex: number, choiceIndex: number) => void;
  addRaffle: () => void;
  removeRaffle: (index: number) => void;
  addQuest: () => void;
  removeQuest: (index: number) => void;
  submitAcademy: (academyId?: number, logoFile?: File | null, coverPhotoFile?: File | null) => Promise<void>;
  submitBasicAcademy: () => Promise<void>;
  resetAcademyData: () => void;
  fetchQuestions: () => Promise<void>;
  fetchQuests: (academyId: number) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  setPrefilledAcademyData: (data: any) => void;
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
      raffles: [],
      quests: [],
      visibleQuestionsCount: 1,
      currentStep: 0,
      videoUrls: [],

      setField: (field, value) =>
        set((state) => ({ ...state, [field]: value }), false, `setField: ${field}`),

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
          updatedAnswers[questionIndex].choices.forEach((choice, index) => {
            choice.correct = index === choiceIndex;
          });
          return { initialAnswers: updatedAnswers };
        }),

      addRaffle: () =>
        set((state) => ({
          raffles: [...state.raffles, { amount: '', reward: '', currency: '', chain: '', dates: '', totalPool: '' }],
        })),

      removeRaffle: (index: number) =>
        set((state) => ({
          raffles: state.raffles.filter((_, i) => i !== index),
        })),

      addQuest: () =>
        set((state) => ({
          quests: [...state.quests, { name: '', link: '', platform: '' }],
        })),

      removeQuest: (index: number) =>
        set((state) => ({
          quests: state.quests.filter((_, i) => i !== index),
        })),

      fetchQuests: async (academyId: number) => {
        try {
          const response = await axios.get(`/api/academies/${academyId}/quests`);
          set({ quests: response.data });
        } catch (error) {
          console.error('Error fetching quests:', error);
        }
      },

      submitAcademy: async (academyId?: number, logoFile?: File | null, coverPhotoFile?: File | null) => {
        const state = get();
        const { accessToken } = useAuthStore.getState();

        if (!accessToken) {
          console.error('Authorization token is missing');
          throw new Error('Authorization token is missing');
        }

        try {
          const formData = new FormData();
          formData.append('name', state.name);
          formData.append('ticker', state.ticker);
          formData.append('webpageUrl', state.webpageUrl);

          // Append the logo and cover photo files
          if (logoFile || state.logo) formData.append('logo', logoFile || state.logo);
          if (coverPhotoFile || state.coverPhoto) formData.append('coverPhoto', coverPhotoFile || state.coverPhoto);

          formData.append('categories', JSON.stringify(state.categories));
          formData.append('chains', JSON.stringify(state.chains));
          formData.append('twitter', state.twitter);
          formData.append('telegram', state.telegram);
          formData.append('discord', state.discord);
          formData.append('coingecko', state.coingecko);

          // Process the tokenomics data
          const tokenomicsData = {
            chains: state.initialAnswers[3]?.chains || [],
            utility: state.initialAnswers[3]?.utility || '',
            totalSupply: state.initialAnswers[3]?.totalSupply || '',
            logic: state.initialAnswers[3]?.logic || '',
            coingecko: state.initialAnswers[3]?.coingecko || '',
            dexScreener: state.initialAnswers[3]?.dexScreener || '',
            contractAddress: state.initialAnswers[3]?.contractAddress || '',
          };

          // Update initialAnswers[3] with the tokenomics data
          const updatedInitialAnswers = state.initialAnswers.map((answer, index) => {
            if (index === 3) {
              return {
                ...answer,
                answer: JSON.stringify(tokenomicsData),
              };
            }
            return answer;
          });

          formData.append('initialAnswers', JSON.stringify(updatedInitialAnswers));
          formData.append('tokenomics', state.tokenomics);
          formData.append('teamBackground', state.teamBackground);
          formData.append('congratsVideo', state.congratsVideo);
          formData.append('getStarted', state.getStarted);
          formData.append('raffles', JSON.stringify(state.raffles || []));
          formData.append('quests', JSON.stringify(state.quests || []));

          // Include duplicated fields
          formData.append('coingeckoLink', tokenomicsData.coingecko);
          formData.append('dexScreenerLink', tokenomicsData.dexScreener);
          formData.append('contractAddress', tokenomicsData.contractAddress);

          const url = academyId ? `/api/academies/${academyId}` : `/api/academies`;
          const method = academyId ? 'put' : 'post';

          await axios[method](url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          state.resetAcademyData();
        } catch (error) {
          console.error('Error creating or updating academy:', error);
          throw error;
        }
      },

      submitBasicAcademy: async () => {
        const state = get();
        const { accessToken } = useAuthStore.getState();

        if (!accessToken) {
          console.error('Authorization token is missing');
          throw new Error('Authorization token is missing');
        }

        try {
          const formData = new FormData();
          formData.append('name', state.name);
          formData.append('ticker', state.ticker);
          formData.append('webpageUrl', state.webpageUrl);
          if (state.logo) formData.append('logo', state.logo);
          if (state.coverPhoto) formData.append('coverPhoto', state.coverPhoto);
          formData.append('categories', JSON.stringify(state.categories));
          formData.append('chains', JSON.stringify(state.chains));
          formData.append('twitter', state.twitter);
          formData.append('telegram', state.telegram);
          formData.append('discord', state.discord);
          formData.append('coingecko', state.coingecko);
          formData.append('tokenomics', state.tokenomics);
          formData.append('teamBackground', state.teamBackground);
          formData.append('congratsVideo', state.congratsVideo);
          formData.append('getStarted', state.getStarted);

          // Add these fields as empty arrays or default values to make them visible on the edit page
          formData.append('initialAnswers', JSON.stringify(state.initialAnswers || []));
          formData.append('raffles', JSON.stringify(state.raffles || []));
          formData.append('quests', JSON.stringify(state.quests || []));

          await axios.post('/api/academies/basic', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          state.resetAcademyData();
        } catch (error) {
          console.error('Error creating basic academy:', error);
          throw error;
        }
      },

      resetAcademyData: () => {
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
          raffles: [],
          quests: [],
          videoUrls: [],
          visibleQuestionsCount: 1,
          currentStep: 0,
        }, false, 'Reset Academy Data');

        // Debugging: Log out the state after reset
        const currentState = get();
        console.log("State after reset:", currentState);
      },

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
              choices: Array(4).fill({ answer: '', correct: false }),
              video: '',
            })),
          }));
        } catch (error) {
          console.error('Error fetching initial questions:', error);
        }
      },

      setVideoUrl: (index: number, url: string) =>
        set((state) => {
          const updatedVideoUrls = [...state.videoUrls];
          updatedVideoUrls[index] = { initialQuestionId: state.initialAnswers[index].initialQuestionId, url };
          return { videoUrls: updatedVideoUrls };
        }),

      submitVideoLessons: async (academyId: number) => {
        const state = get();
        const { accessToken } = useAuthStore.getState();

        if (!accessToken) {
          throw new Error('Authorization token is missing');
        }

        try {
          await axios.put(
            `/api/academies/${academyId}/videos`,
            { videoUrls: state.videoUrls },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (error) {
          console.error('Error submitting video lessons:', error);
          throw error;
        }
      },

      nextStep: () => {
        const state = get();
        const totalSlides = 1 + state.initialAnswers.length + 4 + state.initialAnswers.length + 1;
        if (state.currentStep < totalSlides - 1) {
          set({ currentStep: state.currentStep + 1 });
        }
      },

      prevStep: () => {
        const state = get();
        if (state.currentStep > 0) {
          set({ currentStep: state.currentStep - 1 });
        }
      },

      setPrefilledAcademyData: async (data) => {
        // Fetch initial questions if academyQuestions are empty
        let initialQuestions = [];
    
        if (data.academyQuestions.length === 0) {
            try {
                const response = await axios.get('/api/questions/initial-questions'); // Fetch initial questions from backend
                initialQuestions = response.data;
            } catch (error) {
                console.error('Error fetching initial questions:', error);
            }
        }
    
        const initialAnswers = initialQuestions.length > 0 
          ? initialQuestions.map((question) => ({
              initialQuestionId: question.id,
              question: question.question || '',
              answer: '',
              quizQuestion: '',
              choices: Array(4).fill({ answer: '', correct: false }), // Default to 4 empty choices
              video: '',
            }))
          : data.academyQuestions.map((question) => ({
              initialQuestionId: question.initialQuestionId,
              question: question.initialQuestion?.question || '',
              answer: question.answer || '',
              quizQuestion: question.quizQuestion || '',
              choices: question.choices.length > 0 
                ? question.choices.map((choice) => ({
                    answer: choice.text || '',
                    correct: choice.isCorrect || false,
                  }))
                : Array(4).fill({ answer: '', correct: false }),
              video: question.video || '',
            }));
    
        set({
          name: data.name || '',
          ticker: data.ticker || '',
          categories: data.categories.map((cat) => cat.name) || [],
          chains: data.chains.map((chain) => chain.name) || [],
          twitter: data.twitter || '',
          telegram: data.telegram || '',
          discord: data.discord || '',
          coingecko: data.coingecko || '',
          logo: data.logoUrl || null,
          coverPhoto: data.coverPhotoUrl || null,
          webpageUrl: data.webpageUrl || '',
          initialAnswers,
          tokenomics: data.tokenomics || '',
          teamBackground: data.teamBackground || '',
          congratsVideo: data.congratsVideo || '',
          getStarted: data.getStarted || '',
          raffles: data.raffles || [],  // Ensure empty if not provided
          quests: data.quests || [],    // Ensure empty if not provided
        });
    
        console.log("Academy data set in store:", get());
      },  
    }),
    { name: 'AcademyStore' }
  )
);

export default useAcademyStore;
