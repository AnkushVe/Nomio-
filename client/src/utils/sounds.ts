// Sound utility for UI feedback
export class SoundManager {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = true;

  static init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static playScrollSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create a short, crisp click sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }

  static playSelectSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create a satisfying selection sound
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }

  static playSuccessSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create a success chime
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static enable() {
    this.isEnabled = true;
    this.init();
  }

  static disable() {
    this.isEnabled = false;
  }
}

// Haptic feedback utility
export class HapticManager {
  static vibrate(pattern: number | number[] = 10) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  static lightVibrate() {
    this.vibrate(5);
  }

  static mediumVibrate() {
    this.vibrate(15);
  }

  static heavyVibrate() {
    this.vibrate([10, 5, 10]);
  }
}

