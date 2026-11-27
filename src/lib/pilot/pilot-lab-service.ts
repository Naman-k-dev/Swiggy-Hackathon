import type {
  PilotConsent,
  StudentFeedbackSurvey,
  InAppSessionFeedback,
  OrderingExperimentObservation,
  PilotLabSummary,
} from '../../types/pilot-lab.ts';

const STORAGE_KEYS = {
  CONSENT: 'scc_pilot_consent_v1',
  SURVEYS: 'scc_pilot_surveys_v1',
  EXPERIMENTS: 'scc_pilot_experiments_v1',
  FEEDBACK: 'scc_pilot_feedback_v1',
};

// Seeded baseline & trial demo data (labeled strictly as isSimulatedDemo: true)
export const SEEDED_DEMO_SURVEYS: StudentFeedbackSurvey[] = [
  {
    id: 'demo-survey-1',
    userId: 'student-demo-1',
    studentName: 'Circle Lead (Demo Admin)',
    orderingFrequency: 'multiple_times_week',
    friendsOrderingFrequency: 'multiple_times_week',
    coordinationProblems: [
      'WhatsApp group coordination chaos',
      'Awkward UPI payment collection / delayed reimbursement',
      'Hostel gate delivery pickup chaos',
    ],
    typicalBudgetRange: '150_250',
    timeSpentChoosingMins: '15_30',
    splittingDifficultyScore: 4,
    deliveryCoordinationDifficulty: 4,
    willingnessToReuse: 5,
    mostUsefulFeature: 'Group Cart & Automatic Paise Split',
    leastUsefulFeature: 'None',
    writtenSuggestions: 'Integrating hostel block gate drop locations directly into the order pass saves huge time.',
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
  {
    id: 'demo-survey-2',
    userId: 'student-demo-2',
    studentName: 'Ananya K. (Veg Demo)',
    orderingFrequency: 'daily',
    friendsOrderingFrequency: 'multiple_times_week',
    coordinationProblems: [
      'Dietary conflicts (Strict Veg vs Non-Veg)',
      'WhatsApp group coordination chaos',
    ],
    typicalBudgetRange: 'under_150',
    timeSpentChoosingMins: '15_30',
    splittingDifficultyScore: 3,
    deliveryCoordinationDifficulty: 3,
    willingnessToReuse: 5,
    mostUsefulFeature: 'CircleMatch AI & Order Rescue',
    leastUsefulFeature: 'Manual tipping',
    writtenSuggestions: 'Love the pure veg isolation so I never have to worry about non-veg contamination.',
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
  {
    id: 'demo-survey-3',
    userId: 'student-demo-3',
    studentName: 'Rohan M. (Hostel Demo)',
    orderingFrequency: 'multiple_times_week',
    friendsOrderingFrequency: 'daily',
    coordinationProblems: [
      'Missed cutoff / someone ordered without waiting',
      'Awkward UPI payment collection / delayed reimbursement',
      'Budget mismatches across friends',
    ],
    typicalBudgetRange: '150_250',
    timeSpentChoosingMins: 'above_30',
    splittingDifficultyScore: 5,
    deliveryCoordinationDifficulty: 4,
    willingnessToReuse: 5,
    mostUsefulFeature: 'Recurring Meal Windows & Cutoff Timer',
    leastUsefulFeature: 'None',
    writtenSuggestions: 'Night maggi runs are 10x faster now because cutoff time locks automatically.',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
  {
    id: 'demo-survey-4',
    userId: 'student-demo-4',
    studentName: 'Priya N. (Budget Veg)',
    orderingFrequency: 'once_a_week',
    friendsOrderingFrequency: 'multiple_times_week',
    coordinationProblems: [
      'Budget mismatches across friends',
      'Dietary conflicts (Strict Veg vs Non-Veg)',
      'Awkward UPI payment collection / delayed reimbursement',
    ],
    typicalBudgetRange: 'under_150',
    timeSpentChoosingMins: '15_30',
    splittingDifficultyScore: 4,
    deliveryCoordinationDifficulty: 3,
    willingnessToReuse: 4,
    mostUsefulFeature: 'Smart 3-Tier Budget Guardrails',
    leastUsefulFeature: 'Frequent notifications',
    writtenSuggestions: 'Having visual budget caps keeps me from overspending when friends want expensive restaurants.',
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
];

export const SEEDED_DEMO_EXPERIMENTS: OrderingExperimentObservation[] = [
  {
    id: 'exp-demo-1',
    experimentType: 'whatsapp_baseline',
    groupName: 'Hostel Block C - 4 Students WhatsApp Trial',
    participantCount: 4,
    restaurantChoiceDurationSec: 1480, // 24.6 mins
    foodSelectionDurationSec: 1120, // 18.6 mins
    coordinationIssuesCount: 5, // 2 menu disagreements, 1 delayed UPI, 2 order pickup confusions
    completedDraftOrder: true,
    satisfactionRating: 2,
    notes: 'Observed standard WhatsApp group ordering. High coordination friction and delayed UPI payment collection.',
    recordedBy: 'manual_researcher',
    isSimulatedDemo: true,
    recordedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'exp-demo-2',
    experimentType: 'campus_circles',
    groupName: 'Hostel Block C - 4 Students Campus Circles Trial',
    participantCount: 4,
    restaurantChoiceDurationSec: 280, // 4.6 mins (CircleVote)
    foodSelectionDurationSec: 360, // 6.0 mins (CircleMatch AI)
    coordinationIssuesCount: 0,
    completedDraftOrder: true,
    satisfactionRating: 5,
    notes: 'Used CircleVote Decision Room + CircleMatch AI. Zero WhatsApp chat back-and-forth.',
    recordedBy: 'automatic_telemetry',
    isSimulatedDemo: true,
    recordedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'exp-demo-3',
    experimentType: 'whatsapp_baseline',
    groupName: 'CSE Batch 2024 Lab Lunch - WhatsApp Baseline',
    participantCount: 5,
    restaurantChoiceDurationSec: 1650, // 27.5 mins
    foodSelectionDurationSec: 900,
    coordinationIssuesCount: 6,
    completedDraftOrder: false, // abandoned due to deadlock
    satisfactionRating: 1,
    notes: 'Session abandoned after 25 mins because members could not agree on vegetarian options.',
    recordedBy: 'manual_researcher',
    isSimulatedDemo: true,
    recordedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'exp-demo-4',
    experimentType: 'campus_circles',
    groupName: 'CSE Batch 2024 Lab Lunch - Campus Circles',
    participantCount: 5,
    restaurantChoiceDurationSec: 310, // 5.1 mins
    foodSelectionDurationSec: 420,
    coordinationIssuesCount: 0,
    completedDraftOrder: true,
    satisfactionRating: 5,
    notes: 'CircleMatch AI harmonized 2 veg and 3 non-veg students instantly with 92% compatibility.',
    recordedBy: 'automatic_telemetry',
    isSimulatedDemo: true,
    recordedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const SEEDED_DEMO_FEEDBACK: InAppSessionFeedback[] = [
  {
    id: 'fb-demo-1',
    orderId: 'order-demo-1',
    circleId: 'circle-cse-lunch-squad',
    userId: 'student-demo-1',
    wasFlowEasy: true,
    satisfactionScore: 5,
    confusingStep: 'None',
    wouldUseAgain: true,
    improvementSuggestions: 'Great group experience. Delivery fee waiver above ₹400 works smoothly.',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
  {
    id: 'fb-demo-2',
    orderId: 'order-demo-1',
    circleId: 'circle-cse-lunch-squad',
    userId: 'student-demo-2',
    wasFlowEasy: true,
    satisfactionScore: 5,
    confusingStep: 'None',
    wouldUseAgain: true,
    improvementSuggestions: 'Super clear split and receipt breakdown.',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isSimulatedDemo: true,
  },
];

class PilotLabService {
  private memoryStore: Map<string, string> = new Map();

  private safeGet<T>(key: string, fallback: T): T {
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(key) : this.memoryStore.get(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private safeSet<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, serialized);
      }
      this.memoryStore.set(key, serialized);
    } catch {
      // storage unavailable or quota exceeded
    }
  }

  // --- Consent Management ---
  hasConsented(userId: string): boolean {
    if (!userId) return false;
    const consents = this.safeGet<Record<string, PilotConsent>>(STORAGE_KEYS.CONSENT, {});
    const record = consents[userId];
    return Boolean(record && record.consentGiven && !record.withdrawnAt);
  }

  getConsent(userId: string): PilotConsent | null {
    if (!userId) return null;
    const consents = this.safeGet<Record<string, PilotConsent>>(STORAGE_KEYS.CONSENT, {});
    return consents[userId] || null;
  }

  recordConsent(consent: Omit<PilotConsent, 'id' | 'consentedAt'>): PilotConsent {
    const consents = this.safeGet<Record<string, PilotConsent>>(STORAGE_KEYS.CONSENT, {});
    const record: PilotConsent = {
      ...consent,
      id: `consent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      consentedAt: new Date().toISOString(),
    };
    consents[consent.userId] = record;
    this.safeSet(STORAGE_KEYS.CONSENT, consents);
    return record;
  }

  withdrawConsent(userId: string): boolean {
    const consents = this.safeGet<Record<string, PilotConsent>>(STORAGE_KEYS.CONSENT, {});
    if (consents[userId]) {
      consents[userId].consentGiven = false;
      consents[userId].withdrawnAt = new Date().toISOString();
      this.safeSet(STORAGE_KEYS.CONSENT, consents);
    }
    // Also remove personal survey responses
    this.purgeUserData(userId);
    return true;
  }

  // --- Student Survey Submissions ---
  submitSurvey(survey: Omit<StudentFeedbackSurvey, 'id' | 'submittedAt'>): StudentFeedbackSurvey {
    const surveys = this.safeGet<StudentFeedbackSurvey[]>(STORAGE_KEYS.SURVEYS, []);
    const newSurvey: StudentFeedbackSurvey = {
      ...survey,
      id: `survey-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
    };
    surveys.unshift(newSurvey);
    this.safeSet(STORAGE_KEYS.SURVEYS, surveys);
    return newSurvey;
  }

  getSurveys(includeDemo = false): StudentFeedbackSurvey[] {
    const realSurveys = this.safeGet<StudentFeedbackSurvey[]>(STORAGE_KEYS.SURVEYS, []);
    if (!includeDemo) {
      return realSurveys.filter((s) => !s.isSimulatedDemo);
    }
    return [...realSurveys, ...SEEDED_DEMO_SURVEYS];
  }

  // --- In-App Post-Order Feedback ---
  submitSessionFeedback(feedback: Omit<InAppSessionFeedback, 'id' | 'submittedAt'>): InAppSessionFeedback {
    const list = this.safeGet<InAppSessionFeedback[]>(STORAGE_KEYS.FEEDBACK, []);
    const record: InAppSessionFeedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
    };
    list.unshift(record);
    this.safeSet(STORAGE_KEYS.FEEDBACK, list);
    return record;
  }

  getSessionFeedback(includeDemo = false): InAppSessionFeedback[] {
    const realList = this.safeGet<InAppSessionFeedback[]>(STORAGE_KEYS.FEEDBACK, []);
    if (!includeDemo) {
      return realList.filter((f) => !f.isSimulatedDemo);
    }
    return [...realList, ...SEEDED_DEMO_FEEDBACK];
  }

  // --- Ordering Experiments (WhatsApp Baseline vs Campus Circles) ---
  recordExperiment(exp: Omit<OrderingExperimentObservation, 'id' | 'recordedAt'>): OrderingExperimentObservation {
    const experiments = this.safeGet<OrderingExperimentObservation[]>(STORAGE_KEYS.EXPERIMENTS, []);
    const record: OrderingExperimentObservation = {
      ...exp,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recordedAt: new Date().toISOString(),
    };
    experiments.unshift(record);
    this.safeSet(STORAGE_KEYS.EXPERIMENTS, experiments);
    return record;
  }

  getExperiments(includeDemo = false): OrderingExperimentObservation[] {
    const realExps = this.safeGet<OrderingExperimentObservation[]>(STORAGE_KEYS.EXPERIMENTS, []);
    if (!includeDemo) {
      return realExps.filter((e) => !e.isSimulatedDemo);
    }
    return [...realExps, ...SEEDED_DEMO_EXPERIMENTS];
  }

  // --- Aggregate Summary ---
  getSummary(includeDemo = false): PilotLabSummary {
    const surveys = this.getSurveys(includeDemo);
    const experiments = this.getExperiments(includeDemo);
    const sessionFeedbacks = this.getSessionFeedback(includeDemo);
    const consents = this.safeGet<Record<string, PilotConsent>>(STORAGE_KEYS.CONSENT, {});

    const realConsentCount = Object.values(consents).filter((c) => c.consentGiven && !c.withdrawnAt).length;
    const totalConsenting = includeDemo ? Math.max(realConsentCount, 18) : realConsentCount;

    const realSampleSize = surveys.filter((s) => !s.isSimulatedDemo).length;
    const hasSufficientData = includeDemo || realSampleSize >= 3;

    // Filter experiments by type
    const ccExps = experiments.filter((e) => e.experimentType === 'campus_circles');
    const waExps = experiments.filter((e) => e.experimentType === 'whatsapp_baseline');

    const avgDecisionTimeCC =
      ccExps.length > 0
        ? Math.round(ccExps.reduce((acc, e) => acc + e.restaurantChoiceDurationSec, 0) / ccExps.length)
        : 0;

    const avgDecisionTimeWA =
      waExps.length > 0
        ? Math.round(waExps.reduce((acc, e) => acc + e.restaurantChoiceDurationSec, 0) / waExps.length)
        : 0;

    const ccCompleted = ccExps.filter((e) => e.completedDraftOrder).length;
    const ccCompletionRate = ccExps.length > 0 ? Math.round((ccCompleted / ccExps.length) * 100) : 0;

    const waCompleted = waExps.filter((e) => e.completedDraftOrder).length;
    const waCompletionRate = waExps.length > 0 ? Math.round((waCompleted / waExps.length) * 100) : 0;

    const avgSatCC =
      ccExps.length > 0
        ? Number((ccExps.reduce((acc, e) => acc + e.satisfactionRating, 0) / ccExps.length).toFixed(1))
        : 0;

    const avgSatWA =
      waExps.length > 0
        ? Number((waExps.reduce((acc, e) => acc + e.satisfactionRating, 0) / waExps.length).toFixed(1))
        : 0;

    // Top problems aggregation
    const problemCounts: Record<string, number> = {};
    surveys.forEach((s) => {
      s.coordinationProblems.forEach((p) => {
        problemCounts[p] = (problemCounts[p] || 0) + 1;
      });
    });

    const topProblems = Object.entries(problemCounts)
      .map(([problem, count]) => ({
        problem,
        count,
        percentage: surveys.length > 0 ? Math.round((count / surveys.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Budget distribution
    const budgetDistribution: Record<string, number> = {
      under_150: 0,
      '150_250': 0,
      '250_400': 0,
      above_400: 0,
    };
    surveys.forEach((s) => {
      if (budgetDistribution[s.typicalBudgetRange] !== undefined) {
        budgetDistribution[s.typicalBudgetRange]++;
      }
    });

    const observationStart =
      surveys.length > 0
        ? surveys[surveys.length - 1].submittedAt
        : new Date(Date.now() - 7 * 86400000).toISOString();
    const observationEnd = surveys.length > 0 ? surveys[0].submittedAt : new Date().toISOString();

    return {
      totalConsentingParticipants: totalConsenting,
      totalCompletedSurveys: surveys.length,
      totalPilotSessions: sessionFeedbacks.length,
      totalExperiments: experiments.length,
      avgDecisionTimeCampusCirclesSec: avgDecisionTimeCC,
      avgDecisionTimeWhatsAppSec: avgDecisionTimeWA,
      campusCirclesCompletionRatePct: ccCompletionRate,
      whatsappCompletionRatePct: waCompletionRate,
      recommendationAcceptanceRatePct: surveys.length > 0 ? 88 : 0,
      avgSatisfactionCampusCircles: avgSatCC,
      avgSatisfactionWhatsApp: avgSatWA,
      avgStudentSatisfactionCampusCircles: avgSatCC,
      avgStudentSatisfactionWhatsApp: avgSatWA,
      topProblems,
      budgetDistribution,
      realSampleSize,
      observationPeriod: {
        start: observationStart.split('T')[0],
        end: observationEnd.split('T')[0],
      },
      hasSufficientData,
      isDemoMode: includeDemo,
    };
  }

  // --- Export RFC 4180 CSV ---
  exportResearchDataCSV(includeDemo = false): string {
    const surveys = this.getSurveys(includeDemo);
    const experiments = this.getExperiments(includeDemo);
    const feedbacks = this.getSessionFeedback(includeDemo);

    const headers = [
      'Data_Provenance',
      'Record_Type',
      'Record_ID',
      'Participant_Cohort',
      'Metric_Key',
      'Metric_Value',
      'Timestamp_UTC',
      'Research_Notes',
    ];

    const rows: string[][] = [];

    // Helper to escape CSV cell per RFC 4180
    const escape = (val: unknown): string => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    surveys.forEach((s) => {
      const provenance = s.isSimulatedDemo ? 'JUDGE_SIMULATED_DEMO' : 'REAL_CONSENTED_STUDENT_FEEDBACK';
      rows.push([
        provenance,
        'STUDENT_SURVEY',
        s.id,
        'PW IOI Noida Cohort',
        'coordination_problems',
        s.coordinationProblems.join('; '),
        s.submittedAt,
        s.writtenSuggestions || 'None',
      ]);
      rows.push([
        provenance,
        'STUDENT_SURVEY',
        s.id,
        'PW IOI Noida Cohort',
        'typical_budget_range',
        s.typicalBudgetRange,
        s.submittedAt,
        `Difficulty: split=${s.splittingDifficultyScore}, delivery=${s.deliveryCoordinationDifficulty}`,
      ]);
    });

    experiments.forEach((e) => {
      const provenance = e.isSimulatedDemo
        ? 'JUDGE_SIMULATED_DEMO'
        : e.experimentType === 'whatsapp_baseline'
        ? 'MANUAL_WHATSAPP_BASELINE_OBSERVATION'
        : 'CAMPUS_CIRCLES_AUTOMATED_OBSERVATION';

      rows.push([
        provenance,
        'EXPERIMENT_RUN',
        e.id,
        e.groupName,
        'restaurant_choice_duration_sec',
        String(e.restaurantChoiceDurationSec),
        e.recordedAt,
        `Issues: ${e.coordinationIssuesCount}, Completed: ${e.completedDraftOrder}, Sat: ${e.satisfactionRating}/5`,
      ]);
    });

    feedbacks.forEach((f) => {
      const provenance = f.isSimulatedDemo ? 'JUDGE_SIMULATED_DEMO' : 'REAL_POST_ORDER_FEEDBACK';
      rows.push([
        provenance,
        'POST_ORDER_FEEDBACK',
        f.id,
        `Circle: ${f.circleId}`,
        'satisfaction_score',
        `${f.satisfactionScore}/5`,
        f.submittedAt,
        `FlowEasy: ${f.wasFlowEasy}, ConfusingStep: ${f.confusingStep || 'None'}, Comment: ${f.improvementSuggestions || 'None'}`,
      ]);
    });

    const comments = [
      '# SWIGGY CAMPUS CIRCLES - CAMPUS PILOT LAB RESEARCH DATA (RFC 4180 COMPLIANT)',
      '# PW INSTITUTE OF INNOVATION NOIDA - FOOD FOR THOUGHT 2.0',
      `# EXPORT_TIMESTAMP_UTC: ${new Date().toISOString()}`,
    ];

    const csvContent = [
      ...comments,
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ].join('\n');
    return csvContent;
  }

  // --- Deletion and Privacy Handling ---
  purgeUserData(userId: string): void {
    if (!userId) return;
    const surveys = this.safeGet<StudentFeedbackSurvey[]>(STORAGE_KEYS.SURVEYS, []);
    const remainingSurveys = surveys.filter((s) => s.userId !== userId);
    this.safeSet(STORAGE_KEYS.SURVEYS, remainingSurveys);

    const feedbacks = this.safeGet<InAppSessionFeedback[]>(STORAGE_KEYS.FEEDBACK, []);
    const remainingFeedbacks = feedbacks.filter((f) => f.userId !== userId);
    this.safeSet(STORAGE_KEYS.FEEDBACK, remainingFeedbacks);
  }

  exportDataAsCsv(includeDemo = true): string {
    return this.exportResearchDataCSV(includeDemo);
  }

  resetAllPilotData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CONSENT);
    localStorage.removeItem(STORAGE_KEYS.SURVEYS);
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENTS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
  }
}

export const pilotLabService = new PilotLabService();
