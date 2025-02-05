import { db } from "@/lib/firebase/init";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from "firebase/firestore";

import { Scenario as ScenarioType } from "@/types";
export type { Scenario } from "@/types";

export interface CreateScenarioData {
  title: string;
  teamId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  timeLimit: number;
  maxQuestions: number;
  customerBackground: string;
  situation: string;
  successMetrics: {
    id: string;
    name: string;
    weight: number;
    criteria: string[];
    description: string;
    keyPhrases?: string[];
  }[];
  isActive: boolean;
  visibleToGroups: string[];
}

export interface UpdateScenarioData extends Partial<CreateScenarioData> {
  updatedAt?: Date;
}

export async function getScenarios(teamId?: string, groupIds?: string[]) {
  const scenariosRef = collection(db, "scenarios");
  let q = query(scenariosRef, where("isActive", "==", true));
  
  if (teamId) {
    q = query(q, where("teamId", "==", teamId));
  }
  
  const querySnapshot = await getDocs(q);
  const scenarios = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    description: doc.data().description,
    timeLimit: doc.data().timeLimit || 30,
    maxQuestions: doc.data().maxQuestions || 10,
    customerBackground: doc.data().customerBackground || '',
    situation: doc.data().situation || '',
    successMetrics: doc.data().successMetrics?.map((metric: any) => ({
      id: metric.id || crypto.randomUUID(),
      name: metric.name || metric,
      weight: metric.weight || 1,
      criteria: metric.criteria || [],
      description: metric.description || metric,
      keyPhrases: metric.keyPhrases || []
    })) || [],
  })) as ScenarioType[];

  // Filter by group visibility if groupIds are provided
  if (groupIds && groupIds.length > 0) {
    return scenarios.filter(scenario => 
      scenario.visibleToGroups.some(groupId => groupIds.includes(groupId))
    );
  }

  return scenarios;
}

export async function getAllScenarios(teamId?: string) {
  const scenariosRef = collection(db, "scenarios");
  let q = query(scenariosRef);
  
  if (teamId) {
    q = query(q, where("teamId", "==", teamId));
  }
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    description: doc.data().description,
    timeLimit: doc.data().timeLimit || 30,
    maxQuestions: doc.data().maxQuestions || 10,
    customerBackground: doc.data().customerBackground || '',
    situation: doc.data().situation || '',
    successMetrics: doc.data().successMetrics?.map((metric: any) => ({
      id: metric.id || crypto.randomUUID(),
      name: metric.name || metric,
      weight: metric.weight || 1,
      criteria: metric.criteria || [],
      description: metric.description || metric,
      keyPhrases: metric.keyPhrases || []
    })) || [],
  })) as ScenarioType[];
}

export async function getScenarioById(id: string, userId?: string, teamId?: string) {
  const scenarioRef = doc(db, "scenarios", id);
  const scenarioSnap = await getDoc(scenarioRef);
  
  if (!scenarioSnap.exists()) {
    throw new Error("Scenario not found");
  }
  
  const data = scenarioSnap.data();
  const scenario = {
    id: scenarioSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    description: data.description,
    timeLimit: data.timeLimit || 30,
    maxQuestions: data.maxQuestions || 10,
    customerBackground: data.customerBackground || '',
    situation: data.situation || '',
    successMetrics: data.successMetrics?.map((metric: any) => ({
      id: metric.id || crypto.randomUUID(),
      name: metric.name || metric,
      weight: metric.weight || 1,
      criteria: metric.criteria || [],
      description: metric.description || metric,
      keyPhrases: metric.keyPhrases || []
    })) || [],
  } as ScenarioType;

  // Check team access if teamId is provided
  if (teamId && scenario.teamId !== teamId) {
    throw new Error("Scenario not accessible in this team");
  }

  // Check group visibility if userId is provided
  if (userId) {
    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef, 
      where("teamId", "==", scenario.teamId),
      where("userId", "==", userId)
    );
    const memberSnap = await getDocs(q);
    
    if (!memberSnap.empty) {
      const memberData = memberSnap.docs[0].data();
      const hasAccess = scenario.visibleToGroups.some(groupId => 
        memberData.groupIds.includes(groupId)
      );
      if (!hasAccess) {
        throw new Error("User does not have access to this scenario");
      }
    } else {
      throw new Error("User is not a member of the team");
    }
  }

  return scenario;
}

export async function createScenario(data: CreateScenarioData) {
  const scenariosRef = collection(db, "scenarios");
  const now = Timestamp.now();
  
  const docRef = await addDoc(scenariosRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function updateScenario(id: string, data: UpdateScenarioData) {
  const scenarioRef = doc(db, "scenarios", id);
  
  await updateDoc(scenarioRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteScenario(id: string) {
  const scenarioRef = doc(db, "scenarios", id);
  await deleteDoc(scenarioRef);
}

export async function toggleScenarioStatus(id: string, isActive: boolean) {
  const scenarioRef = doc(db, "scenarios", id);
  
  await updateDoc(scenarioRef, {
    isActive,
    updatedAt: Timestamp.now(),
  });
}

export async function updateScenarioVisibility(id: string, groupIds: string[]) {
  const scenarioRef = doc(db, "scenarios", id);
  
  await updateDoc(scenarioRef, {
    visibleToGroups: groupIds,
    updatedAt: Timestamp.now(),
  });
}
