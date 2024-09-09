// client/src/components/AcademyCompletionSlide.tsx

import React from 'react';
import { Button, Card } from 'konsta/react';
import coinStack from '../images/coin-stack.png';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react'; // For the emoji and icons

type AcademyCompletionSlideProps = {
  earnedPoints: number;
  totalPoints: number;
  academyName: string; // Add the academy name as a prop
};

const AcademyCompletionSlide: React.FC<AcademyCompletionSlideProps> = ({ earnedPoints, totalPoints, academyName }) => {
  const navigate = useNavigate();

  // Prefilled tweet content
  const tweetContent = `I just completed ${academyName} academy on CoinBeats Crypto School! 🎉🚀 #CoinBeats #CryptoSchool`;

  const handleTweetClick = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
    window.open(tweetUrl, '_blank'); // Open the tweet window in a new tab
  };

  return (
    <div className="flex flex-col items-center justify-center h-full mb-12">
      <h2 className="text-xl font-bold mb-4">In total you collected:</h2>
      <div className="flex items-center justify-center text-4xl font-bold mb-8">
        {earnedPoints} / {totalPoints} <img src={coinStack} alt="coin stack" className="w-12 h-12 ml-2 mb-2" />
      </div>
      <Button
        large
        rounded
        outline
        disabled
        className="mb-4"
        style={{
          backgroundColor: 'gray',
          color: '#fff',
        }}
      >
        Earn by doing quests
      </Button>
      <Button
        large
        rounded
        outline
        onClick={() => navigate('/')}
        style={{
          background: 'linear-gradient(to left, #ff0077, #7700ff)',
          color: '#fff',
        }}
      >
        Explore more academies
      </Button>

      <Card className="!my-6 !mx-0 !p-1 !rounded-2xl border border-gray-400 dark:border-gray-700 shadow-lg flex items-center justify-between">
        {/* Left Side: Celebration Emoji and Text */}
        <div className="flex items-center">
          <span className="text-3xl mr-4">🎉</span> {/* Celebration emoji */}
          <div>
            <p className="text-md font-semibold dark:text-gray-100 mb-2">I just completed {academyName} academy on CoinBeats Crypto School</p>
          </div>
        </div>
        <Button
          rounded
          outline
          onClick={handleTweetClick}
          className="flex items-center py-2 rounded-xl bg-purple-100 border border-purple-400 text-purple-700 shadow-sm"
        >
          <Icon icon="mdi:twitter" className="w-6 h-6 mr-2 !whitespace-nowrap" />
          Tweet this
        </Button>

      </Card>
    </div>
  );
};

export default AcademyCompletionSlide;
