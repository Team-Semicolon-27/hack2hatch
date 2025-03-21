"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p className="text-center mt-10 text-lg">Not signed in</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e0e1dd] text-[#fe7f2d]">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
