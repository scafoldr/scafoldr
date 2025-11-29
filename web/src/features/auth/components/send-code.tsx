'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface SendCodeProps {
  email: string;
  isLoading: boolean;
  handleSetEmail: (email: string) => void;
  handleEmailSubmit: (e: React.FormEvent) => void;
}

export function SendCode({ email, isLoading, handleEmailSubmit, handleSetEmail }: SendCodeProps) {
  return (
    <motion.form
      key="email-form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleEmailSubmit}
      className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => handleSetEmail(e.target.value)}
          className="h-11"
          required
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={!email || isLoading}>
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear'
            }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          />
        ) : (
          <Mail className="w-4 h-4 mr-2" />
        )}
        Send Magic Link
      </Button>
    </motion.form>
  );
}
