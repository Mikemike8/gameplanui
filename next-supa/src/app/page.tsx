// app/page.tsx (or wherever your Home component is)
import { auth0 } from '@/lib/auth0';  // Updated import to use the new client
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth0.getSession();  // Updated to use auth0.getSession()

  if (session?.user) {  // Check for session.user to confirm authenticated
    redirect('/protected');
  }

  return (
    <main>
      <a href="/auth/login?screen_hint=signup">  {/* Updated path from /api/auth to /auth */}
        <button>Sign Up</button>
      </a>
      <a href="/auth/login">  {/* Updated path from /api/auth to /auth */}
        <button>Log In</button>
      </a>
    </main>
  );
}