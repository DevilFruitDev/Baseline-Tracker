import { useState, useEffect } from 'react';
import { TestDefinition, InputType } from '../types';
import { getCustomTests, saveCustomTest, deleteCustomTest, generateTestId } from '../utils/customTests';

export const CustomTestManager: React.FC = () => {
  const [customTests, setCustomTests] = useState<TestDefinition[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState<TestDefinition | null>(null);
  const [formData, setFormData] = useState<Partial<TestDefinition>>({
    category: 'Strength',
    inputType: 'reps',
    unit: 'reps',
    benchmarks: {
      fail: 0,
      baseline: 0,
      strong: 0,
      elite: 0,
    },
  });

  useEffect(() => {
    loadCustomTests();
  }, []);

  const loadCustomTests = () => {
    const tests = getCustomTests();
    setCustomTests(tests);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBenchmarkChange = (level: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      benchmarks: {
        ...prev.benchmarks!,
        [level]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.unit || !formData.inputType) {
      alert('Please fill in all required fields (name, category, unit, input type)');
      return;
    }

    const testToSave: TestDefinition = {
      id: editingTest?.id || generateTestId(),
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      inputType: formData.inputType,
      instructions: formData.instructions || '',
      benchmarks: formData.benchmarks || { fail: 0, baseline: 0, strong: 0, elite: 0 },
      isCustom: true,
      isBodyweightRelative: formData.isBodyweightRelative || false,
      createdAt: editingTest?.createdAt || new Date().toISOString(),
    };

    saveCustomTest(testToSave);
    resetForm();
    loadCustomTests();
  };

  const handleEdit = (test: TestDefinition) => {
    setEditingTest(test);
    setFormData(test);
    setIsCreating(true);
  };

  const handleDelete = (testId: string) => {
    if (window.confirm('Are you sure you want to delete this custom test? This cannot be undone.')) {
      deleteCustomTest(testId);
      loadCustomTests();
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Strength',
      inputType: 'reps',
      unit: 'reps',
      benchmarks: {
        fail: 0,
        baseline: 0,
        strong: 0,
        elite: 0,
      },
    });
    setIsCreating(false);
    setEditingTest(null);
  };

  const categories = ['Strength', 'Conditioning', 'Core', 'Mobility', 'Posture/Control', 'Flexibility', 'Body Composition', 'Cardiovascular', 'Power/Speed'];
  const inputTypes: { value: InputType; label: string; unit: string }[] = [
    { value: 'reps', label: 'Repetitions', unit: 'reps' },
    { value: 'seconds', label: 'Time (seconds)', unit: 'seconds' },
    { value: 'time_mmss', label: 'Time (mm:ss)', unit: 'time (mm:ss)' },
    { value: 'miles', label: 'Distance (miles)', unit: 'miles' },
    { value: 'inches', label: 'Distance (inches)', unit: 'inches' },
    { value: 'percentage', label: 'Percentage', unit: '%' },
    { value: 'weight_lbs', label: 'Weight (lbs)', unit: 'lbs' },
    { value: 'pass_fail', label: 'Pass/Fail', unit: 'pass/fail' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Custom Tests
        </h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            + Create New Test
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-purple-900 mb-2">Create Your Own Tests</h3>
        <p className="text-sm text-purple-800">
          Build custom tests tailored to your specific needs. Track any metric you want - from sport-specific movements to rehabilitation exercises.
        </p>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {editingTest ? 'Edit Test' : 'Create New Test'}
          </h3>

          <div className="space-y-4">
            {/* Test Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Pistol Squat, Turkish Get-Up"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category || 'Strength'}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Input Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Measurement Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.inputType || 'reps'}
                onChange={(e) => {
                  const selected = inputTypes.find(t => t.value === e.target.value);
                  if (selected) {
                    handleInputChange('inputType', selected.value);
                    handleInputChange('unit', selected.unit);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {inputTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Describe how to perform this test..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bodyweight Relative */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bodyweight-relative"
                checked={formData.isBodyweightRelative || false}
                onChange={(e) => handleInputChange('isBodyweightRelative', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="bodyweight-relative" className="text-sm font-medium text-gray-700">
                Bodyweight-Relative Test (adjust for bodyweight changes)
              </label>
            </div>

            {/* Benchmarks */}
            {formData.inputType !== 'pass_fail' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benchmarks <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fail (below this)</label>
                    <input
                      type="number"
                      value={formData.benchmarks?.fail || 0}
                      onChange={(e) => handleBenchmarkChange('fail', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Baseline</label>
                    <input
                      type="number"
                      value={formData.benchmarks?.baseline || 0}
                      onChange={(e) => handleBenchmarkChange('baseline', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Strong</label>
                    <input
                      type="number"
                      value={formData.benchmarks?.strong || 0}
                      onChange={(e) => handleBenchmarkChange('strong', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Elite</label>
                    <input
                      type="number"
                      value={formData.benchmarks?.elite || 0}
                      onChange={(e) => handleBenchmarkChange('elite', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: For time-based tests where lower is better, the system will automatically invert the comparison.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingTest ? 'Update Test' : 'Create Test'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Tests List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Your Custom Tests ({customTests.length})
        </h3>

        {customTests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-gray-500">No custom tests yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customTests.map(test => (
              <div
                key={test.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900">{test.name}</h4>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {test.category}
                      </span>
                      {test.isBodyweightRelative && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          BW-Relative
                        </span>
                      )}
                    </div>
                    {test.instructions && (
                      <p className="text-sm text-gray-600 mb-2">{test.instructions}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Unit: {test.unit}</span>
                      {test.inputType !== 'pass_fail' && test.benchmarks && (
                        <span>
                          Benchmarks: Fail:{test.benchmarks.fail} | Baseline:{test.benchmarks.baseline} | Strong:{test.benchmarks.strong} | Elite:{test.benchmarks.elite}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(test)}
                      className="px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
