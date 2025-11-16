import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth()

  // If logged in, go to dashboard
  if (userId) {
    redirect('/dashboard')
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-white/10 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white/60  sm:items-start">
        <SignUpButton />
        <SignInButton />
        <SignOutButton />
        <h1>{userId}</h1>
      </main>
    </div>
  );
}
