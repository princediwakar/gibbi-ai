'use client';

import { useEffect } from 'react';
import { initClarity } from '@/lib/clarity';

export function ClarityProvider() {
  useEffect(() => {
    initClarity();
  }, []);

  return null;
}
