// app/page.tsx (or wherever your Home component is)
import { auth0 } from "@/lib/auth0"; // Updated import to use the new client
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui is installed
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await auth0.getSession(); // Updated to use auth0.getSession()

  if (session?.user) {
    // Check for session.user to confirm authenticated
    redirect("/protected");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to My App</CardTitle>
          <CardDescription>Please sign up or log in to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild>
            <a href="/auth/login?screen_hint=signup">Sign Up</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/auth/login">Log In</a>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">Powered by Auth0</p>
        </CardFooter>
      </Card>
    </div>
  );
}
