import { useCallback } from 'react';

export function useSoundEffect() {
  const playClick = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Spacey beep sound for buttons
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
      // Silently fail
    }
  }, []);

  const playSuccess = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Ascending "success" sound (two tones)
      const notes = [
        { freq: 700, duration: 0.1 },
        { freq: 1000, duration: 0.2 }
      ];
      
      let time = now;
      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0, time + note.duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(time);
        osc.stop(time + note.duration);
        
        time += note.duration;
      });
    } catch (e) {
      // Silently fail
    }
  }, []);

  const playError = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Descending "error" sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0, now + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Silently fail
    }
  }, []);

  return { playClick, playSuccess, playError };
}
