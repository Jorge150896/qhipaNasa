import { HttpTumiConversation } from '@/data/assistant/HttpTumiConversation';
import { LocalTumiConversation } from '@/data/assistant/LocalTumiConversation';

const configuredOrigin = process.env.NEXT_PUBLIC_TUMI_API_URL?.trim();
const localMode =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TUMI_LOCAL === 'true';
const apiOrigin = localMode
  ? 'http://127.0.0.1:8080'
  : configuredOrigin?.startsWith('https://')
    ? configuredOrigin
    : undefined;

export const tumiUsesOpenAi = Boolean(apiOrigin);

export const tumiConversation = apiOrigin
  ? new HttpTumiConversation(apiOrigin)
  : new LocalTumiConversation();
