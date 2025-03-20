"use client"
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();

  if (!session) return <p>Not logged in</p>;

  return (
    <div>
      <h1>Welcome, {session.user.email}!</h1>
      <p>User ID: {session.user.id}</p>
      <p>Email Verified: {session.user.isVerified ? "Yes" : "No"}</p>
    </div>
  );
};

export default Dashboard;
