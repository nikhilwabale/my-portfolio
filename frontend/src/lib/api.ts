export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: 'job' | 'freelance' | 'project' | 'other';
  turnstileToken?: string;
  companyFaxNumber?: string;
};

export type ContactResponse = {
  success: boolean;
  message: string;
  referenceId?: number;
  emailNotificationSent?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7214';
const CONTACT_CLIENT_KEY = process.env.NEXT_PUBLIC_CONTACT_CLIENT_KEY || 'portfolio-web-client';

export async function submitContact(payload: ContactPayload): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Portfolio-Client': CONTACT_CLIENT_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => null)) as ContactResponse | null;

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to send message. Please try again.');
  }

  return data ?? { success: true, message: 'Message sent successfully.' };
}
