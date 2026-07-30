import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPasswordPage() {
    const { uid, token } = useParams();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://127.0.0.1:8000/api/reset-password/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, token, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setIsError(false);
            setMessage(data.message + " Redirecting to login...");
            setTimeout(()=> navigate("/login"), 1500);
        } catch (err) {
            setIsError(true);
            setMessage(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFEF9] flex flex-col">
            <div className="bg-black text-white flex justify-center py-5"><Link to="/" className="text-3xl font-black tracking-tighter">NewsScope<sub className="text-sm ml-1">pk</sub></Link></div>
            <div className="flex justify-center px-4 py-20">
                <div className="w-full max-w-md rounded-2xl border-2 p-8 bg-white">
                    <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full rounded-lg border px-4 py-3 text-sm" />
                        <button className="w-full rounded-lg py-3.5 text-sm font-bold bg-black text-white">Reset Password</button>
                    </form>
                    {message && <div className={`mt-4 p-3 rounded text-sm border ${isError?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`}>{message}</div>}
                </div>
            </div>
        </div>
    )
}