import React from 'react';
import { Page, Navbar, Block, BlockTitle } from 'konsta/react';

export default function PointsPage() {
  return (
    <Page>
      <Navbar title="Points" />
      <Block strong inset className="space-y-4">
        <BlockTitle>Points</BlockTitle>
        <p>Points content goes here.</p>
      </Block>
    </Page>
  );
}
