import {
  Zone, Division, Section, Corridor, Asset, MaintenanceTask, TrainMovement,
  GoodsForecast, BlockWindow, BlockRequest, MaintenanceCrew, Equipment,
  OptimizationPlan, HarvestCandidate, ReplanningEvent, Notification,
  AuditEvent, UserRole, AppState
} from './schema';

// Simple deterministic random generator
let seed = 12345;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

const DEPARTMENTS: ("Engineering" | "S&T" | "TRD")[] = ["Engineering", "S&T", "TRD"];
const CORRIDOR_NAMES = ["KOTA-ITARSI", "SWM-KOTA", "RMA-BAM", "BPL-ET", "NDLS-CNB"];
const STATION_CODES = ["KOTA", "SWM", "RMA", "BAM", "BPL", "ET", "NDLS", "CNB", "MTJ", "AGC"];

export function generateSyntheticData(): AppState {
  seed = 12345; // Reset seed for deterministic generation
  
  const zones: Zone[] = Array.from({ length: 18 }, (_, i) => ({
    id: `Z-${i + 1}`,
    name: `Zone ${i + 1}`,
    code: `ZN${i + 1}`
  }));

  const divisions: Division[] = [];
  zones.forEach(z => {
    for (let i = 0; i < randomInt(2, 4); i++) {
      divisions.push({
        id: `D-${divisions.length + 1}`,
        zoneId: z.id,
        name: `${z.name} Div ${i + 1}`,
        code: `DV${divisions.length + 1}`
      });
    }
  });

  const sections: Section[] = Array.from({ length: 45 }, (_, i) => ({
    id: `S-${i + 1}`,
    divisionId: randomChoice(divisions).id,
    name: `Section ${i + 1}`,
    startStation: randomChoice(STATION_CODES),
    endStation: randomChoice(STATION_CODES)
  }));

  const corridors: Corridor[] = Array.from({ length: 55 }, (_, i) => ({
    id: `C-${i + 1}`,
    sectionId: randomChoice(sections).id,
    name: randomChoice(CORRIDOR_NAMES),
    trafficDensity: randomChoice(["Low", "Medium", "High", "Critical"])
  }));

  const assets: Asset[] = Array.from({ length: 150 }, (_, i) => {
    const dept = randomChoice(DEPARTMENTS);
    return {
      id: `A-${i + 1}`,
      department: dept,
      type: dept === "Engineering" ? "Track" : dept === "S&T" ? "Signal" : "OHE",
      section: randomChoice(sections).id,
      kmPost: `KM-${randomInt(100, 999)}`,
      condition: randomChoice(["Excellent", "Good", "Fair", "Poor", "Critical"]),
      age: randomInt(1, 40),
      gmt: randomInt(10, 500),
      tgi: randomInt(40, 100),
      riskScore: randomInt(10, 100),
      
      // Engineering specific
      railType: dept === "Engineering" ? randomChoice(["60kg", "52kg", "90R"]) : undefined,
      usfdStatus: dept === "Engineering" ? randomChoice(["Tested", "Due", "Overdue", "Defective"]) : undefined,
      
      // TRD specific
      oheWear: dept === "TRD" ? randomInt(5, 45) / 10 : undefined,
      catenaryStatus: dept === "TRD" ? randomChoice(["Normal", "Tensioning Needed", "Worn"]) : undefined,
      isolatorState: dept === "TRD" ? randomChoice(["Closed", "Open", "Faulty"]) : undefined,
      
      // S&T specific
      pointStrokeTime: dept === "S&T" ? randomInt(4, 12) : undefined,
      trackCircuitStatus: dept === "S&T" ? randomChoice(["Clear", "Occupied", "Failed"]) : undefined,
      axleCounterStatus: dept === "S&T" ? randomChoice(["Normal", "Reset Required", "Error"]) : undefined,
      signalCondition: dept === "S&T" ? randomChoice(["Working", "LED Fused", "Communication Loss"]) : undefined,
      
      // General
      equipmentCondition: randomChoice(["Operational", "Degraded", "Failure-Prone"])
    };
  });

  const crews: MaintenanceCrew[] = Array.from({ length: 20 }, (_, i) => ({
    id: `CRW-${i + 1}`,
    department: randomChoice(DEPARTMENTS),
    name: `Gang-${i + 1}`,
    baseStation: randomChoice(STATION_CODES),
    capacity: randomInt(5, 15),
    status: randomChoice(["Available", "Busy", "Off-Duty"])
  }));

  const equipment: Equipment[] = Array.from({ length: 30 }, (_, i) => ({
    id: `EQ-${i + 1}`,
    type: randomChoice(["BCM", "Tower Wagon", "Multimeter", "Crane"]),
    location: randomChoice(STATION_CODES),
    status: randomChoice(["Operational", "Maintenance", "Breakdown"])
  }));

  const tasks: MaintenanceTask[] = Array.from({ length: 110 }, (_, i) => {
    const asset = randomChoice(assets);
    const corridor = randomChoice(corridors);
    const duration = randomInt(2, 8) * 15; // 30 to 120 mins
    const riskScore = randomInt(20, 100);
    const severity: "Low" | "Medium" | "High" | "Critical" = riskScore > 80 ? "Critical" : riskScore > 60 ? "High" : riskScore > 40 ? "Medium" : "Low";
    
    return {
      id: `TSK-${i + 1}`,
      department: asset.department,
      assetId: asset.id,
      corridorId: corridor.id,
      kmPost: asset.kmPost,
      line: randomChoice(["UP", "DN"]),
      taskType: "Routine Maintenance",
      severity: severity,
      criticality: randomInt(1, 10),
      daysOverdue: randomInt(0, 30),
      recurrence: randomChoice(["Weekly", "Monthly", "Yearly", "None"]),
      inspectionGap: randomInt(5, 30),
      trafficDensity: corridor.trafficDensity,
      riskScore: riskScore,
      urgencyScore: riskScore + randomInt(-10, 10),
      durationMinutes: duration,
      crewRequired: randomChoice(crews).id,
      equipmentRequired: [randomChoice(equipment).id],
      dueDate: "2026-09-30",
      status: "PENDING",
      harvestable: randomChoice([true, false]),
      
      // Legacy compatibility
      title: `${asset.department} Maint at ${asset.kmPost}`,
      duration: duration,
      risk: severity,
      asset: asset.id,
      corridor: corridor.name,
      category: "Routine",
      description: "Auto-generated synthetic task",
      crew: randomChoice(crews).name,
      equipment: randomChoice(["Tower Wagon", "BCM", "Multimeter", "Crane", "Hand Tools"]),
      windows: "Flexible"
    };
  });

  const trainMovements: TrainMovement[] = Array.from({ length: 120 }, (_, i) => ({
    id: `TM-${i + 1}`,
    trainNumber: `${randomInt(10000, 99999)}`,
    category: randomChoice(["Premium", "Mail/Express", "Passenger", "Goods"]),
    corridor: randomChoice(corridors).id,
    arrival: "10:00",
    departure: "10:05",
    priority: randomInt(1, 5),
    isPassenger: randomChoice([true, false]),
    isGoods: randomChoice([true, false]),
    delaySensitivity: randomChoice(["Low", "Medium", "High", "Critical"])
  }));

  const goodsForecasts: GoodsForecast[] = [];
  const blockRequests: BlockRequest[] = Array.from({ length: 5 }, (_, i) => ({
    id: `REQ-2026-${randomInt(100, 999)}`,
    department: randomChoice(DEPARTMENTS) as "Engineering" | "S&T" | "TRD",
    corridor: randomChoice(["KOTA-ITARSI", "JAIPUR-KOTA", "AJMER-JAIPUR", "BHARATPUR-ITARSI"]),
    section: `Section ${randomInt(1, 10)}`,
    taskIds: [`T-${randomInt(100, 999)}`, `T-${randomInt(100, 999)}`],
    requestedDuration: randomChoice([120, 180, 240]),
    preferredWindow: "Night (00:00 - 05:00)",
    reason: "Urgent overdue track maintenance",
    priority: randomChoice(["Critical", "High", "Medium", "Low"]),
    status: randomChoice(["SUBMITTED", "UNDER REVIEW", "PROPOSED", "REJECTED"]),
    submittedBy: "SSE/PWay",
    submittedAt: "2026-09-27T08:00:00Z",
    history: []
  }));
  const optimizationPlans: OptimizationPlan[] = [];
  const harvestCandidates: HarvestCandidate[] = [];
  const replanningEvents: ReplanningEvent[] = [];
  const notifications: Notification[] = [
    {
      id: "NOTIF-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      severity: "High",
      title: "BLOCK CONFLICT",
      message: "Proposed block overlaps with Vande Bharat express.",
      read: false,
      relatedEntity: "Block B-101"
    },
    {
      id: "NOTIF-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      severity: "Medium",
      title: "HARVEST OPPORTUNITY",
      message: "3 tasks can be harvested into Block B-98.",
      read: true,
      relatedEntity: "Block B-98"
    }
  ];
  
  const blockWindows: BlockWindow[] = Array.from({ length: 35 }, (_, i) => ({
    id: `BW-${i + 1}`,
    corridor: randomChoice(corridors).name,
    date: "2026-09-28",
    start: "02:00",
    end: "05:00",
    maxDuration: 180,
    trafficIntensity: randomChoice(["Low", "Medium", "High"]),
    availability: randomChoice(["Available", "Partial", "Blocked"])
  }));

  const userRoles: UserRole[] = [
    { id: "R-1", name: "Admin", permissions: ["ALL"] },
    { id: "R-2", name: "Control Officer", permissions: ["VIEW", "APPROVE", "REPLAN"] }
  ];

  const auditLogs: AuditEvent[] = [
    {
      id: "A-1",
      timestamp: "2026-09-26 16:24:12",
      event: "Task harvested",
      entity: "SYSTEM",
      previousState: "-",
      newState: "Plan #205",
      reason: "Detected 32m spare capacity",
      user: "SYSTEM (AI)"
    }
  ];

  return {
    zones,
    divisions,
    sections,
    corridors,
    assets,
    tasks,
    trainMovements,
    goodsForecasts,
    blockWindows,
    blockRequests,
    crews,
    equipment,
    optimizationPlans,
    harvestCandidates,
    replanningEvents,
    notifications,
    auditLogs,
    userRoles,
    blocks: [],
    selectedTasksForPlanning: [],
    currentOptimizationResult: null
  };
}
