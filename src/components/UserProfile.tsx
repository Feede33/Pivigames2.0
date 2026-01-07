'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Mic, Headphones, MicOff, HeadphonesOff } from 'lucide-react';

export default function UserProfile() {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 z-50 w-64 bg-background/95 backdrop-blur-sm border-t border-r border-border">
      <div className="flex items-center justify-between p-2 gap-2">
        {/* Avatar y Info del Usuario */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>PD</AvatarFallback>
            </Avatar>
            {/* Indicador de estado online */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">POLLODEARROZ</p>
            <p className="text-xs text-muted-foreground truncate">Invisible</p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4 text-destructive" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            title={isDeafened ? "Undeafen" : "Deafen"}
          >
            {isDeafened ? (
              <HeadphonesOff className="w-4 h-4 text-destructive" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </button>
          
          <button
            className="p-1.5 hover:bg-accent rounded transition-colors"
            title="User Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
