import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to play button click sound
function playButtonClickSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create a crisp, spacey "beep" sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    filter.type = 'highpass';
    filter.frequency.value = 200;
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0, now + 0.15);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}

export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);

  useEffect(() => {
    return () => {
      if (!isMuted && audioContextRef.current) {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {}
        });
      }
    };
  }, [isMuted]);

  const toggleSound = () => {
    playButtonClickSound();
    
    if (!isMuted) {
      // Stop music
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      oscillatorsRef.current = [];
      gainsRef.current = [];
      setIsMuted(true);
      return;
    }

    // Start ambient space music
    const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const now = audioContext.currentTime;
    const createOscillator = (frequency: number, startTime: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      // Fade in and out
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.5);
      gain.gain.linearRampToValueAtTime(0, startTime + duration - 0.5);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      oscillatorsRef.current.push(osc);
      gainsRef.current.push(gain);
    };

    // Create ambient space sounds - deep, ethereal tones
    const baseFreqs = [55, 110, 165]; // Low frequencies for deep space feel
    
    baseFreqs.forEach((freq, index) => {
      for (let i = 0; i < 10; i++) {
        const variation = freq + (Math.random() - 0.5) * 20;
        createOscillator(variation, now + i * 2, 3);
      }
    });

    setIsMuted(false);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleSound}
      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
      title={isMuted ? 'Enable ambient music' : 'Mute ambient music'}
      data-testid="button-sound-toggle"
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
}
