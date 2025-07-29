import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, Code, Loader2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { FileMap } from "@/features/code-editor/types";

interface ChatCodeGenerationMessageProps {
  dbmlCode: string;
  timestamp: Date;
  title?: string;
  onViewCode?: (files: FileMap) => void;
}

export function ChatCodeGenerationMessage({
  dbmlCode,
  timestamp,
  title = "I've generated your Node.js Express application:",
  onViewCode
}: ChatCodeGenerationMessageProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedFiles, setGeneratedFiles] = useState<FileMap | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Automatically trigger code generation when component mounts
  useEffect(() => {
    const generateCode = async () => {
      setIsGenerating(true);
      setGenerationError(null);
      
      // Generate a random project name
      const randomProjectName = `scafoldr-project-${Math.random().toString(36).substring(2, 8)}`;
      
      const requestData = {
        project_name: randomProjectName,
        backend_option: 'nodejs-express-js', // Default to Node.js as requested
        features: [], // No additional features for now
        user_input: dbmlCode
      };

      try {
        console.log('Starting code generation with data:', requestData);
        console.log('DBML being sent:', JSON.stringify(dbmlCode));
        
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        console.log('API response status:', res.status);
        console.log('API response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          // Try to get error message from response
          let errorMessage = `Code generation failed (${res.status})`;
          
          // Clone the response so we can try multiple read attempts
          const responseClone = res.clone();
          
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
            console.log('Error data:', errorData);
          } catch (jsonError) {
            // If JSON parsing fails, get text response from clone
            try {
              const errorText = await responseClone.text();
              errorMessage = errorText || errorMessage;
              console.log('Error text:', errorText);
            } catch (textError) {
              console.log('Could not parse error response:', textError);
              errorMessage = `HTTP ${res.status}: ${res.statusText}`;
            }
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log('Generated files received:', Object.keys(data.files || {}));
        setGeneratedFiles(data.files);
      } catch (error: any) {
        console.error('Code generation failed:', error);
        let errorMessage = 'Code generation failed';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to code generation service. Please ensure the backend is running.';
        } else {
          errorMessage = error?.message ?? 'Code generation failed';
        }
        
        setGenerationError(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    generateCode();
  }, [dbmlCode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-3"
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 max-w-[85%]">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg rounded-bl-sm p-4 space-y-3">
          {/* Header with code icon and title */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
              <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {title}
            </span>
          </div>

          {/* Code Generation Content */}
          <div className="space-y-3">
            {isGenerating && (
              <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Generating your Node.js Express application...
                </span>
              </div>
            )}

            {generationError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <span className="text-sm text-red-600 dark:text-red-400">
                  Error: {generationError}
                </span>
              </div>
            )}

            {generatedFiles && !isGenerating && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onViewCode?.(generatedFiles)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Code
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-1">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}