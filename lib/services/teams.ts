import { db } from "@/lib/firebase/init";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { Team, Group, TeamMember } from "@/types";

// Team Operations
export async function createTeam(name: string, ownerId: string): Promise<Team> {
  const teamsRef = collection(db, "teams");
  const teamDoc = await addDoc(teamsRef, {
    name,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Add owner as team member
  const teamMembersRef = collection(db, "teamMembers");
  await addDoc(teamMembersRef, {
    userId: ownerId,
    teamId: teamDoc.id,
    role: "owner",
    groupIds: [],
    joinedAt: serverTimestamp()
  });

  return {
    id: teamDoc.id,
    name,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function getTeam(teamId: string): Promise<Team> {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  
  if (!teamSnap.exists()) {
    throw new Error("Team not found");
  }
  
  const data = teamSnap.data();
  return {
    id: teamSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Team;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(teamMembersRef, where("userId", "==", userId));
  const membershipSnap = await getDocs(q);
  
  const teams: Team[] = [];
  for (const memberDoc of membershipSnap.docs) {
    const teamId = memberDoc.data().teamId;
    const team = await getTeam(teamId);
    teams.push(team);
  }
  
  return teams;
}

// Group Operations
export async function createGroup(teamId: string, name: string, description: string): Promise<Group> {
  const groupsRef = collection(db, "groups");
  const groupDoc = await addDoc(groupsRef, {
    teamId,
    name,
    description,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return {
    id: groupDoc.id,
    teamId,
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function getTeamGroups(teamId: string): Promise<Group[]> {
  const groupsRef = collection(db, "groups");
  const q = query(groupsRef, where("teamId", "==", teamId));
  const groupsSnap = await getDocs(q);
  
  return groupsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Group[];
}

// Team Member Operations
export async function addTeamMember(teamId: string, userId: string, role: "admin" | "member" = "member"): Promise<TeamMember> {
  const teamMembersRef = collection(db, "teamMembers");
  const memberDoc = await addDoc(teamMembersRef, {
    userId,
    teamId,
    role,
    groupIds: [],
    joinedAt: serverTimestamp()
  });

  return {
    userId,
    teamId,
    role,
    groupIds: [],
    joinedAt: new Date()
  };
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(teamMembersRef, where("teamId", "==", teamId));
  const membersSnap = await getDocs(q);
  
  return membersSnap.docs.map(doc => ({
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate(),
  })) as TeamMember[];
}

export async function getUserTeamMemberships(userId: string): Promise<TeamMember[]> {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(teamMembersRef, where("userId", "==", userId));
  const membersSnap = await getDocs(q);
  
  return membersSnap.docs.map(doc => ({
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate(),
  })) as TeamMember[];
}

export async function updateTeamMemberGroups(teamId: string, userId: string, groupIds: string[]): Promise<void> {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(
    teamMembersRef, 
    where("teamId", "==", teamId),
    where("userId", "==", userId)
  );
  const memberSnap = await getDocs(q);
  
  if (memberSnap.empty) {
    throw new Error("Team member not found");
  }
  
  const memberDoc = memberSnap.docs[0];
  await updateDoc(memberDoc.ref, {
    groupIds,
    updatedAt: serverTimestamp()
  });
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: "admin" | "member"): Promise<void> {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(
    teamMembersRef, 
    where("teamId", "==", teamId),
    where("userId", "==", userId)
  );
  const memberSnap = await getDocs(q);
  
  if (memberSnap.empty) {
    throw new Error("Team member not found");
  }
  
  const memberDoc = memberSnap.docs[0];
  await updateDoc(memberDoc.ref, {
    role,
    updatedAt: serverTimestamp()
  });
}
