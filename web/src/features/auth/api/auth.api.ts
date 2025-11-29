export class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

interface AuthResponse {
  email: string;
  token: string;
}
export async function sendCode(email: string): Promise<string> {
  try {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: email })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new AuthApiError(errorText || 'Send Code API error', res.status);
    }
    const data = await res.json();
    return data as string;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    throw new AuthApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}

export async function verifyCode(code: string, email: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ code: code, email: email })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new AuthApiError(errorText || 'Verify Code API error', res.status);
    }
    const data = await res.json();
    return data as AuthResponse;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    throw new AuthApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}
