export type Message = {
  id: number;
  conversation_id: string;
  user_id: number | null;
  admin_id: number | null;
  sender_type: 'user' | 'admin' | 'ai';
  channel: 'support' | 'assistant';
  language?: 'ar' | 'en';
  title: string | null;
  message_text: string;
  status: 'open' | 'pending' | 'answered' | 'resolved';
  read_by_admin: boolean;
  read_by_user: boolean;
  created_at: string;
  user_name?: string | null;
  admin_name?: string | null;
};

type ApiOk = { success: boolean };

type CreateMessageResponse = ApiOk & {
  conversation_id?: string;
  message?: Message;
};

type ThreadResponse = {
  success?: boolean;
  messages?: Message[];
  notifications?: Message[];
};

import { apiRequest } from './api';

// إضافة دعم لجلب قائمة الرسائل عبر messages/list.php
export type ListMessagesParams = {
  conversation_id?: string;
  user_id?: number;
  channel?: 'support' | 'assistant';
  sender_type?: 'user' | 'admin' | 'ai';
  status?: 'open' | 'pending' | 'answered' | 'resolved';
  limit?: number;
  offset?: number;
};

type ListMessagesResponse = {
  success: boolean;
  messages: Message[];
};

export async function listMessages(params: ListMessagesParams = {}): Promise<Message[]> {
  const qs = new URLSearchParams();
  if (params.conversation_id) qs.set('conversation_id', params.conversation_id);
  if (params.user_id != null && Number.isFinite(params.user_id)) qs.set('user_id', String(params.user_id));
  if (params.channel) qs.set('channel', params.channel);
  if (params.sender_type) qs.set('sender_type', params.sender_type);
  if (params.status) qs.set('status', params.status);
  if (params.limit != null && Number.isFinite(params.limit)) qs.set('limit', String(params.limit));
  if (params.offset != null && Number.isFinite(params.offset)) qs.set('offset', String(params.offset));

  const data = await apiRequest<ListMessagesResponse>(`/messages/list.php${qs.toString() ? `?${qs.toString()}` : ''}`);
  return data.messages ?? [];
}

export async function createSupportMessage(input: {
  user_id?: number;
  language?: 'ar' | 'en';
  title?: string | null;
  message_text: string;
  conversation_id?: string;
}): Promise<CreateMessageResponse> {
  const body = {
    user_id: input.user_id ?? undefined,
    channel: 'support',
    language: input.language ?? 'ar',
    title: input.title ?? null,
    message_text: input.message_text,
    conversation_id: input.conversation_id ?? undefined,
  };
  return apiRequest<CreateMessageResponse>('/messages/create.php', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createAssistantMessage(input: {
  user_id?: number;
  language?: 'ar' | 'en';
  message_text: string;
  conversation_id?: string;
}): Promise<CreateMessageResponse> {
  const body = {
    user_id: input.user_id ?? undefined,
    channel: 'assistant',
    language: input.language ?? 'ar',
    title: null,
    message_text: input.message_text,
    conversation_id: input.conversation_id ?? undefined,
  };
  return apiRequest<CreateMessageResponse>('/messages/create.php', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getThread(conversation_id: string): Promise<ThreadResponse> {
  const qs = `conversation_id=${encodeURIComponent(conversation_id)}`;
  return apiRequest<ThreadResponse>(`/messages/get-thread.php?${qs}`);
}

export async function replyAdmin(input: {
  conversation_id: string;
  message_text: string;
  channel?: 'support' | 'assistant';
  status?: 'open' | 'pending' | 'answered' | 'resolved';
}): Promise<ApiOk> {
  const body = {
    conversation_id: input.conversation_id,
    message_text: input.message_text,
    channel: input.channel ?? 'support',
    status: input.status ?? 'open',
  };
  return apiRequest<ApiOk>('/messages/reply.php', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function markRead(input: { conversation_id: string; actor: 'admin' | 'user' }): Promise<ApiOk> {
  return apiRequest<ApiOk>('/messages/mark-read.php', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resolveConversation(conversation_id: string): Promise<ApiOk> {
  return apiRequest<ApiOk>('/messages/resolve.php', {
    method: 'POST',
    body: JSON.stringify({ conversation_id }),
  });
}
