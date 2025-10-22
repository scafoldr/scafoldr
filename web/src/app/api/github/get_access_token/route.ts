import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const access_token = cookies().get('access_token');
  if (access_token) return NextResponse.json({ access_token: access_token });
  else return NextResponse.json({ isAuthorized: null });
}
