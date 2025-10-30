// app/protected/page.tsx
import { auth0 } from '@/lib/auth0';  // Import the client
import { redirect } from 'next/navigation';
import { Dashboard } from "@/components/Dashboard/Dashboard";

export default async function ProtectedPage() {
  // 1️⃣ Get Auth0 session
  const session = await auth0.getSession();

  // 2️⃣ Redirect if not logged in
  if (!session?.user) {
    redirect('/auth/login');  // Updated path
  }

  const user = session.user;

  // 3️⃣ Render dashboard
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Welcome back, {user.name || user.email} 👋
        </h1>
      </div>
      
      <Dashboard />
    </div>
  );
}