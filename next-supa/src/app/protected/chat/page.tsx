// src/app/chat/page.tsx
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import TeamChannelInterface from '@/components/Dashboard/TeamChannelInterface';

export default async function ChatPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return <TeamChannelInterface />;
}
