'use client';
import { useState } from 'react';
import Link from 'next/link';
import Result from './Result/Result';
import { FileMap } from './Result/types';
import { EXAMPLE_DBML } from '@/constants';

import dynamic from 'next/dynamic';
import { parseDbmlToDiagram } from './Diagram/utils/dbml';

const Diagram = dynamic(() => import('./Diagram/Diagram'), { ssr: false });

const GenerateForm = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ files: FileMap; command: string } | null>(null);
  const [error, setError] = useState(null);

  const [dbmlInput, setDbmlInput] = useState<string>(EXAMPLE_DBML);

  const handleSubmit = async (formData: FormData) => {
    // event.preventDefault();
    setLoading(true);

    const requestData = {
      project_name: formData.get('project-name'),
      backend_option: formData.get('backend-option'),
      features: [formData.get('features-docker') ? 'docker' : ''],
      user_input: formData.get('schema')
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'API error');
      }

      setResponse(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Request failed:', error);
      setError(error?.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form action={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="project-name"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Project name
        </label>
        <input
          name="project-name"
          type="text"
          id="project-name"
          className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
          placeholder="example-project-name"
          required
        />
      </div>
      <div>
        <label
          htmlFor="backend-option"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Backend
        </label>
        <select
          name="backend-option"
          defaultValue={'nodejs-express-js'}
          id="backend-option"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
          <option value="nodejs-express-js">Node.js Express with Sequelize</option>
          <option value="java-spring">Java Spring</option>
        </select>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            name="features-docker"
            id="features-docker"
            aria-describedby="features-docker"
            type="checkbox"
            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="features-docker" className="font-light text-gray-500 dark:text-gray-300">
            Include Docker
          </label>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label
          htmlFor="schema"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
          Your DBML schema, you can use{' '}
          <Link href="https://dbdiagram.io/d" className="underline" target="_blank">
            dbdiagram.io
          </Link>{' '}
          to create your DBML schema
        </label>
        <textarea
          value={dbmlInput}
          onChange={(e) => {
            setDbmlInput(e.target.value);
          }}
          name="schema"
          id="schema"
          rows={8}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="Enter your DBML schema here..."></textarea>
      </div>
      <button
        type="submit"
        className="inline-block rounded-sm border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:ring-3 focus:outline-hidden">
        Get your code
      </button>
      <Diagram initialDiagram={parseDbmlToDiagram(dbmlInput)} />

      {loading && <div>Loading...</div>}
      {response && <Result files={response?.files} />}
      {error && <div>Error: {error}</div>}
    </form>
  );
};

export default GenerateForm;
