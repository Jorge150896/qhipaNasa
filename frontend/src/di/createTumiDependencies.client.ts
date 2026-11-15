import { HttpTumiConversation } from '@/data/assistant/HttpTumiConversation';
import { LocalTumiConversation } from '@/data/assistant/LocalTumiConversation';

export const tumiUsesOpenAi =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TUMI_LOCAL === 'true';

export const tumiConversation = tumiUsesOpenAi
  ? new HttpTumiConversation()
  : new LocalTumiConversation();
