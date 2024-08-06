import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import useAuthStore from './useAuthStore';  // Use the correct store for authentication

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
  setField: (
    field: keyof Omit<
      AcademyState,
      'setField' | 'setInitialAnswer' | 'toggleCorrectAnswer' | 'addRaffle' | 'addQuest' | 'submitAcademy' | 'resetAcademyData' | 'fetchQuestions'
    >,
    value: any
  ) => void;
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
          console.log(`Setting initial answer - index: ${index}, field: ${field}, value: `, value);
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
          console.log(`Toggling correct answer for question ${questionIndex}, choice ${choiceIndex}`);
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
          const { accessToken } = useAuthStore.getState(); // Retrieve token from AuthStore
        
          if (!accessToken) {
            console.error('Authorization token is missing');
            throw new Error('Authorization token is missing');
          }
        
          try {
            const payload = {
              name: state.name || '', // Ensure default values for missing data
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
              // Remove file uploads for JSON submission
            };
        
            console.log('Payload to be sent:', payload);
        
            // Send JSON payload
            await axios.post('http://localhost:7000/api/academies', payload, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`, // Ensure the token is included
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
      // Inside your React application or zustand store
fetchQuestions: async () => {
  try {
    console.log('Fetching initial questions');
    const questionsResponse = await axios.get('http://localhost:7000/api/questions/initial-questions');
    const questions = questionsResponse.data;

    // Check if the response is an array
    if (!Array.isArray(questions)) {
      throw new Error('Unexpected response format');
    }

    set(
      () => ({
        initialAnswers: questions.map((question) => ({
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
