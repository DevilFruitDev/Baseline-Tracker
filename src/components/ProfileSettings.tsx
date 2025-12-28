import { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../utils/profile';
import { Gender } from '../types';

export const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState(getUserProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentProfile = getUserProfile();
    setProfile(currentProfile);
  }, []);

  const handleChange = (field: string, value: string | number | undefined) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveUserProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const calculateAge = () => {
    if (!profile.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Profile Settings
        </h2>
        {saved && (
          <span className="text-green-600 font-medium animate-fadeIn">
            ✓ Saved!
          </span>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Why provide this information?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Age & Gender:</strong> Automatically adjusts benchmarks to match your demographic</li>
          <li>• <strong>Baseline Bodyweight:</strong> Enables fair scoring for bodyweight exercises (pull-ups, push-ups)</li>
          <li>• <strong>Height:</strong> Helps contextualize performance on mobility and strength tests</li>
        </ul>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name (Optional)
          </label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(['male', 'female', 'other'] as Gender[]).map((gender) => (
              <button
                key={gender}
                onClick={() => handleChange('gender', gender)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  profile.gender === gender
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Used for gender-specific benchmark adjustments (pull-ups, push-ups, VO2 max, etc.)
          </p>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={profile.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {calculatedAge !== null && (
            <p className="text-sm text-gray-600 mt-2">
              Current age: <strong>{calculatedAge} years old</strong>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Age ranges (18-29, 30-39, 40-49, 50-59, 60+) adjust benchmarks for VO2 max and other tests
          </p>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Height (inches)
          </label>
          <input
            type="number"
            value={profile.heightInches || ''}
            onChange={(e) => handleChange('heightInches', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g., 70"
            min="0"
            step="0.5"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {profile.heightInches && (
            <p className="text-sm text-gray-600 mt-2">
              {Math.floor(profile.heightInches / 12)}' {Math.round(profile.heightInches % 12)}"
            </p>
          )}
        </div>

        {/* Baseline Bodyweight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Baseline Bodyweight (lbs) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={profile.baselineBodyweightLbs || ''}
            onChange={(e) => handleChange('baselineBodyweightLbs', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g., 175"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-2">
            <strong>Important:</strong> This is your "baseline" bodyweight for relative scoring. If you do 10 pull-ups at 200 lbs vs 150 lbs, the system adjusts your score accordingly.
          </p>
        </div>

        {/* Current Weight Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 mb-2">💡 Bodyweight-Relative Scoring</h4>
          <p className="text-sm text-purple-800">
            For bodyweight exercises (pull-ups, push-ups, knee raises), the app calculates a Wilks-like coefficient based on your current vs baseline weight. This ensures fair comparison across different bodyweights.
          </p>
          <p className="text-sm text-purple-800 mt-2">
            <strong>Example:</strong> 10 pull-ups at 200 lbs baseline, but you currently weigh 210 lbs → adjusted to ~10.5 reps worth of effort.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Save Profile
        </button>

        {/* Required fields note */}
        <p className="text-xs text-gray-500 text-center">
          <span className="text-red-500">*</span> Required for age/gender-adjusted benchmarks and bodyweight-relative scoring
        </p>
      </div>
    </div>
  );
};
