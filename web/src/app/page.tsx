'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { QuickStartPrompts } from '@/components/quick-start-prompts';
import { ArrowRight, Zap, Github } from 'lucide-react';
import { SiDiscord } from '@icons-pack/react-simple-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import TemplateCatalog from '@/features/templates/templates-catalog';
import { TEMPLATES } from '@/features/templates/constants/templates';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);

  useEffect(() => {
    const data = getClientSideCookie('auth');
    console.log(data);
    if (data) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }
  }, [isSignedIn]);

  const getClientSideCookie = (name: string) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      if (cookie.startsWith(`${name}=`)) {
        return cookie.substring(name.length + 1);
      }
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    const params = new URLSearchParams({
      prompt: prompt,
      framework: selectedTemplateId
    });
    window.location.href = '/app?' + params.toString();
  };
  const handleSignIn = async () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <span className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <Image src="/logo.png" width={40} height={40} alt="Scafoldr logo" />
                scafoldr
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/scafoldr/scafoldr"
              target="_blank"
              className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
                <span>Star us</span>
              </Button>
            </Link>
            <ThemeToggle />
            {isSignedIn ? (
              <UserProfileDropdown />
            ) : (
              <Button variant="outline" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Open Source AI App Generator</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
            Let it happen.
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into full-stack applications with AI. Generate databases, APIs, and
            frontends from simple descriptions.
          </p>

          {/* Quick Start Templates */}
          <QuickStartPrompts
            onSelectPrompt={(promptText) => {
              setIsSubmitting(true);
              const params = new URLSearchParams({
                prompt: promptText,
                framework: selectedTemplateId
              });
              window.location.href = '/app?' + params.toString();
            }}
          />

          {/* CTA Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto mb-8 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="relative">
              <Input
                name="prompt-input"
                type="text"
                placeholder="Describe your app idea... (e.g., 'A task management app with teams and real-time collaboration')"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                }}
                className="h-14 pr-48 text-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-lg"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="lg"
                disabled={!prompt.trim() || isSubmitting}
                className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r text-white from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg">
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>

          {/* Framework Selector - Subtle placement below form */}
          <motion.div
            className="text-center mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
              Choose a Template
            </h2>

            <TemplateCatalog
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm text-sm py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          {/* Logo on left */}
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Image src="/logo.png" width={40} height={40} alt="Scafoldr logo" />
              scafoldr
            </span>
          </div>
          {/* Placeholder for future links */}
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            {/* GitHub link on right */}
            <Link
              href="https://github.com/scafoldr/scafoldr"
              target="_blank"
              className="flex items-center space-x-1 hover:underline">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
            {/* Future social links can go here */}
            <Link
              href="https://discord.gg/jZPTchaUFB"
              target="_blank"
              className="flex items-center space-x-1 hover:underline">
              <SiDiscord className="w-4 h-4" />
              <span>Discord</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
