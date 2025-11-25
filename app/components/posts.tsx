'use client'
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

function Posts() {
    const testGenerate = useAction(api.generate.testGenerate);
    const generatePosts = useAction(api.generate.generatePosts);
    const [result, setResult] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [selectedTone, setSelectedTone] = useState<string>("");
    const [copied, setCopied] = useState<string>("");

    const tones = [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'storytelling', label: 'Storytelling' },
        { value: 'thoughtLeader', label: 'Thought Leader' },
    ];


    const handlePrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const toneHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTone(e.target.value);
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
                console.log("Tokens used:", res.tokensUsed);
            } else {
                setError(`Error: ${res.error}`);
            }

        }
        catch (err) {
            console.log("API call error:", err);
        }
        finally {
            setLoading(false);
        }
    }

    const clipboardHandler = async (e: React.MouseEvent<SVGSVGElement, MouseEvent>, post: string) => {
        try {
            await navigator.clipboard.writeText(post);
            console.log("Copied to clipboard:", post);
            setCopied(post);
            setTimeout(() => setCopied(''), 2000);
        }
        catch (err) {
            console.log("Clipboard copy error:", err);
        }
    }

    return (
        <>
            <div className="p-4 flex flex-row justify-between items-center">
                <input onChange={handlePrompt} type="text" placeholder="Enter your idea ..." className="rounded-sm border border-gray-200 p-2 mr-2 flex-1" />
                <button onClick={apiHandler} disabled={loading} className="rounded-sm px-4 py-2 bg-[#0A66C2] border-2 border-transparent text-white hover:bg-[#0a66c2ed]">Create Posts</button></div>
            <div className="p-4">
                <div className="flex flex-row justify-between rounded-sm border border-gray-200 p-4">
                    {tones.map((tone) => (
                        <div key={tone.value} className="flex items-center justify-between">
                            <input type="radio" name="tone" value={tone.value} onChange={toneHandler} />
                            <span className="ml-4">{tone.label}</span>
                        </div>
                    ))
                    }
                </div>
            </div>

            {result && (
                <div className="p-4">
                    <div className="flex justify-center items-center">
                        {loading && <Spinner className="w-20 h-20 text-[#0A66C2]" />}
                        <div className="grid grid-rows-3 gap-4 md:grid md:grid-cols-3 ">
                            {result.map((post, index) => (
                                <div key={index} className="rounded-sm border border-gray-200 p-8 flex flex-col justify-between">
                                    <p>{post}</p>
                                    <div>
                                        {copied && post === copied ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clipboard-check-icon lucide-clipboard-check cursor-pointer text-[#0A66C2]"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clipboard-list-icon lucide-clipboard-list cursor-pointer text-[#0A66C2]" onClick={(e) => clipboardHandler(e, post)}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>}
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