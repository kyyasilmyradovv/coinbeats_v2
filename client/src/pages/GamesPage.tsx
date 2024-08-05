import React from 'react';
import { Page, Navbar, Block, BlockTitle } from 'konsta/react';

export default function GamesPage() {
  return (
    <Page>
      <Navbar title="Games" />
      <Block strong inset className="space-y-4">
        <BlockTitle>Games</BlockTitle>
        <p>Games content goes here.</p>
      </Block>
    </Page>
  );
}
