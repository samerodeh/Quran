import React, { useState } from 'react';
import { NarrationType, Reciter } from '../types';
import { NarrationSelectScreen } from './NarrationSelectScreen';
import { ReciterSelectScreen } from './ReciterSelectScreen';
import { SurahListScreen } from './SurahListScreen';

export function ListenSection() {
  const [selectedNarration, setSelectedNarration] = useState<NarrationType | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);

  if (!selectedNarration) {
    return <NarrationSelectScreen onSelectNarration={setSelectedNarration} />;
  }

  if (!selectedReciter) {
    return (
      <ReciterSelectScreen
        narration={selectedNarration}
        onSelectReciter={setSelectedReciter}
        onBack={() => setSelectedNarration(null)}
      />
    );
  }

  return <SurahListScreen reciter={selectedReciter} onBack={() => setSelectedReciter(null)} />;
}
