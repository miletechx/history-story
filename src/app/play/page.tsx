import { Suspense } from 'react';
import PlayPage from '@/features/player/player-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PlayPage />
    </Suspense>
  );
}
