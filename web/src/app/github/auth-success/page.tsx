'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GitHubAuthSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
              <Github className="w-5 h-5" />
              GitHub Authentication Successful
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You can now close this tab and return to the Scafoldr application
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
