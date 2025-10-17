import { Template } from '../types/template';
import { Card } from '@/components/ui/card';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
  isActive?: boolean;
}

const TemplateCard = ({ template, onClick, isActive = false }: TemplateCardProps) => {
  return (
    <Card
      className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-blue-500 dark:bg-slate-700' : ''}`}
      onClick={onClick}>
      <div className="flex items-center justify-center h-[80px] py-2">{template.Icon}</div>
      <h3 className="text-lg font-semibold mt-4 text-left">{template.name}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-xs text-left mt-2">
        {template.description}
      </p>
    </Card>
  );
};

export default TemplateCard;
