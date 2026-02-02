import { Card } from '@/components/ui/card';
import { PencilRuler } from 'lucide-react';

interface CreateYourOwnTemplateProps {
  onClick: () => void;
}

const CreateYourOwnTemplate = ({ onClick }: CreateYourOwnTemplateProps) => (
  <Card
    className={`min-w-[280px] bg-slate-200 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer`}
    onClick={onClick}>
    <div className="flex items-center justify-center h-[80px] py-2">
      <PencilRuler size={'100%'} />
    </div>
    <h3 className="text-lg font-semibold mt-4 text-left flex gap-4 items-center justify-between">
      Create your own template
    </h3>
    <p className="text-slate-600 dark:text-slate-400 text-xs text-left mt-2 h-8 line-clamp-2">
      Upload your example project and Scafoldr will create a custom template for you.
    </p>
  </Card>
);

export default CreateYourOwnTemplate;
