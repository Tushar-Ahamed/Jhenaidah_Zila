import { listMembers } from '@/services/memberService';
import { listEvents } from '@/services/contentService';
import { ORG_INFO } from '@/data/sampleData';

export interface DynamicStat {
  label: string;
  value: number;
  suffix: string;
}

export async function fetchDynamicStats(): Promise<DynamicStat[]> {
  let memberCount = 342;
  let eventsCount = 48;
  const upazilaCount = 6;
  const yearsPassed = new Date().getFullYear() - ORG_INFO.established;

  try {
    const [membersList, eventsList] = await Promise.all([
      listMembers('approved'),
      listEvents(),
    ]);

    if (membersList && membersList.length > 0) {
      // If live member count is higher than default, use live count, else add to base
      memberCount = Math.max(membersList.length, 342 + (membersList.length - 8));
    }

    if (eventsList && eventsList.length > 0) {
      eventsCount = Math.max(eventsList.length, 48);
    }
  } catch {
    // fallback
  }

  return [
    { label: 'সদস্য সংখ্যা', value: memberCount, suffix: '+' },
    { label: 'উপজেলা শাখা', value: upazilaCount, suffix: '' },
    { label: 'আয়োজিত অনুষ্ঠান', value: eventsCount, suffix: '+' },
    { label: 'বছর অতিবাহিত', value: yearsPassed, suffix: '' },
  ];
}
