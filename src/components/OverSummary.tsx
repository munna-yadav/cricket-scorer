import { Ball } from './Ball';
import { OverSummary as OverSummaryType } from '../types';

interface OverSummaryProps {
  overSummary: OverSummaryType[];
}

export function OverSummary({ overSummary }: OverSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-700 text-white p-4">
        <h2 className="text-xl font-bold">Over Summary</h2>
      </div>
      <div className="p-4">
        {overSummary.map((over, overIndex) => (
          <div key={overIndex} className="border-b last:border-0 pb-3 mb-3 last:pb-0 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Over {overIndex + 1}</h3>
              <span>{over.totalRuns} runs, {over.wickets} wicket(s)</span>
            </div>
            <div className="flex gap-2">
              {over.balls.map((ball, ballIndex) => (
                <Ball key={ballIndex} ball={ball} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}