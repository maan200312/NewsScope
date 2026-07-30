import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiGoogle } from 'react-icons/si'
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || JSON.stringify(data));

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("user", JSON.stringify({ id: data.id, email: data.email, name: data.name }));
            window.dispatchEvent(new Event("authChange"));

            setIsError(false);
            setMessage("Registration successful! Redirecting...");
            setTimeout(()=> navigate("/"), 1000);
        } catch (err) {
            setIsError(true);
            setMessage(err.message);
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
            setIsError(true);
            setMessage(err.message);
        }
    };

    return (
        <div style={{ minHeight: '100dvh' }} className="bg-[#FFFEF9] dark:bg-black">
            <div className="flex items-center justify-center py-5 border-b" style={{ background: '#1a1a1a' }}>
                <Link to="/"><div className="text-3xl leading-none tracking-tighter text-white" style={{ fontFamily: 'Arial Black, sans-serif', transform: 'scaleY(1.3)' }}>NewsScope<sub className="font-semibold text-right text-sm ml-1">pk</sub></div></Link>
            </div>
            <div className="flex justify-center px-4 py-14">
                <div className="w-full max-w-md rounded-2xl shadow-sm border-2 p-8 bg-white dark:bg-zinc-900">
                    <h1 className="text-3xl text-center mb-8">Create your account</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-semibold mb-1.5">Full Name</label><input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter your full name" required className="w-full rounded-lg border px-4 py-3 text-sm outline-none" /></div>
                        <div><label className="block text-sm font-semibold mb-1.5">Email</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" required className="w-full rounded-lg border px-4 py-3 text-sm outline-none" /></div>
                        <div><label className="block text-sm font-semibold mb-1.5">Password</label><div className="relative"><input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password" required className="w-full rounded-lg border px-4 py-3 text-sm outline-none pr-12" /><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500">{showPassword?<FaEyeSlash/>:<FaEye/>}</button></div></div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg py-3.5 text-sm font-bold bg-black text-white flex justify-center items-center">{loading?<FaSpinner className="animate-spin"/>:"Create Account"}</button>
                        {message && <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${isError?"bg-red-100 text-red-700 border border-red-400":"bg-green-100 text-green-700 border border-green-400"}`}>{message}</div>}
                    </form>
                    <p className="text-center text-sm mt-5">Already have an account? <Link to="/login" className="font-bold underline ml-1">Log in</Link></p>
                    <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-200"/><span className="text-sm opacity-50">Or</span><div className="flex-1 h-px bg-gray-200"/></div>
                    
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => { setIsError(true); setMessage("Google Login Failed"); }}
                            text="continue_with"
                            width="350"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}