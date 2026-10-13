export type PaymentMode = 'per_count' | 'duration';

export type OrderStatus = 'unused' | 'in_use' | 'used' | 'refunded';

export interface GymPackage {
  id: string;
  mode: PaymentMode;
  name: string;
  subTitle: string;
  price: number;
  // For per_count:
  totalCount?: number;
  validDays: number;
  // For duration:
  durationHours?: number;
  durationDays?: number;
  durationLabel?: string;
  features: string[];
  rules: string[];
}

export interface PassageRecord {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit';
  doorATime: string;
  doorBTime: string;
  status: 'completed' | 'timeout' | 'aborted';
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeName: string;
  storeAddress: string;
  deviceName: string;
  mode: PaymentMode;
  packageId: string;
  packageName: string;
  packagePrice: number;
  paidAmount: number;
  paidAt: string;
  status: OrderStatus;
  
  // Face Registration
  faceBound: boolean;
  facePhotoUrl?: string;
  faceRegisteredAt?: string;
  faceUserName?: string;
  
  // Usage tracking
  totalCount?: number;
  remainingCount?: number;
  usedCount?: number;
  
  // Timing rules
  validUntil: string; // Absolute expiry date
  timingStartedAt?: string; // When duration clock actually started (e.g. at first B-door pass)
  durationMinutesTotal?: number;
  durationMinutesRemaining?: number;
  
  // Usage records
  records: PassageRecord[];
  
  // Refund info
  refundedAt?: string;
  refundReason?: string;
}

export type GateDoorState = 'closed' | 'opening' | 'open' | 'closing' | 'locked';

export type ChamberState = 'idle' | 'person_entered' | 'sensor_verifying' | 'alarm_tailgating' | 'clear';

export interface GateSystemState {
  doorA: GateDoorState;
  doorB: GateDoorState;
  chamber: ChamberState;
  sensorWeightOk: boolean;
  tailgatingDetected: boolean;
  lastVerifiedFaceOk: boolean;
  isSimulating: boolean;
  currentStepDescription: string;
}
