'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, ShoppingCart, BookOpen } from 'lucide-react';

// Define the template interface
interface QuickStartTemplate {
  id: string;
  prompt: string;
  icon: React.ReactNode;
}

// Define the available templates
const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: 'task-manager',
    prompt: 'A task management app with projects, tasks, and user assignments',
    icon: <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  },
  {
    id: 'ecommerce',
    prompt: 'An e-commerce platform with products, categories, shopping cart, and checkout',
    icon: <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
  },
  {
    id: 'blog',
    prompt: 'A blog platform with posts, comments, tags, and user profiles',
    icon: <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
  }
];

// Define the component props
interface QuickStartPromptsProps {
  // eslint-disable-next-line no-unused-vars
  onSelectPrompt: (promptText: string, templateId: string) => void;
  selectedPromptId?: string;
}

export function QuickStartPrompts({ onSelectPrompt, selectedPromptId }: QuickStartPromptsProps) {
  // Handle template selection
  const handleSelectTemplate = (template: QuickStartTemplate) => {
    onSelectPrompt(template.prompt, template.id);
  };

  return (
    <motion.div
      className="mb-4 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}>
      {/* Template Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {QUICK_START_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className={`flex items-center p-2 rounded-md transition-all w-full ${
              selectedPromptId === template.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
            }`}
            aria-label={`Use template for ${template.prompt}`}
            title={template.prompt}>
            <span className="flex-shrink-0 mr-2">{template.icon}</span>
            <span className="text-xs truncate">{template.prompt}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
