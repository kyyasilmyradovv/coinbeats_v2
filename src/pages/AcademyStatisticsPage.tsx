// src/pages/AcademyStatisticsPage.tsx

import React from 'react';
import { Page, Block, BlockTitle } from 'konsta/react';

const AcademyStatisticsPage: React.FC = () => {
  return (
    <Page>
      <BlockTitle>Academy Statistics</BlockTitle>
      <Block strong>
        <p>Here you can view various statistics about your academies.</p>
        {/* Implement detailed statistics view here */}
      </Block>
    </Page>
  );
};

export default AcademyStatisticsPage;
