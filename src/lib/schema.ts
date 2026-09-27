export type TaskStatus = "PENDING" | "SELECTED" | "SCHEDULED" | "HARVESTED" | "APPROVED" | "COMPLETED" | "DEFERRED";
export type BlockStatus = "DRAFT" | "PROPOSED" | "OPTIMIZED" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "COMPLETED" | "REPLANNED" | "REJECTED";

export interface Zone {
  id: string;
  name: string;
  code: string;
}

export interface Division {
  id: string;
  zoneId: string;
  name: string;
  code: string;
}

export interface Section {
  id: string;
  divisionId: string;
  name: string;
  startStation: string;
  endStation: string;
}

export interface Corridor {
  id: string;
  sectionId: string;
  name: string;
  trafficDensity: "Low" | "Medium" | "High" | "Critical";
}

export interface Asset {
  id: string;
  department: "Engineering" | "S&T" | "TRD";
  type: string;
  section: string;
  kmPost: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  age: number;
  gmt: number;
  tgi: number;
  usfdStatus?: string;
  railType?: string;
  oheWear?: number;
  catenaryStatus?: string;
  isolatorState?: string;
  pointStrokeTime?: number;
  trackCircuitStatus?: string;
  axleCounterStatus?: string;
  signalCondition?: string;
  equipmentCondition?: string;
  riskScore: number;
}

export type BlockRequestStatus = "DRAFT" | "SUBMITTED" | "UNDER REVIEW" | "PROPOSED" | "APPROVED" | "REJECTED" | "OVERRIDDEN" | "CANCELLED";

export interface BlockRequest {
  id: string;
  department: "Engineering" | "S&T" | "TRD";
  corridor: string;
  section: string;
  taskIds: string[];
  requestedDuration: number;
  preferredWindow: string;
  reason: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: BlockRequestStatus;
  submittedBy: string;
  submittedAt: string;
  history: {
    action: string;
    status: BlockRequestStatus;
    by: string;
    timestamp: string;
    reason?: string;
  }[];
}

export interface MaintenanceTask {
  id: string;
  department: "Engineering" | "S&T" | "TRD";
  assetId: string;
  corridorId: string;
  kmPost: string;
  line: string;
  taskType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  criticality: number;
  daysOverdue: number;
  recurrence: string;
  inspectionGap: number;
  trafficDensity: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  urgencyScore: number;
  durationMinutes: number;
  crewRequired: string;
  equipmentRequired: string[];
  dueDate: string;
  status: TaskStatus;
  harvestable: boolean;

  // Legacy mappings for existing components to prevent breaking
  title: string;
  duration: number;
  risk: string;
  compatibilityScore?: number;
  asset: string;
  corridor: string;
  category: string;
  crew: string;
  description: string;
  equipment: string;
  windows: string;
}

export interface TrainMovement {
  id: string;
  trainNumber: string;
  category: "Premium" | "Mail/Express" | "Passenger" | "Goods";
  corridor: string;
  arrival: string;
  departure: string;
  priority: number;
  isPassenger: boolean;
  isGoods: boolean;
  delaySensitivity: "Low" | "Medium" | "High" | "Critical";
}

export interface GoodsForecast {
  id: string;
  date: string;
  corridor: string;
  expectedRakes: number;
  coalPriority: boolean;
}

export interface BlockWindow {
  id: string;
  corridor: string;
  date: string;
  start: string;
  end: string;
  maxDuration: number;
  trafficIntensity: "Low" | "Medium" | "High";
  availability: "Available" | "Partial" | "Blocked";
  reason?: string;
}


export interface MaintenanceCrew {
  id: string;
  department: "Engineering" | "S&T" | "TRD";
  name: string;
  baseStation: string;
  capacity: number;
  status: "Available" | "Busy" | "Off-Duty";
}

export interface Equipment {
  id: string;
  type: string;
  location: string;
  status: "Operational" | "Maintenance" | "Breakdown";
}

export interface OptimizationPlan {
  id: string;
  corridorId: string;
  date: string;
  score: number;
  blocks: string[]; // Block IDs
}

export interface HarvestCandidate {
  taskId: string;
  blockId: string;
  compatibilityScore: number;
  timeSavings: number;
}

export interface ReplanningEvent {
  id: string;
  timestamp: string;
  triggerEvent: string;
  affectedBlocks: string[];
  resolutionStatus: "Pending" | "Resolved";
}

export type NotificationType = 
  | "URGENT MAINTENANCE" 
  | "BLOCK APPROVED" 
  | "BLOCK REJECTED" 
  | "BLOCK CONFLICT" 
  | "TRAIN CONFLICT" 
  | "HARVEST OPPORTUNITY" 
  | "RESOURCE CONFLICT" 
  | "EMERGENCY EVENT" 
  | "PLAN REPLANNED" 
  | "TASK OVERDUE" 
  | "PLAN STARTING SOON"
  | "TASKS QUEUED";

export interface Notification {
  id: string;
  timestamp: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: NotificationType;
  message: string;
  read: boolean;
  relatedEntity: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event: string;
  entity: string;
  previousState: string;
  newState: string;
  reason: string;
  user: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface Block {
  id: string;
  corridor: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  departments: string[];
  tasks: string[]; 
  harvestedTasks: string[];
  trainImpact: string;
  riskCoverage: string;
  utilization: number;
  remainingCapacity?: number;
  status: BlockStatus;
  reason?: string;
}

export interface AppState {
  zones: Zone[];
  divisions: Division[];
  sections: Section[];
  corridors: Corridor[];
  assets: Asset[];
  tasks: MaintenanceTask[];
  trainMovements: TrainMovement[];
  goodsForecasts: GoodsForecast[];
  blockWindows: BlockWindow[];
  blockRequests: BlockRequest[];
  crews: MaintenanceCrew[];
  equipment: Equipment[];
  optimizationPlans: OptimizationPlan[];
  harvestCandidates: HarvestCandidate[];
  replanningEvents: ReplanningEvent[];
  notifications: Notification[];
  auditLogs: AuditEvent[];
  userRoles: UserRole[];
  blocks: Block[];
  selectedTasksForPlanning: string[];
  currentOptimizationResult: Block | null;
  currentUserRole: string; // Add current user role for RBAC
}
