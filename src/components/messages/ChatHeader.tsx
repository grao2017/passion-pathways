import { ArrowLeft, Shield, Video, CheckCircle, Mic, MicOff } from "lucide-react";
import { Button } from "../ui/button";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import useVapi from "@/hooks/useVapi";
import { AudioVisualizer } from "../AudioVisualizer";

type Profile = Tables<"profiles">;

interface ChatHeaderProps {
  profile: Profile;
  onBack: () => void;
}

export const ChatHeader = ({ profile, onBack }: ChatHeaderProps) => {
  const { isSessionActive, toggleCall, volumeLevel } = useVapi();

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-white sticky top-0 z-10 animate-fade-down">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="hover:bg-gray-100 transition-colors duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex-1 flex items-center gap-3">
        <div className="relative animate-scale-in">
          <img
            src={profile.photos?.[0] || "/placeholder.svg"}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
          />
        </div>
        <div className="flex items-center gap-2 animate-fade-in">
          <h2 className="font-semibold text-lg">{profile.name}</h2>
          {profile.is_verified && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
      </div>
      
      <div className="flex gap-2 animate-fade-in">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleCall}
          className={cn(
            "hover:bg-gray-100 transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-primary",
            isSessionActive && "bg-primary/10"
          )}
          aria-label={isSessionActive ? "End voice call" : "Start voice call"}
        >
          {isSessionActive ? (
            <div className="relative">
              <MicOff className="h-5 w-5 text-blue-500" />
              <AudioVisualizer volumeLevel={volumeLevel} isSessionActive={isSessionActive} />
            </div>
          ) : (
            <Mic className="h-5 w-5 text-blue-500" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "hover:bg-gray-100 transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Start video call"
        >
          <Video className="h-5 w-5 text-blue-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "hover:bg-gray-100 transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Safety information"
        >
          <Shield className="h-5 w-5 text-blue-500" />
        </Button>
      </div>
    </div>
  );
};