import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import Navbar from "./components/navbar";

export default async function Home() {
  const { userId } = await auth()

  // If logged in, go to dashboard
  if (userId) {
    redirect('/dashboard')
  }
  return (
    <div>
      <Navbar />
    </div>
  );
}
