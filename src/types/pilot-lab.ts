export type OrderingFrequency = 'daily' | 'multiple_times_week' | 'once_a_week' | 'rarely';

export type BudgetRange = 'under_150' | '150_250' | '250_400' | 'above_400';

export type TimeSpentChoosing = 'under_5' | '5_15' | '15_30' | 'above_30';

export interface PilotConsent {
  id: string;
  userId: string;
  studentName: string;
  consentGiven: boolean;
  consentedAt: string;
  withdrawnAt?: string;
  studyCohort: string; // e.g. "PW IOI Noida - Batch 2026"
}

export interface StudentFeedbackSurvey {
  id: string;
  userId: string;
  studentName: string;
  orderingFrequency: OrderingFrequency;
  friendsOrderingFrequency: OrderingFrequency;
  coordinationProblems: string[];
  typicalBudgetRange: BudgetRange;
  timeSpentChoosingMins: TimeSpentChoosing;
  splittingDifficultyScore: number; // 1 (Very Easy) to 5 (Extremely Hard)
  deliveryCoordinationDifficulty: number; // 1 to 5
  willingnessToReuse: number; // 1 to 5
  mostUsefulFeature: string;
  leastUsefulFeature: string;
  writtenSuggestions?: string;
  submittedAt: string;
  isSimulatedDemo: boolean;
}

export interface InAppSessionFeedback {
  id: string;
  orderId: string;
  circleId: string;
  userId: string;
  wasFlowEasy: boolean;
  satisfactionScore: number; // 1 to 5
  confusingStep?: string;
  wouldUseAgain: boolean;
  improvementSuggestions?: string;
  submittedAt: string;
  isSimulatedDemo: boolean;
}

export interface OrderingExperimentObservation {
  id: string;
  experimentType: 'whatsapp_baseline' | 'campus_circles';
  groupName: string;
  participantCount: number;
  restaurantChoiceDurationSec: number;
  foodSelectionDurationSec: number;
  coordinationIssuesCount: number;
  completedDraftOrder: boolean;
  satisfactionRating: number; // 1 to 5
  notes?: string;
  recordedBy: 'manual_researcher' | 'automatic_telemetry';
  isSimulatedDemo: boolean;
  recordedAt: string;
}

export interface PilotLabSummary {
  totalConsentingParticipants: number;
  totalCompletedSurveys: number;
  totalPilotSessions: number;
  totalExperiments: number;
  avgDecisionTimeCampusCirclesSec: number;
  avgDecisionTimeWhatsAppSec: number;
  campusCirclesCompletionRatePct: number;
  whatsappCompletionRatePct: number;
  recommendationAcceptanceRatePct: number;
  avgSatisfactionCampusCircles: number;
  avgSatisfactionWhatsApp: number;
  avgStudentSatisfactionCampusCircles?: number;
  avgStudentSatisfactionWhatsApp?: number;
  topProblems: Array<{ problem: string; count: number; percentage: number }>;
  budgetDistribution: Record<string, number>;
  realSampleSize: number;
  observationPeriod: { start: string; end: string };
  hasSufficientData: boolean; // true if realSampleSize >= 3
  isDemoMode: boolean;
}
