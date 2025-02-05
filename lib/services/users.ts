import { db } from "@/lib/firebase/init";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { User, TeamMember } from "@/types";

export async function getUsers(teamId?: string) {
  if (teamId) {
    // Get users for a specific team
    const teamMembersRef = collection(db, "teamMembers");
    const q = query(teamMembersRef, where("teamId", "==", teamId));
    const membershipSnap = await getDocs(q);
    
    const users: User[] = [];
    for (const memberDoc of membershipSnap.docs) {
      const userId = memberDoc.data().userId;
      try {
        const user = await getUserById(userId);
        users.push(user);
      } catch (error) {
        console.error(`Failed to get user ${userId}:`, error);
      }
    }
    return users;
  } else {
    // Get all users
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastActive: doc.data().lastActive?.toDate(),
    })) as User[];
  }
}

export async function getUserById(id: string, teamId?: string) {
  const userRef = doc(db, "users", id);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error("User not found");
  }
  
  const data = userSnap.data();
  const user = {
    id: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    lastActive: data.lastActive?.toDate(),
  } as User;

  if (teamId) {
    // Get team-specific role if teamId is provided
    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef, 
      where("teamId", "==", teamId),
      where("userId", "==", id)
    );
    const memberSnap = await getDocs(q);
    
    if (!memberSnap.empty) {
      const memberData = memberSnap.docs[0].data() as TeamMember;
      return {
        ...user,
        teamRole: memberData.role,
        groupIds: memberData.groupIds
      };
    }
  }
  
  return user;
}

export async function updateUser(id: string, data: Partial<User>) {
  const userRef = doc(db, "users", id);
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getTeamAdmins(teamId: string) {
  const teamMembersRef = collection(db, "teamMembers");
  const q = query(
    teamMembersRef, 
    where("teamId", "==", teamId),
    where("role", "in", ["owner", "admin"])
  );
  const membershipSnap = await getDocs(q);
  
  const admins: User[] = [];
  for (const memberDoc of membershipSnap.docs) {
    const userId = memberDoc.data().userId;
    try {
      const user = await getUserById(userId);
      admins.push(user);
    } catch (error) {
      console.error(`Failed to get admin ${userId}:`, error);
    }
  }
  return admins;
}
