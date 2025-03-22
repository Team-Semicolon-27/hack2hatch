"use client"; 

import { useParams } from "next/navigation";
import Chat from "@/components/Chat";

const MentorChat = () => {
  const params = useParams(); // useParams() retrieves route params in a client component

  return (
    <div>
      <Chat notionId={params.id as string} />
    </div>
  );
};

export default MentorChat;
