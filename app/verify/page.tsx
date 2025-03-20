"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter(); 

  const handleVerify = async () => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    if (res.ok) {
      setTimeout(() => {
        router.push("/login"); 
      }, 1500);
    }
  };

  return (
    <div>
      <h1>Verify Email</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Verification Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleVerify}>Verify</button>
      <p>{message}</p>
    </div>
  );
}
