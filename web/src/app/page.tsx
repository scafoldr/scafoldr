'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthComingSoonModal } from '@/components/coming-soon-modal';
import { FrameworkSelector } from '@/features/framework-selector';
import { ArrowRight, Code2, Database, Zap, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('nodejs-express-js');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    // Simulate transition delay
    setTimeout(() => {
      const params = new URLSearchParams({
        prompt: prompt,
        framework: selectedFramework
      });
      window.location.href = '/app?' + params.toString();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏗️ scafoldr
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
            <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Open Source AI App Generator</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
            Let it happen.
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into full-stack applications with AI. Generate databases, APIs, and
            frontends from simple descriptions.
          </p>

          {/* CTA Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="relative">
              <Input
                name="prompt-input"
                type="text"
                placeholder="Describe your app idea... (e.g., 'A task management app with teams and real-time collaboration')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-14 pr-48 text-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-lg"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="lg"
                disabled={!prompt.trim() || isSubmitting}
                className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg">
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
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Framework:</span>
              <FrameworkSelector value={selectedFramework} onValueChange={setSelectedFramework} />
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center justify-self-center mb-4">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Database Design</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                AI generates optimized database schemas with proper relationships and constraints.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center justify-self-center mb-4">
                <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full-Stack Code</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Generate complete applications with modern frameworks and best practices.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center justify-self-center mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Preview</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                See your application come to life with real-time previews and live data.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Auth Coming Soon Modal */}
      <AuthComingSoonModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
