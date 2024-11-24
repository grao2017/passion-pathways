import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || ''; 
const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';

const useVapi = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      // Initialize Vapi with both keys
      vapiRef.current = new Vapi(publicKey, assistantId);
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const toggleCall = useCallback(async () => {
    try {
      if (!vapiRef.current) return;

      if (isSessionActive) {
        await vapiRef.current.stop();
        setIsSessionActive(false);
      } else {
        await vapiRef.current.start();
        setIsSessionActive(true);

        // Set up audio analysis using the correct event type
        vapiRef.current.on('audio', (audio: Float32Array) => {
          const volume = Math.max(...Array.from(audio));
          setVolumeLevel(Number(volume));
        });
      }
    } catch (error) {
      console.error('Error toggling call:', error);
      setIsSessionActive(false);
    }
  }, [isSessionActive]);

  return {
    isSessionActive,
    toggleCall,
    volumeLevel,
  };
};

export default useVapi;