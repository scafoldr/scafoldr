'use client';

import type React from 'react';
import { useState, useRef, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { verifyCode } from '@/features/auth/api/auth.api';

interface VerifyCodeProps {
  email: string;
  onBack: () => void;
  onResend: (e: React.FormEvent) => void;
}

export function VerifyCode({ email, onBack, onResend }: VerifyCodeProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newCode[idx] = char;
    });
    setCode(newCode);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) return;

    setIsLoading(true);

    const data = await verifyCode(verificationCode, email);
    if (data) {
      setIsLoading(false);
      window.location.href = '/';
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    try {
      onResend(e);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-center">Check your email</h2>
        <p className="text-sm text-muted-foreground text-center">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-semibold"
            disabled={isLoading}
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={!isCodeComplete || isLoading}>
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          />
        ) : null}
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </Button>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" />
          Change email address
        </button>
      </div>
    </motion.div>
  );
}
