import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { MessagesList } from "./MessagesList";
import { Chat } from "./Chat";

type Profile = Tables<"profiles">;
type Message = Tables<"messages">;

export const Messages = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [selectedChat, setSelectedChat] = useState<{ chatId: string; profile: Profile } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfilesAndMessages = async () => {
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .limit(10);

        if (profilesError) throw profilesError;

        if (profilesData) {
          setProfiles(profilesData);
          
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .order('created_at', { ascending: false });

          if (messagesError) throw messagesError;

          if (messagesData) {
            const latestMessages: Record<string, Message> = {};
            messagesData.forEach((message) => {
              if (!latestMessages[message.sender_id!]) {
                latestMessages[message.sender_id!] = message;
              }
            });
            setMessages(latestMessages);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages. Please try again.",
        });
      }
    };

    fetchProfilesAndMessages();

    // Subscribe to real-time updates
    const messagesSubscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (payload.new) {
            const message = payload.new as Message;
            setMessages(prev => ({
              ...prev,
              [message.sender_id!]: message
            }));
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [toast]);

  const handleCreateChat = async (profile: Profile) => {
    try {
      const myProfileId = profiles[0]?.id;
      
      if (!myProfileId) {
        throw new Error("User profile not found");
      }

      // First try to find an existing chat
      const { data: existingChat } = await supabase
        .from("chats")
        .select("*")
        .or(`and(profile_id_1.eq.${myProfileId},profile_id_2.eq.${profile.id}),and(profile_id_1.eq.${profile.id},profile_id_2.eq.${myProfileId})`)
        .single();

      if (existingChat) {
        setSelectedChat({ chatId: existingChat.id, profile });
        return;
      }

      // If no existing chat, create a new one with ordered profile IDs
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          profile_id_1: myProfileId,
          profile_id_2: profile.id,
        })
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create chat. Please try again.",
        });
        return;
      }

      if (newChat) {
        setSelectedChat({ chatId: newChat.id, profile });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create chat. Please try again.",
      });
    }
  };

  if (selectedChat) {
    return (
      <Chat
        chatId={selectedChat.chatId}
        profile={selectedChat.profile}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return <MessagesList profiles={profiles} messages={messages} onChatCreate={handleCreateChat} />;
};