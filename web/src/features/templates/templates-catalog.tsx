'use client';

import { TEMPLATES } from './constants/templates';

import TemplateCard from './components/template-card';
import { useState } from 'react';
import CreateYourOwnTemplate from './components/create-your-own-template';
import {
  CreateYourOwnTemplateComingSoonModal,
  PHPFrameworkTemplateComingSoonModal,
  PythonTemplateComingSoonModal
} from '@/components/coming-soon-modal';
import { Template } from './types/template';

interface TemplateCatalogProps {
  selectedTemplateId?: string;
  // eslint-disable-next-line no-unused-vars
  setSelectedTemplateId: (templateId: string) => void;
}

const TemplateCatalog = ({
  selectedTemplateId = TEMPLATES[0].id,
  setSelectedTemplateId
}: TemplateCatalogProps) => {
  const [isCreateYourOwnTemplateModalOpen, setIsCreateYourOwnTemplateModalOpen] = useState(false);
  const [isPythonTemplateModalOpen, setIsPythonTemplateModalOpen] = useState(false);
  const [isPHPFrameworkTemplateModalOpen, setIsPHPFrameworkTemplateModalOpen] = useState(false);

  const openTemplateComingSoonModal = (template: Template) => {
    if (template.id === 'python-fastapi') {
      setIsPythonTemplateModalOpen(true);
    } else if (template.id === 'php-laravel') {
      setIsPHPFrameworkTemplateModalOpen(true);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (template.comingSoon) {
      openTemplateComingSoonModal(template);
      return;
    }
    setSelectedTemplateId(template.id);
  };

  return (
    <div>
      <div className="flex flex-row flex-wrap flex-1 -mx-2">
        {TEMPLATES.map((template) => (
          <div className="basis-full md:basis-1/2 xl:basis-1/3 p-2" key={template.id}>
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => {
                handleTemplateSelect(template);
              }}
              isActive={selectedTemplateId === template.id}
            />
          </div>
        ))}
        <div className="basis-full md:basis-1/2 xl:basis-1/3 p-2">
          <CreateYourOwnTemplate onClick={() => setIsCreateYourOwnTemplateModalOpen(true)} />
        </div>
      </div>
      <CreateYourOwnTemplateComingSoonModal
        open={isCreateYourOwnTemplateModalOpen}
        onOpenChange={setIsCreateYourOwnTemplateModalOpen}
      />

      <PythonTemplateComingSoonModal
        open={isPythonTemplateModalOpen}
        onOpenChange={setIsPythonTemplateModalOpen}
      />
      <PHPFrameworkTemplateComingSoonModal
        open={isPHPFrameworkTemplateModalOpen}
        onOpenChange={setIsPHPFrameworkTemplateModalOpen}
      />
    </div>
  );
};

export default TemplateCatalog;
