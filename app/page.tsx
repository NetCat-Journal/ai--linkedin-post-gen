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
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Generate Engaging LinkedIn Posts{" "}
            <span className="text-[#0A66C2]">in Seconds</span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your ideas into professional LinkedIn content with AI-powered writing.
            Choose your style, enter your idea, and get 3 unique posts instantly.
          </p>

          {/* CTA Button */}
          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0a66c2ed] font-semibold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105 mb-16">
              Get Started Free →
            </button>
          </SignUpButton>

          {/* Tone Options Preview */}
          <div className="mb-20">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-6">
              Choose Your Writing Style
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-semibold text-gray-900">Professional</div>
                <div className="text-sm text-gray-600">Business-focused</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                <div className="text-3xl mb-2">😎</div>
                <div className="font-semibold text-gray-900">Casual</div>
                <div className="text-sm text-gray-600">Friendly & relatable</div>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-3xl mb-2">📖</div>
                <div className="font-semibold text-gray-900">Storytelling</div>
                <div className="text-sm text-gray-600">Engaging narratives</div>
              </div>
              <div className="p-6 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-semibold text-gray-900">Thought Leader</div>
                <div className="text-sm text-gray-600">Industry insights</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">4 Writing Styles</h3>
              <p className="text-gray-600 text-sm">
                Choose the perfect tone for your audience
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-gray-600 text-sm">
                Get 3 unique posts in seconds
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Powered by advanced GPT technology
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Hours</h3>
              <p className="text-gray-600 text-sm">
                Stop staring at blank screens
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <p className="text-gray-600 mb-4">
              "This tool helped me go from spending 2 hours on a LinkedIn post to just 2 minutes. Game changer!"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                👤
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-sm text-gray-600">Marketing Director</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p>© 2024 LinkedIn Post Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
