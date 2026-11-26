// ==============================================================================
// SWIGGY CAMPUS CIRCLES - CAMPUS BUDDYMATCH ENGINE
// Deterministic compatibility scoring engine for campus group discovery
// ==============================================================================

export interface StudentPreferences {
  userId: string;
  college: string;
  preferredMealWindow: 'Lunch' | 'Dinner' | 'Both' | 'LateNight';
  preferredDays: string[];
  budgetMinPaise: number;
  budgetMaxPaise: number;
  cuisineInterests: string[];
  dietaryPref: 'VEG' | 'NON_VEG' | 'BOTH';
}

export interface CircleCandidate {
  circleId: string;
  name: string;
  college: string;
  mealWindow: 'Lunch' | 'Dinner' | 'Both' | 'LateNight';
  budgetMinPaise: number;
  budgetMaxPaise: number;
  cuisineTags: string[];
  memberCount: number;
  maxCapacity: number;
  isDiscoverable: boolean;
}

export interface CompatibilityResult {
  circleId: string;
  circleName: string;
  score: number; // 0 to 100
  explanation: string;
  isCompatible: boolean;
}

export function calculateBuddyMatchCompatibility(
  student: StudentPreferences,
  circle: CircleCandidate
): CompatibilityResult {
  if (!circle.isDiscoverable) {
    return {
      circleId: circle.circleId,
      circleName: circle.name,
      score: 0,
      explanation: 'Circle is private or not discoverable.',
      isCompatible: false,
    };
  }

  // Same college check
  if (student.college !== circle.college) {
    return {
      circleId: circle.circleId,
      circleName: circle.name,
      score: 0,
      explanation: 'Different campus restriction.',
      isCompatible: false,
    };
  }

  let score = 50; // Base campus match
  const reasons: string[] = ['Same campus'];

  // Meal window overlap
  if (student.preferredMealWindow === 'Both' || circle.mealWindow === 'Both' || student.preferredMealWindow === circle.mealWindow) {
    score += 25;
    reasons.push(`Matching ${circle.mealWindow} window`);
  } else {
    score -= 20;
  }

  // Budget range overlap (in paise)
  const studentMid = (student.budgetMinPaise + student.budgetMaxPaise) / 2;
  const circleMid = (circle.budgetMinPaise + circle.budgetMaxPaise) / 2;
  const budgetDiff = Math.abs(studentMid - circleMid);

  if (budgetDiff <= 5000) { // Within ₹50
    score += 15;
    reasons.push('Similar budget preferences');
  } else if (budgetDiff <= 15000) {
    score += 5;
    reasons.push('Compatible budget range');
  } else {
    score -= 15;
  }

  // Cuisine interest overlap
  const commonCuisines = circle.cuisineTags.filter((c) =>
    student.cuisineInterests.some((sc) => sc.toLowerCase() === c.toLowerCase())
  );
  if (commonCuisines.length > 0) {
    score += 10;
    reasons.push(`Shared cuisine interest: ${commonCuisines.join(', ')}`);
  }

  // Capacity check
  if (circle.memberCount >= circle.maxCapacity) {
    return {
      circleId: circle.circleId,
      circleName: circle.name,
      score: 0,
      explanation: 'Circle is currently at full capacity.',
      isCompatible: false,
    };
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    circleId: circle.circleId,
    circleName: circle.name,
    score: finalScore,
    explanation: `Good match: ${reasons.join(' and ')}.`,
    isCompatible: finalScore >= 60,
  };
}
