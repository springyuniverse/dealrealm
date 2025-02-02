import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    // Verify the token
    await adminAuth.verifyIdToken(token);
    
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
