// src/app/chat/page.tsx
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import TeamChannelInterface from '@/components/Dashboard/TeamChannelInterface';

export default async function ChatPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? session.user.nickname ?? session.user.email?.split('@')[0] ?? 'User';
  const userAvatar = session.user.picture ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${userEmail}`;

  return (
    <TeamChannelInterface
      userEmail={userEmail}
      userName={userName}
      userAvatar={userAvatar}
    />
  );
}