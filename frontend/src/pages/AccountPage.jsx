import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SiGoogle } from "react-icons/si";

function nameFromEmail(email){
  if(!email) return "—";
  let raw = email.split('@')[0].replace(/[0-9]/g,'').replace(/[._-]/g,' ');
  return raw.split(' ').filter(Boolean).map(function(w){ return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase(); }).join(' ');
}

export default function AccountPage(){
  const [email, setEmail] = useState("—");
  const [name, setName] = useState("—");
  const [uid, setUid] = useState("—");
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("access");
    if(!token){ navigate("/login"); return; }
    const savedEmail = localStorage.getItem("email");
    const savedId = localStorage.getItem("user_id");
    if(savedEmail){ setEmail(savedEmail); setName(nameFromEmail(savedEmail)); }
    if(savedId){ setUid("NS-" + String(savedId).padStart(5,'0')); }

    fetch("http://127.0.0.1:8000/api/me/",{
      headers:{ Authorization:"Bearer " + token },
      credentials:"include"
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d.email){ setEmail(d.email); setName(nameFromEmail(d.email)); }
      if(d.id){ setUid("NS-" + String(d.id).padStart(5,'0')); }
    }).catch(function(){});
  },[navigate]);

  return(
    <div className="min-h-screen flex justify-center bg-zinc-50 px-4 pt-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Account Information</h1>
        <p className="text-sm text-zinc-500 mb-6">UI: <span className="font-mono font-bold text-black">{uid}</span></p>

        <div className="bg-white border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-5 border-b">
            <p className="text-xs font-bold tracking-widest text-zinc-400">NAME</p>
            <p className="font-semibold mt-1">{name}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-bold tracking-widest text-zinc-400">EMAIL</p>
            <p className="font-semibold mt-1">{email}</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <span className="bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-md">Sign-in methods</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold tracking-widest text-zinc-400 px-2">CURRENT LOGIN METHODS</p>
            <div className="flex justify-between items-center border rounded-xl px-4 py-3">
              <span className="text-sm font-medium">Email / {email}</span>
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold">Active</span>
            </div>
            <div className="flex justify-between items-center border rounded-xl px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium"><SiGoogle /> Google</span>
              <span className="text-xs bg-zinc-100 border px-3 py-1 rounded-full font-bold">Connect</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={function(){ localStorage.clear(); window.dispatchEvent(new Event("authChange")); navigate("/login"); }} className="bg-white border rounded-xl px-6 py-2.5 text-sm font-bold">Sign out</button>
        </div>

      </div>
    </div>
  );
}