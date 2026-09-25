import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { INITIAL_TRAINING_MODULES } from '../data/training';
import { GraduationCap, Award, BookOpen, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export const TrainingPage: React.FC = () => {
  const { telemetry } = useTelemetry();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Module Header */}
      <div className="cab-panel p-5 border-l-4 border-l-cat-yellow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-black bg-cat-yellow text-cat-bg uppercase tracking-wider">
              Module 3 &bull; Mod-C
            </span>
            <span className="text-xs uppercase tracking-widest text-cat-muted font-bold">
              Skill & Compliance Accelerator
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-cat-text mt-1 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-cat-yellow" />
            Operator Training Hub
          </h1>
          <p className="text-base text-cat-muted mt-1 max-w-3xl">
            Adaptive micro-learning modules triggered by real-time telematics trends, hydraulic feathering scores, and ergonomics coaching.
          </p>
        </div>

        {/* Operator Certification Score */}
        <div className="flex items-center space-x-3 bg-cat-surface/80 p-3 rounded-md border border-cat-border self-start md:self-auto">
          <Award className="w-8 h-8 text-cat-yellow" />
          <div>
            <span className="text-xs text-cat-muted uppercase font-bold block">Operator Proficiency</span>
            <span className="text-xl font-bold telemetry-readout text-cat-yellow">
              Tier 2 Certified (88%)
            </span>
          </div>
        </div>
      </div>

      {/* Operator Coaching Insight Card */}
      <div className="p-4 rounded-lg bg-cat-surface border border-cat-yellow/40 flex items-start space-x-3">
        <Sparkles className="w-6 h-6 text-cat-yellow flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cat-yellow">
            Telematics-Driven Personalized Recommendation
          </h3>
          <p className="text-sm text-cat-text mt-1">
            Machine telemetry logs for operator <span className="font-bold text-cat-yellow">{telemetry.operatorName}</span> indicate an idle time of <span className="telemetry-readout font-bold text-cat-text">{telemetry.idleTimeMinutes} min</span> and continuous operating duration of <span className="telemetry-readout font-bold text-cat-text">{telemetry.continuousOpMinutes} min</span>. Micro-course &ldquo;Fuel Optimization &amp; Idle Reduction&rdquo; is prioritized for your next rest period.
          </p>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="cab-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cat-yellow" />
            <h2 className="text-lg font-bold text-cat-text">Active Training Curriculum</h2>
          </div>
          <span className="text-xs text-cat-muted uppercase font-bold">
            {INITIAL_TRAINING_MODULES.length} Micro-Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_TRAINING_MODULES.map((module) => (
            <div
              key={module.id}
              className="p-4 rounded-md bg-cat-surface/50 border border-cat-border hover:border-cat-yellow/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-cat-yellow telemetry-readout">
                    {module.id} &bull; {module.category}
                  </span>
                  {module.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cat-green bg-cat-green/20 px-2 py-0.5 rounded border border-cat-green/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Passed ({module.score}%)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-cat-muted bg-cat-panel px-2 py-0.5 rounded border border-cat-border">
                      {module.estimatedMinutes} min
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-cat-text mt-2">{module.title}</h3>
                <p className="text-sm text-cat-muted mt-1 leading-relaxed">
                  {module.description}
                </p>

                {module.recommendedReason && (
                  <div className="mt-3 p-2 rounded bg-cat-yellow/10 border border-cat-yellow/30 text-xs text-cat-yellow font-medium">
                    &bull; {module.recommendedReason}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-cat-border/60 flex items-center justify-between">
                <span className="text-xs text-cat-muted font-mono">
                  {module.completed ? 'COMPLETED' : 'STATUS: READY TO LAUNCH'}
                </span>
                <button
                  type="button"
                  className="touch-btn h-9 px-3 text-xs uppercase font-extrabold rounded bg-cat-surface border border-cat-border text-cat-text hover:border-cat-yellow hover:text-cat-yellow transition-colors flex items-center gap-1"
                >
                  <span>{module.completed ? 'Review' : 'Start Module'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
