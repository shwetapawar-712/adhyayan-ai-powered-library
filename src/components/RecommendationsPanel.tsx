import { AIRecommendation } from '@/types/library';
import { Lightbulb } from 'lucide-react';

interface Props {
  recommendations: AIRecommendation[];
}

const RecommendationsPanel = ({ recommendations }: Props) => {
  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h3 className="font-display text-sm font-bold">AI Recommendations</h3>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading recommendations...</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className={`p-3 rounded-lg border ${
              rec.priority === 'high' ? 'bg-destructive/10 border-destructive/30' :
              rec.priority === 'medium' ? 'bg-warning/10 border-warning/30' :
              'bg-success/10 border-success/30'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{rec.icon}</span>
                <div>
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
