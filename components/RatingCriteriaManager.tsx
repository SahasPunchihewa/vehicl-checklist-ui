'use client';

import { useEffect, useState } from 'react';
import { RatingRule, getRatingConfig, updateRatingConfig } from '@/lib/api';

interface RatingCriteriaManagerProps {
  onUpdated?: () => Promise<void> | void;
}

const RATING_FIELDS = [
  { value: 'car_color', label: 'Color' },
  { value: 'interior_color', label: 'Interior Color' },
  { value: 'engine_condition', label: 'Engine Condition' },
  { value: 'gearbox_condition', label: 'Gearbox Condition' },
  { value: 'interior_condition', label: 'Interior Condition' },
];

const CONDITION_FIELDS = new Set(['engine_condition', 'gearbox_condition', 'interior_condition']);
const COLOR_MAP_FIELDS = new Set(['car_color', 'interior_color']);
const SCORE_OPTIONS = ['0', '1', '2', '3', '4', '5'];
const MAX_SCORE_OPTIONS = ['1', '2', '3', '4', '5'];
const COLOR_VALUE_OPTIONS = ['Black', 'Beige', 'White', 'Red Vine', 'Blue', 'Silver', 'Gray', 'Other'];

const parseValueScoreMap = (raw: string): Record<string, number> => {
  const parsed: Record<string, number> = {};

  raw
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .forEach((segment) => {
      const parts = segment.split(/[:=]/);
      if (parts.length < 2) return;
      const key = (parts[0] || '').trim();
      const value = Number((parts[1] || '').trim());
      if (!key || !Number.isFinite(value)) return;
      parsed[key] = Math.max(0, Math.min(5, value));
    });

  return parsed;
};

const getValueMapEntries = (rule: RatingRule): Array<[string, number]> => {
  const map = rule.value_scores || {};
  return Object.entries(map).map(([key, value]) => [key, Number(value)]);
};

const emptyRule = (): RatingRule => ({
  id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  field: '',
  value: '',
  match_type: 'equals',
  score: 0,
  max_score: 5,
  label: '',
});

