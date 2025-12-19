import React, { useState } from 'react';
import { Qiraa } from '../types';
import { QiraatSelectScreen } from './QiraatSelectScreen';
import { MushafScreen } from './MushafScreen';

export function ReadSection() {
  const [selectedQiraa, setSelectedQiraa] = useState<Qiraa | null>(null);

  if (!selectedQiraa) {
    return <QiraatSelectScreen onSelectQiraa={setSelectedQiraa} />;
  }

  return <MushafScreen qiraa={selectedQiraa} onBack={() => setSelectedQiraa(null)} />;
}
