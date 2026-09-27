import { MaintenanceTask, Asset, Block } from './schema';

export type Factor = {
  label: string;
  value: number;
};

export type IntelligenceResult = {
  priorityScore: number;
  riskScore: number;
  urgencyTier: "Critical" | "High" | "Medium" | "Low";
  factors: Factor[];
};

export type Anomaly = {
  id: string;
  type: string;
  corridorId: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  affectedTasks: number;
};

// Deterministic multiplier based on category
const getMultiplier = (val: string) => {
  if (val === "Critical") return 4;
  if (val === "High") return 3;
  if (val === "Medium") return 2;
  return 1;
};

export function calculateRisk(task: MaintenanceTask): number {
  const safeCriticality = task.criticality ?? 5;
  const safeRecurrence = task.recurrence ?? "None";
  const safeTraffic = task.trafficDensity ?? "Medium";
  const safeSeverity = task.severity ?? "Medium";

  // Simple deterministic risk calculation
  let baseRisk = safeCriticality * 5; // max 50
  if (safeRecurrence === "Weekly" || safeRecurrence === "Monthly") {
    baseRisk += 10;
  }
  const trafficMult = getMultiplier(safeTraffic) * 5; // max 20
  const severityMult = getMultiplier(safeSeverity) * 5; // max 20
  
  return Math.min(100, Math.round(baseRisk + trafficMult + severityMult));
}

export function calculatePriority(task: MaintenanceTask): IntelligenceResult {
  const factors: Factor[] = [];
  
  const safeCriticality = task.criticality ?? 5;
  const safeOverdue = task.daysOverdue ?? 0;
  const safeTraffic = task.trafficDensity ?? "Medium";
  const safeRecurrence = task.recurrence ?? "None";
  const safeGap = task.inspectionGap ?? 0;

  const criticalityScore = safeCriticality * 4; // up to 40
  factors.push({ label: "Criticality", value: criticalityScore });
  
  const overdueScore = Math.min(30, safeOverdue * 2); // up to 30
  if (overdueScore > 0) {
    factors.push({ label: "Overdue", value: overdueScore });
  }

  const trafficScore = getMultiplier(safeTraffic) * 5; // up to 20
  factors.push({ label: "Traffic Density", value: trafficScore });

  const recurrenceScore = safeRecurrence !== "None" ? 10 : 0;
  if (recurrenceScore > 0) {
    factors.push({ label: "Defect Recurrence", value: recurrenceScore });
  }

  const inspectionGapScore = Math.min(15, safeGap);
  if (inspectionGapScore > 0) {
    factors.push({ label: "Inspection Gap", value: inspectionGapScore });
  }
  
  let totalScore = factors.reduce((acc, curr) => acc + curr.value, 0);
  totalScore = Math.min(100, totalScore);

  let urgencyTier: "Critical" | "High" | "Medium" | "Low" = "Low";
  if (totalScore >= 80) urgencyTier = "Critical";
  else if (totalScore >= 60) urgencyTier = "High";
  else if (totalScore >= 40) urgencyTier = "Medium";

  return {
    priorityScore: totalScore,
    riskScore: calculateRisk(task),
    urgencyTier,
    factors: factors.sort((a, b) => b.value - a.value)
  };
}

export function detectAnomalies(tasks: MaintenanceTask[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  // Group tasks by corridor to detect clustering
  const corridorMap = new Map<string, number>();
  tasks.forEach(t => {
    if (t.status === "PENDING" || t.status === "SELECTED") {
      corridorMap.set(t.corridorId, (corridorMap.get(t.corridorId) || 0) + 1);
    }
  });

  let anomalyId = 1;
  corridorMap.forEach((count, corridorId) => {
    if (count >= 5) {
      anomalies.push({
        id: `ANOM-${anomalyId++}`,
        type: "Defect Clustering",
        corridorId,
        description: `Unusual concentration of ${count} pending maintenance tasks. Indicates potential systemic degradation.`,
        severity: count > 8 ? "High" : "Medium",
        affectedTasks: count
      });
    }
  });

  return anomalies;
}
