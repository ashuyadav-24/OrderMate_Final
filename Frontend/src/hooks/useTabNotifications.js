import { useEffect, useRef } from "react";

// 🔔 Tab notifications — works when tab is open but user is on another tab
// Plays a sound + blinks the tab title

export function useTabNotifications() {
  const originalTitle = useRef(document.title);
  const blinkInterval = useRef(null);
  const audioContext = useRef(null);

  // 🔊 Play a soft notification sound using Web Audio API
  // No external file needed — generates sound programmatically
  const playSound = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContext.current;

      // Create a pleasant two-tone chime
      const playTone = (freq, startTime, duration) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.15);        // first tone
      playTone(1100, now + 0.15, 0.2); // second tone (higher)

    } catch (err) {
      console.log("Audio not available:", err.message);
    }
  };

  // 💫 Blink tab title
  const blinkTitle = (message) => {
    let isOriginal = true;
    let count = 0;

    // Clear existing blink
    if (blinkInterval.current) {
      clearInterval(blinkInterval.current);
    }

    blinkInterval.current = setInterval(() => {
      document.title = isOriginal ? `🔔 ${message}` : originalTitle.current;
      isOriginal = !isOriginal;
      count++;

      // Stop blinking after 10 seconds or 20 blinks
      if (count > 20) {
        clearInterval(blinkInterval.current);
        document.title = originalTitle.current;
      }
    }, 500);
  };

  // Stop blinking when user focuses the tab
  useEffect(() => {
    const handleFocus = () => {
      if (blinkInterval.current) {
        clearInterval(blinkInterval.current);
        document.title = originalTitle.current;
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (blinkInterval.current) clearInterval(blinkInterval.current);
    };
  }, []);

  // 🔔 Trigger both sound + tab blink
  const notify = (message) => {
    playSound();

    // Only blink if tab is not focused
    if (document.hidden || !document.hasFocus()) {
      blinkTitle(message);
    }
  };

  return { notify };
}
