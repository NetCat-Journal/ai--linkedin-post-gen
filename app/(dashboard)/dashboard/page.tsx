"use client";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

function DasboardPage() {
    const testGenerate = useAction(api.generate.testGenerate);
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const apiHandler = async () => {
        setLoading(true);
        setResult("");
        try {
            const res = await testGenerate({ prompt: "Write a LinkedIn post about the benefits of using Convex as a backend for modern web applications." });
            if (res.sucess) {
                setResult(res.content || "No content generated");
                console.log("Tokens used:", res.tokensUsed);
            } else {
                setResult(`Error: ${res.content}`);
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
            <div><button onClick={apiHandler} disabled={loading}>call openai</button></div>
            {result && (
                <div>
                    <h2>Generated Content:</h2>
                    <p>{result}</p>
                </div>
            )}
        </>
    )
}

export default DasboardPage