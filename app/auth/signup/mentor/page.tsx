"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrepreneurSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSignup = async () => {
        const res = await fetch("/api/auth/signup/mentor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username, name, profileImage }),
        });

        const data = await res.json();
        setMessage(data.message || data.error);

        if (res.ok) {
            setTimeout(() => {
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            }, 1500);
        }
    };

    return (
        <div>
            <h1>Entrepreneur Signup</h1>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="Profile Image URL" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
            <button onClick={handleSignup}>Sign Up</button>
            <p>{message}</p>
        </div>
    );
}
