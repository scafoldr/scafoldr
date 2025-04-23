'use client';

import Result from '@/components/Result/Result';
import { FileMap } from '@/components/Result/types';
import { useState } from 'react';

interface GenerateCodeProps {
  dbmlCode: string;
}

const GenerateCode = ({ dbmlCode }: GenerateCodeProps) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ files: FileMap; command: string } | null>(null);
  const [error, setError] = useState(null);

  const isFormVisible = !loading && !response && !error;
  const isResultsVisible = !!response && !loading && !error;
  const isErrorVisible = !!error && !loading && !response;
  const isLoadingVisible = loading;

  const handleSubmit = async (formData: FormData) => {
    // event.preventDefault();
    setLoading(true);
    const requestData = {
      project_name: formData.get('project-name'),
      backend_option: formData.get('backend-option'),
      features: [formData.get('features-docker') ? 'docker' : ''],
      user_input: dbmlCode
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

  const renderForm = () => (
    <form
      action={(formData: FormData) => {
        setLoading(true);
        handleSubmit(formData);
      }}>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Project name:</legend>
        <input
          type="text"
          className="input w-full"
          name="project-name"
          placeholder="Enter your project name"
          defaultValue="scafoldr-project"
        />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Backend:</legend>
        <select name="backend-option" defaultValue={'nodejs-express-js'} className="select w-full">
          <option value="nodejs-express-js">Node.js Express with Sequelize</option>
          <option value="java-spring">Java Spring</option>
        </select>
        <p className="label">Select programming language for your backend</p>
      </fieldset>

      <button type="submit" className="btn btn-primary mt-2">
        Get your code
      </button>
    </form>
  );

  const renderLoader = () => <span className="loading loading-dots loading-xl"></span>;

  const renderError = () => (
    <div role="alert" className="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{error}</span>
    </div>
  );

  const renderResults = () => (response?.files ? <Result files={response.files} /> : null);

  return (
    <>
      <button
        className="btn btn-secondary btn-lg"
        onClick={() => (document?.getElementById('my_modal_1') as HTMLDialogElement)?.showModal()}>
        Get your code
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className={`modal-box ${isResultsVisible ? 'w-11/12 max-w-5xl' : ''}`}>
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Generate your code</h3>
          <div className="mt-3">
            {isFormVisible && renderForm()}
            {isLoadingVisible && renderLoader()}
            {isErrorVisible && renderError()}
            {isResultsVisible && renderResults()}
          </div>
        </div>
      </dialog>
    </>
  );
};

export default GenerateCode;
