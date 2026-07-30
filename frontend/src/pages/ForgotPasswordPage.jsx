import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setMessage(data.message || "If account exists, reset link sent. Check Django console for link in dev.");
            console.log("DEBUG LINK:", data.debug_link);
        } catch {
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFEF9] flex flex-col">
            <div className="bg-black text-white flex justify-center py-5"><Link to="/" className="text-3xl font-black tracking-tighter">NewsScope<sub className="text-sm ml-1">pk</sub></Link></div>
            <div className="flex justify-center px-4 py-20">
                <div className="w-full max-w-md rounded-2xl border-2 p-8 bg-white">
                    <h1 className="text-2xl font-bold text-center mb-2">Forgot Password?</h1>
                    <p className="text-sm text-center text-gray-500 mb-6">Enter your email to get reset link</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" className="w-full rounded-lg border px-4 py-3 text-sm" />
                        <button disabled={loading} className="w-full rounded-lg py-3.5 text-sm font-bold bg-black text-white">{loading?"Sending...":"Send Reset Link"}</button>
                    </form>
                    {message && <div className="mt-4 p-3 rounded bg-green-50 text-sm border text-green-700">{message}</div>}
                    <p className="text-center text-sm mt-6"><Link to="/login" className="underline font-bold">Back to Login</Link></p>
                </div>
            </div>
        </div>
    )
}