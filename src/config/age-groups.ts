import type { AgeGroup } from '@/types/age';

export const AGE_GROUPS: AgeGroup[] = ['3-6', '7-12', '13-17', '18+'];

export const AGE_GROUP_CONFIG: Record<
  AgeGroup,
  { name: string; style: string; depth: string }
> = {
  '3-6': {
    name: '学龄前儿童',
    style: '重趣味和画面感，语言简单生动',
    depth: '基础认知，以故事情节为主',
  },
  '7-12': {
    name: '小学生',
    style: '有趣味性，加入历史知识点',
    depth: '初步理解历史脉络，培养兴趣',
  },
  '13-17': {
    name: '中学生',
    style: '逻辑清晰，有一定深度',
    depth: '理解因果关系，培养历史思维',
  },
  '18+': {
    name: '成年人',
    style: '深度分析，多角度解读',
    depth: '深入理解历史背景和影响',
  },
};