export default function RatingCriteriaManager({ onUpdated }: RatingCriteriaManagerProps) {
  const [rules, setRules] = useState<RatingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await getRatingConfig();
        const hydratedRules = (config.rules || []).map((rule) => {
          if (!COLOR_MAP_FIELDS.has(rule.field)) {
            return rule;
          }

          const parsedFromLegacyValue = parseValueScoreMap(rule.value || '');
          const hydratedMap = rule.value_scores && Object.keys(rule.value_scores).length > 0
            ? rule.value_scores
            : parsedFromLegacyValue;

          return {
            ...rule,
            value: 'map',
            value_scores: hydratedMap,
          };
        });
        setRules(hydratedRules);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rating rules');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleRuleChange = <K extends keyof RatingRule>(index: number, key: K, value: RatingRule[K]) => {
    setRules((prev) => prev.map((rule, idx) => {
      if (idx !== index) {
        return rule;
      }

      const nextRule = { ...rule, [key]: value };

      if (key === 'field' && CONDITION_FIELDS.has(String(value))) {
        // Condition fields are auto-scored from vehicle value (1-5).
        nextRule.match_type = 'scale_5';
        nextRule.value = 'auto';
        nextRule.score = 5;
        nextRule.max_score = 5;
        nextRule.value_scores = undefined;
      }

      if (key === 'field' && COLOR_MAP_FIELDS.has(String(value))) {
        // Color rules are maintained as a single value map per field.
        nextRule.match_type = 'value_map';
        nextRule.value = 'map';
        nextRule.score = 0;
        nextRule.max_score = 5;
        nextRule.value_scores = nextRule.value_scores || { Black: 5 };
      }

      return nextRule;
    }));
  };

  const handleAddRule = () => {
    setRules((prev) => [...prev, emptyRule()]);
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleValueMapChange = (index: number, oldKey: string, newKey: string, newScore: number) => {
    setRules((prev) => prev.map((rule, idx) => {
      if (idx !== index) return rule;
      const nextMap: Record<string, number> = { ...(rule.value_scores || {}) };
      delete nextMap[oldKey];
      if (newKey.trim()) {
        nextMap[newKey.trim()] = newScore;
      }
      return { ...rule, value_scores: nextMap };
    }));
  };

  const handleValueMapAdd = (index: number) => {
    setRules((prev) => prev.map((rule, idx) => {
      if (idx !== index) return rule;
      const nextMap: Record<string, number> = { ...(rule.value_scores || {}) };
      const firstAvailable = COLOR_VALUE_OPTIONS.find((option) => !(option in nextMap)) || `Value ${Object.keys(nextMap).length + 1}`;
      nextMap[firstAvailable] = 0;
      return { ...rule, value_scores: nextMap };
    }));
  };

  const handleValueMapRemove = (index: number, keyToRemove: string) => {
    setRules((prev) => prev.map((rule, idx) => {
      if (idx !== index) return rule;
      const nextMap: Record<string, number> = { ...(rule.value_scores || {}) };
      delete nextMap[keyToRemove];
      return { ...rule, value_scores: nextMap };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedRules = rules
        .map((rule) => {
          const isConditionField = CONDITION_FIELDS.has(rule.field);
          const isColorMapField = COLOR_MAP_FIELDS.has(rule.field);
          const parsedValueMap = isColorMapField ? (rule.value_scores || {}) : undefined;

          return {
            ...rule,
            field: rule.field.trim(),
            value: isConditionField ? 'auto' : (isColorMapField ? 'map' : rule.value.trim()),
            match_type: isConditionField
              ? 'scale_5'
              : (isColorMapField ? 'value_map' : rule.match_type),
            label: (rule.label || '').trim(),
            score: isConditionField
              ? 5
              : (isColorMapField ? 0 : (Number.isFinite(Number(rule.score)) ? Number(rule.score) : 0)),
            max_score: isConditionField
              ? 5
              : (Number.isFinite(Number(rule.max_score)) ? Number(rule.max_score) : 5),
            value_scores: isColorMapField ? parsedValueMap : undefined,
          };
        })
        .filter((rule) => {
          if (!rule.field) return false;
          if (COLOR_MAP_FIELDS.has(rule.field)) {
            return !!rule.value_scores && Object.keys(rule.value_scores).length > 0;
          }
          return !!rule.value;
        });

      const updated = await updateRatingConfig({ rules: sanitizedRules });
      setRules(updated.rules || []);
      setSuccess('Rating criteria saved');
      if (onUpdated) {
        await onUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-12 p-6 bg-card-bg border border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rating Criteria</h2>
          <p className="text-sm text-text-secondary mt-1">
            Pick a field, then define values like Interior Color = black gives 5/5.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRule}
          className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          + Add Rule
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-red-300 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-green-300 text-sm">{success}</div>}

      {loading ? (
        <p className="text-text-secondary">Loading rating rules...</p>
      ) : (
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-sm text-text-secondary">No rules yet. Add your first rating rule.</p>
          )}

          {rules.map((rule, index) => (
            <div key={rule.id || index} className="grid grid-cols-1 lg:grid-cols-12 gap-2 bg-background border border-border rounded-lg p-3">
              {(() => {
                const isConditionField = CONDITION_FIELDS.has(rule.field);
                const isColorMapField = COLOR_MAP_FIELDS.has(rule.field);
                return (
                  <>
              <select
                value={rule.field}
                onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                className="lg:col-span-3 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
              >
                <option value="">Select field</option>
                {RATING_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <select
                value={rule.match_type}
                onChange={(e) => handleRuleChange(index, 'match_type', e.target.value as 'equals' | 'contains' | 'scale_5' | 'value_map')}
                disabled={isConditionField || isColorMapField}
                className="lg:col-span-2 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
              >
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="scale_5">auto (1-5)</option>
                <option value="value_map">value map</option>
              </select>
              {isConditionField ? (
                <div className="lg:col-span-2 px-3 py-2 bg-card-bg border border-border rounded text-sm text-text-secondary">
                  Auto from vehicle value (1-5)
                </div>
              ) : isColorMapField ? (
                <div className="lg:col-span-4 p-2 bg-card-bg border border-border rounded text-sm text-foreground">
                  <p className="text-xs text-text-secondary mb-2">Map each color to a score.</p>
                  <div className="space-y-2">
                    {getValueMapEntries(rule).map(([mapKey, mapScore]) => (
                      <div key={mapKey} className="flex gap-2 items-center">
                        <select
                          value={mapKey}
                          onChange={(e) => handleValueMapChange(index, mapKey, e.target.value, mapScore)}
                          className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                        >
                          {[mapKey, ...COLOR_VALUE_OPTIONS.filter((option) => option !== mapKey)].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <select
                          value={String(mapScore)}
                          onChange={(e) => handleValueMapChange(index, mapKey, mapKey, Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-background border border-border rounded text-sm"
                        >
                          {SCORE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleValueMapRemove(index, mapKey)}
                          className="px-2 py-1 text-xs rounded bg-error/20 text-red-300 border border-error/30 hover:bg-error/30"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleValueMapAdd(index)}
                    className="mt-2 px-2 py-1 text-xs rounded bg-border text-text-secondary hover:bg-border/80"
                  >
                    + Add value
                  </button>
                </div>
              ) : (
                <input
                  value={rule.value}
                  onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g. black)"
                  className="lg:col-span-2 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
                />
              )}
              {!isColorMapField && (
                <select
                  value={String(rule.score)}
                  onChange={(e) => handleRuleChange(index, 'score', Number(e.target.value))}
                  disabled={isConditionField}
                  className="lg:col-span-1 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
                >
                  {SCORE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {!isColorMapField && (
                <select
                  value={String(rule.max_score)}
                  onChange={(e) => handleRuleChange(index, 'max_score', Number(e.target.value))}
                  disabled={isConditionField}
                  className="lg:col-span-1 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
                >
                  {MAX_SCORE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              <input
                value={rule.label || ''}
                onChange={(e) => handleRuleChange(index, 'label', e.target.value)}
                placeholder="Label (optional)"
                className="lg:col-span-2 px-3 py-2 bg-card-bg border border-border rounded text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="lg:col-span-1 px-2 py-2 text-sm rounded bg-error/20 text-red-300 border border-error/30 hover:bg-error/30"
                title="Remove rule"
              >
                Remove
              </button>
                  </>
                );
              })()}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-border disabled:text-text-secondary"
            >
              {saving ? 'Saving...' : 'Save Criteria'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

