import React, { ReactNode } from 'react';
import { EdTechProvider } from '@/context/EdTechContext';
import { AudioProvider } from '@/components/audio/AudioProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EdTechProvider>
      <AudioProvider>
        <AuthGuard>
          {children}
        </AuthGuard>
      </AudioProvider>
    </EdTechProvider>
  );
}

export default Providers;
