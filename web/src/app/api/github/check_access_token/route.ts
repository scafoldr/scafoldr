import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const access_token = cookies().get('access_token');
  if (access_token) return NextResponse.json({ isAuthorized: true });
  else return NextResponse.json({ isAuthorized: false });
}
