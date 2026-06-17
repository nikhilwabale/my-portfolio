export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
  turnstileToken?: string;
  website?: string;
};

export type ContactApiResponse = {
  success: boolean;
  message: string;
};

const API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL ?? 'http://localhost:7000/api/contact';

export async function sendContactMessage(payload: ContactPayload): Promise<ContactApiResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data: ContactApiResponse | null = null;
  try {
    data = (await response.json()) as ContactApiResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to submit your message. Please try again.');
  }

  return data ?? { success: true, message: 'Message submitted successfully.' };
}
