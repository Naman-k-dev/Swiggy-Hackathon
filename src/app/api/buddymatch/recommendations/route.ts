import { NextResponse } from 'next/server';
import { calculateBuddyMatchCompatibility, StudentPreferences, CircleCandidate } from '@/lib/buddymatch/buddymatch-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const college = searchParams.get('college') || 'PW Institute of Innovation Noida';
    const mealWindow = (searchParams.get('mealWindow') as 'Lunch' | 'Dinner' | 'Both' | 'LateNight') || 'Lunch';
    const minPaise = parseInt(searchParams.get('minPaise') || '15000', 10);
    const maxPaise = parseInt(searchParams.get('maxPaise') || '35000', 10);

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const student: StudentPreferences = {
      userId,
      college,
      preferredMealWindow: mealWindow,
      preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      budgetMinPaise: minPaise,
      budgetMaxPaise: maxPaise,
      cuisineInterests: ['Biryani', 'Pizza', 'North Indian', 'Burgers'],
      dietaryPref: 'BOTH',
    };

    // Mock discoverable circles for campus pilot demonstration
    const mockCircles: CircleCandidate[] = [
      {
        circleId: 'circle-cse-lunch',
        name: 'CSE 3rd Year Lunch Squad',
        college: 'PW Institute of Innovation Noida',
        mealWindow: 'Lunch',
        budgetMinPaise: 18000,
        budgetMaxPaise: 30000,
        cuisineTags: ['Biryani', 'North Indian', 'Rolls'],
        memberCount: 6,
        maxCapacity: 10,
        isDiscoverable: true,
      },
      {
        circleId: 'circle-hostel-night',
        name: 'Hostel Block B Night Owls',
        college: 'PW Institute of Innovation Noida',
        mealWindow: 'LateNight',
        budgetMinPaise: 20000,
        budgetMaxPaise: 40000,
        cuisineTags: ['Pizza', 'Burgers', 'Momos'],
        memberCount: 8,
        maxCapacity: 12,
        isDiscoverable: true,
      },
      {
        circleId: 'circle-coding-club',
        name: 'Hackathon Coders Diner',
        college: 'PW Institute of Innovation Noida',
        mealWindow: 'Dinner',
        budgetMinPaise: 15000,
        budgetMaxPaise: 25000,
        cuisineTags: ['South Indian', 'Chinese', 'Fast Food'],
        memberCount: 4,
        maxCapacity: 8,
        isDiscoverable: true,
      },
      {
        circleId: 'circle-private-vip',
        name: 'Secret VIP Circle',
        college: 'PW Institute of Innovation Noida',
        mealWindow: 'Lunch',
        budgetMinPaise: 30000,
        budgetMaxPaise: 50000,
        cuisineTags: ['Continental'],
        memberCount: 3,
        maxCapacity: 5,
        isDiscoverable: false, // Must not appear
      },
    ];

    const recommendations = mockCircles
      .filter((c) => c.isDiscoverable)
      .map((c) => calculateBuddyMatchCompatibility(student, c))
      .filter((r) => r.isCompatible)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}
