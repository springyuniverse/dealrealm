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
}

export interface UpdateScenarioData extends Partial<CreateScenarioData> {
  updatedAt?: Date;
}

export async function getScenarios() {
  const scenariosRef = collection(db, "scenarios");
  const q = query(scenariosRef, where("isActive", "==", true));
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

export async function getAllScenarios() {
  const scenariosRef = collection(db, "scenarios");
  const querySnapshot = await getDocs(scenariosRef);
  
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

export async function getScenarioById(id: string) {
  const scenarioRef = doc(db, "scenarios", id);
  const scenarioSnap = await getDoc(scenarioRef);
  
  if (!scenarioSnap.exists()) {
    throw new Error("Scenario not found");
  }
  
  const data = scenarioSnap.data();
  return {
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
