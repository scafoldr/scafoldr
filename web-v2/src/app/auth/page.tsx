'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Github, Mail, Chrome, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    // Get prompt from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const redirectUrl = prompt ? `/app?prompt=${encodeURIComponent(prompt)}` : '/app';
      window.location.href = redirectUrl;
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      const redirectUrl = prompt ? `/app?prompt=${encodeURIComponent(prompt)}` : '/app';
      window.location.href = redirectUrl;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scafoldr
            </span>
          </div>
        </div>

        {/* Prompt Preview */}
        {prompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Your idea:</p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">{prompt}</p>
          </motion.div>
        )}

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome to Scafoldr</CardTitle>
            <CardDescription>Sign in to start building your application</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}>
                <Github className="w-5 h-5 mr-3" />
                Continue with GitHub
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}>
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Magic Link
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
