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


    const handlePrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const apiHandler = async () => {
        setLoading(true);
        setResult([]);
        setError("")
        try {
            const res = await generatePosts({ tone: "professional", idea: prompt });
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
    return (
        <>
            <div className="p-4 flex flex-row justify-between items-center">
                <input onChange={handlePrompt} type="text" placeholder="Enter your idea ..." className="rounded-sm border border-gray-200 p-2 mr-2 flex-1" />
                <button onClick={apiHandler} disabled={loading} className="rounded-sm px-4 py-2 bg-[#0A66C2] border-2 border-transparent text-white hover:bg-[#0a66c2ed]">Create Posts</button></div>
            {result && (
                <div className="p-4">
                    <div className="flex justify-center items-center">
                        {loading && <Spinner className="w-20 h-20 text-[#0A66C2]" />}
                        <div className="grid grid-rows-3 gap-4 md:grid md:grid-cols-3 ">
                            {result.map((post, index) => (
                                <div key={index} className="rounded-sm border border-gray-200 p-8">
                                    <p>{post}</p>
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