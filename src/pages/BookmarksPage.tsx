import React from 'react';
import { Page, Navbar, Block, BlockTitle } from 'konsta/react';

export default function BookmarksPage() {
  return (
    <Page>
      <Navbar title="Bookmarks" />
      <Block strong inset className="space-y-4">
        <BlockTitle>Bookmarks</BlockTitle>
        <p>Bookmarks content goes here.</p>
      </Block>
    </Page>
  );
}
