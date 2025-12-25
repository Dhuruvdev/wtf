import { useCallback } from 'react';

export function useSoundEffect() {
  const playClick = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
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

  // Doom-style sound effects
  const playRoastSubmitted = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.2);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // Silently fail
    }
  }, []);

  const playVoteSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const notes = [400, 600];
      notes.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0, now + idx * 0.05 + 0.1);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.1);
      });
    } catch (e) {
      // Silently fail
    }
  }, []);

  const playElimination = useCallback(() => {
    // ... existing code ...
  }, []);

  const playMemeSound = useCallback((type: 'airhorn' | 'wow' | 'emotional' | 'bonk') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      if (type === 'airhorn') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'wow') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'bonk') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {}
  }, []);

  return { playClick, playSuccess, playError, playRoastSubmitted, playVoteSound, playElimination, playMemeSound };
}
