import { UserProfile } from '../types';

const PROFILE_KEY = 'baseline_tracker_user_profile';

export function getUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return {};
    return JSON.parse(data) as UserProfile;
  } catch (error) {
    console.error('Error reading user profile from localStorage:', error);
    return {};
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile to localStorage:', error);
  }
}

export function getAgeFromProfile(profile: UserProfile): number | null {
  if (profile.age) return profile.age;

  if (profile.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  return null;
}

export function getAgeRange(age: number | null): string {
  if (!age) return '18-29'; // Default

  if (age < 18) return 'under-18';
  if (age <= 29) return '18-29';
  if (age <= 39) return '30-39';
  if (age <= 49) return '40-49';
  if (age <= 59) return '50-59';
  return '60+';
}
