import { Badge } from '@/components/ui/badge';
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
      className={`min-w-[280px] bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer ${isActive ? 'ring-2 ring-blue-500 bg-slate-100 dark:bg-slate-700' : ''}`}
      onClick={onClick}>
      <div className="flex items-center justify-center h-[80px] py-2">{template.Icon}</div>
      <h3 className="text-lg font-semibold mt-4 text-left flex gap-4 items-center justify-between">
        <span className="line-clamp-1 text-ellipsis">{template.name}</span>
        {template.comingSoon && (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 whitespace-nowrap">
            Coming Soon
          </Badge>
        )}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-xs text-left mt-2 h-8 line-clamp-2">
        {template.description}
      </p>
    </Card>
  );
};

export default TemplateCard;
