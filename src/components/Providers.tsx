// src/components/Providers.tsx
'use client';

import React, { ReactNode } from 'react';
import { EdTechProvider } from '@/context/EdTechContext';
import { AudioProvider } from '@/components/audio/AudioProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EdTechProvider>
      <AudioProvider>
        {children}
      </AudioProvider>
    </EdTechProvider>
  );
}

export default Providers;
