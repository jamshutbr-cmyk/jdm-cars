import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { FeedPage } from '@/pages/FeedPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { UploadPage } from '@/pages/UploadPage';
import { ProfilePage } from '@/pages/ProfilePage';
import type { TabKey } from '@/types';
import { initTelegram } from '@/telegram';

export default function App() {
  const [tab, setTab] = useState<TabKey>('feed');

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <div className="min-h-screen bg-base text-ink font-sans">
      <div className="max-w-md mx-auto min-h-screen relative">
        {tab === 'feed' && <FeedPage />}
        {tab === 'leaderboard' && <LeaderboardPage />}
        {tab === 'upload' && <UploadPage />}
        {tab === 'profile' && <ProfilePage />}

        <NavBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
