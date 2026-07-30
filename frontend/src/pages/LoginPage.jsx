import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (response.ok && data.access) {
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                }));
                window.dispatchEvent(new Event("authChange"));
                navigate("/", { replace: true });
            } else {
                setError(data.error || data.detail || "Invalid email or password");
            }
        } catch {
            setError("Server se connect nahi ho pa raha. Backend chal raha hai?");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/google/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: credentialResponse.credential })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Google login failed");

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("user", JSON.stringify({ id: data.id, email: data.email, name: data.name }));
            window.dispatchEvent(new Event("authChange"));
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFEF9] dark:bg-black">
            <div className="bg-black text-white flex justify-center py-5 border-b">
                <Link to="/"><div className="text-3xl leading-none tracking-tighter" style={{ fontFamily: 'Arial Black, sans-serif', transform: 'scaleY(1.3)' }}>NewsScope<sub className="font-semibold text-right text-sm ml-1">pk</sub></div></Link>
            </div>
            <div className="flex justify-center px-4 py-14">
                <div className="w-full max-w-md rounded-2xl shadow-sm border-2 p-8 bg-white dark:bg-zinc-900 dark:border-zinc-700">
                    <h1 className="text-3xl text-center mb-8 dark:text-white">Log in to your account</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-semibold mb-1.5 dark:text-white">Email</label><input type="email" autoComplete="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm outline-none dark:bg-black dark:text-white" /></div>
                        <div><label className="block text-sm font-semibold mb-1.5 dark:text-white">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full rounded-lg border px-4 py-3 text-sm outline-none dark:bg-black dark:text-white pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
                        <div className="flex justify-end"><Link to="/forgot-password" className="text-sm underline hover:opacity-70 dark:text-white">Forgot your password?</Link></div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg py-3.5 text-sm font-bold bg-black text-white dark:bg-white dark:text-black flex justify-center items-center">{loading ? <FaSpinner className="animate-spin"/> : "Log in"}</button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-3 text-center bg-red-50 p-2 rounded border">{error}</p>}
                    <p className="text-center text-sm mt-5 dark:text-white">Don't have an account? <Link to="/register" className="font-bold underline ml-1">Create one</Link></p>
                    <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-200"/><span className="text-sm text-gray-400">Or</span><div className="flex-1 h-px bg-gray-200"/></div>
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google Login Failed")}
                            text="continue_with"
                            width="350"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}