type ClarityCommand = 'event' | 'set' | 'identify' | 'consent' | 'stop' | 'start';

interface ClarityParameters {
  [key: string]: string | number | boolean;
}

declare global {
  interface Window {
    clarity: (command: ClarityCommand, ...args: (string | ClarityParameters)[]) => void;
  }
}

const CLARITY_SCRIPT_ID = 'clarity-script';

export const initClarity = () => {
  try {
    if (typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_CLARITY_ID) {
      console.warn('Clarity ID is not defined in environment variables');
      return;
    }
    
    // Prevent multiple script insertions
    if (document.getElementById(CLARITY_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = CLARITY_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${process.env.NEXT_PUBLIC_CLARITY_ID}`;
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('Failed to initialize Clarity:', error);
  }
};

// Utility functions for common Clarity operations
export const clarityEvent = (event: string, parameters?: ClarityParameters) => {
  try {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', event, parameters || {});
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to track Clarity event:', error.message);
    }
  }
};

export const claritySetTag = (key: string, value: string | number | boolean) => {
  try {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('set', key, { value });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to set Clarity tag:', error.message);
    }
  }
};
