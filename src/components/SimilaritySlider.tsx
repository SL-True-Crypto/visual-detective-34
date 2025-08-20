import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

interface SimilaritySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const SimilaritySlider: React.FC<SimilaritySliderProps> = ({ value, onChange }) => {
  const getSensitivityLabel = (threshold: number) => {
    if (threshold >= 90) return "Very Strict";
    if (threshold >= 80) return "Strict";
    if (threshold >= 70) return "Moderate";
    if (threshold >= 60) return "Relaxed";
    return "Very Relaxed";
  };

  const getSensitivityColor = (threshold: number) => {
    if (threshold >= 90) return "text-red-400";
    if (threshold >= 80) return "text-orange-400";
    if (threshold >= 70) return "text-yellow-400";
    if (threshold >= 60) return "text-green-400";
    return "text-blue-400";
  };

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Similarity Threshold</h3>
            <p className="text-sm text-muted-foreground">
              Adjust how strict the matching should be
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sensitivity</span>
            <span className={`text-sm font-medium ${getSensitivityColor(value)}`}>
              {getSensitivityLabel(value)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[value]}
              onValueChange={(values) => onChange(values[0])}
              max={100}
              min={30}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30%</span>
              <span className="font-medium text-foreground">{value}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              <span className="font-medium">Higher values</span> find nearly identical images.{' '}
              <span className="font-medium">Lower values</span> find more variations.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimilaritySlider;