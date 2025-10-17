'use client';

import { TEMPLATES } from './constants/templates';

import TemplateCard from './components/template-card';
import { useState } from 'react';
import CreateYourOwnTemplate from './components/create-your-own-template';
import { CreateYourOwnTemplateComingSoonModal } from '@/components/coming-soon-modal';

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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  return (
    <div>
      <div className="flex flex-row flex-wrap -mx-2">
        {TEMPLATES.map((template) => (
          <div className="basis-1/3 p-2" key={template.id}>
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => {
                handleTemplateSelect(template.id);
              }}
              isActive={selectedTemplateId === template.id}
            />
          </div>
        ))}
        <div className="basis-1/3 p-2">
          <CreateYourOwnTemplate onClick={() => setIsCreateYourOwnTemplateModalOpen(true)} />
        </div>
      </div>
      <CreateYourOwnTemplateComingSoonModal
        open={isCreateYourOwnTemplateModalOpen}
        onOpenChange={setIsCreateYourOwnTemplateModalOpen}
      />
    </div>
  );
};

export default TemplateCatalog;
