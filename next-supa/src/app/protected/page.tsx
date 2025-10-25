import { Dashboard } from "@/components/Dashboard/Dashboard";
interface ProtectedPageProps {
  email: string;
}

// app/protected/page.tsx
export default function ProtectedPage({ email }: ProtectedPageProps) {
  return (
    <div className="">
       <div className="flex flex-col w-full h-full overflow-y-auto ">
      {/* Example: Use the user's email in your content */}
      <div className="border-b border-stone-300 pb-2 mb-4">
        <h1 className="text-xl font-semibold">Welcome back, {email} 👋</h1>
        <p className="text-stone-500 text-sm">
          Here’s your dashboard summary and chat feed.
        </p>
      </div>
      <Dashboard />
    </div>
    </div>
  );
}
