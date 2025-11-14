// src/app/protected/spaces/page.tsx
import { redirect } from "next/navigation";

export default function SpacesPage() {
  // Redirect to onboarding - this is now the main entry point
  redirect("/protected/onboarding");
}
