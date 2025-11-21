'use client'
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

function Posts() {
    const testGenerate = useAction(api.generate.testGenerate);
    const generatePosts = useAction(api.generate.generatePosts);
    const [result, setResult] = useState<[]>([]);
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
            const res = await generatePosts({ tone: "profesional", idea: prompt });
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
                <input onChange={handlePrompt} type="text" placeholder="Enter your idea" className="border border-gray-300 p-2 mr-2 flex-1" />
                <button onClick={apiHandler} disabled={loading} className="bg-[#0A66C2] py-2 px-4 cursor-pointer text-white">Create Posts</button></div>
            {result && (
                <div>
                    <h2>Generated Content:</h2>
                    <p>{result}</p>
                </div>
            )}
        </>
    )
}

export default Posts;