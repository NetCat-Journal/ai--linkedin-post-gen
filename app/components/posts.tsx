'use client'
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";


function Posts() {
    const testGenerate = useAction(api.generate.testGenerate);
    const generatePosts = useAction(api.generate.generatePosts);
    const [result, setResult] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [selectedTone, setSelectedTone] = useState<string>("");
    const [copied, setCopied] = useState<string>("");
    const [emoji, setEmoji] = useState<string>("");


    const tones = [
        { value: 'professional', label: 'Professional', emoji: "💼", color: "bg-blue-100 text-blue-800" },
        { value: 'casual', label: 'Casual', emoji: "😎", color: "bg-green-100 text-green-800" },
        { value: 'storytelling', label: 'Storytelling', emoji: '📖', color: "bg-purple-100 text-purple-800" },
        { value: 'thoughtLeader', label: 'Thought Leader', emoji: '🧠', color: "bg-orange-100 text-orange-800" },
    ];


    const handlePrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const toneHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTone(e.target.value);
        const foundEmoji = tones.find(tone => tone.value === e.target.value);
        setEmoji(foundEmoji ? foundEmoji.emoji : "");
        console.log("emoji", emoji);
    }

    const apiHandler = async () => {
        setLoading(true);
        setResult([]);
        setError("")
        try {
            const res = await generatePosts({ tone: selectedTone, idea: prompt });
            console.log("API response:", res);
            if (res.success) {
                setResult(res.posts);
                toast.success("✅ Posts generated successfully!");
                console.log("Tokens used:", res.tokensUsed);
                console.log("tone", res);
            } else {
                setError(`Error: ${res.error}`);
                toast.error(`❌ Error generating posts: ${res.error}`);
            }

        }
        catch (err) {
            console.log("API call error:", err);
        }
        finally {
            setLoading(false);
        }
    }

    const clipboardHandler = async (post: string) => {
        try {
            await navigator.clipboard.writeText(post);
            console.log("Copied to clipboard:", post);
            setCopied(post);
            setTimeout(() => setCopied(''), 2000);
            toast.success("📋 Copied to clipboard!", {
                duration: 2000,
            });
        }
        catch (err) {
            console.log("Clipboard copy error:", err);
        }
    }

    return (
        <>
            <div className="p-4 flex flex-row justify-between items-center">
                <input onChange={handlePrompt} type="text" placeholder="Enter your idea ..." className="rounded-sm border border-gray-200 p-2 mr-2 flex-1" />
                <button onClick={apiHandler} disabled={loading || selectedTone === '' || prompt === ""} className="rounded-sm px-4 py-2 bg-[#0A66C2] border-2 border-transparent text-white hover:bg-[#0a66c2ed] disabled:bg-gray-400">Create Posts</button></div>
            <div className="p-4 mb-8">
                <div className="flex flex-row justify-between rounded-sm border border-gray-200 p-4 shadow-xs backdrop-blur-sm">
                    {tones.map((tone) => (
                        <div key={tone.value} className="flex items-center justify-between ">
                            <input type="radio" name="tone" value={tone.value} onChange={toneHandler} />
                            <span className="ml-4 text-lg">{tone.emoji}</span>
                            <span className={`ml-2 ${selectedTone === tone.value ? `${tone.color} shadow-sm` : '<span className="text-lg">{tone.emoji}</span>'}`}>{tone.label}</span>
                        </div>
                    ))
                    }
                </div>
            </div>

            {result && (
                <div className="p-4">
                    <div className="flex justify-center items-center">
                        {loading && <Spinner className="w-20 h-20 text-[#0A66C2]" />}
                        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 auto-rows-fr">
                            {result.map((post, index) => (
                                <div key={index} className="rounded-sm border border-gray-200 p-8 flex flex-col justify-between items-start shadow-sm backdrop-blur-sm transform hover:scale-105 transition duration-200">
                                    <div className="mb-4 h-8">{emoji}</div>
                                    <p className="flex-1 mb-2">{post}</p>
                                    <div onClick={() => clipboardHandler(post)} className="flex justify-center items-center rounded-sm bg-gray-200 w-8 h-8 mb-0  cursor-pointer hover:scale-110 active:scale-95 transition-transform">
                                        {copied && post === copied ? "✅" : "📋"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Posts;