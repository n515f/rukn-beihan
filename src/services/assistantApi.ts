import { apiRequest } from './api';
import type { Message } from './messagesApi';

export type AskAssistantResponse = {
  success?: boolean;
  conversation_id?: string;
  message?: Message;
  error?: string;
};

export async function askAssistant(input: {
  user_id?: number;
  language?: 'ar' | 'en';
  question: string;
  conversation_id?: string;
}): Promise<AskAssistantResponse> {
  const body = {
    user_id: input.user_id ?? undefined,
    language: input.language ?? 'ar',
    question: input.question,
    conversation_id: input.conversation_id ?? undefined,
  };
  return apiRequest<AskAssistantResponse>('/assistant/ask.php', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
