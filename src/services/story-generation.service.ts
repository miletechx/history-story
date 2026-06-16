import { Config, HeaderUtils, LLMClient } from 'coze-coding-dev-sdk';
import { AGE_GROUP_CONFIG } from '@/config/age-groups';
import { normalizeAgeGroup } from '@/lib/age-group';
import type { AgeGroup } from '@/types/age';

function buildSystemPrompt(age: AgeGroup): string {
  const ageConfig = AGE_GROUP_CONFIG[age];

  return `你是一位资深的历史故事讲述者，擅长用生动有趣的方式讲述历史故事。

当前听众年龄段：${ageConfig.name}
风格要求：${ageConfig.style}
深度要求：${ageConfig.depth}

请根据用户提供的历史事件或知识点，创作一个引人入胜的历史故事。

要求：
1. 故事开头要吸引人，快速进入情境
2. 语言要${age === '3-6' ? '简单易懂，多用比喻' : age === '7-12' ? '生动有趣，适当加入知识点' : age === '13-17' ? '逻辑清晰，有一定深度' : '深度分析，多角度解读'}
3. 故事要自然流畅地讲述，不要添加场景标记、分镜点等任何格式化提示
4. 故事长度约1000-1500字
5. 结尾要升华主题，给人以启发

注意：内容必须客观中立，不涉及政治宣传，不包含暴力、恐怖、迷信等不良内容。`;
}

export function createStoryGenerationStream(query: string, ageGroup: unknown, requestHeaders: Headers): Response {
  const age = normalizeAgeGroup(ageGroup);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const customHeaders = HeaderUtils.extractForwardHeaders(requestHeaders);
        const config = new Config();
        const client = new LLMClient(config, customHeaders);
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: buildSystemPrompt(age) },
          { role: 'user', content: `请讲述关于"${query}"的历史故事。` },
        ];

        const llmStream = client.stream(messages, {
          model: 'doubao-seed-2-0-lite-260215',
          temperature: 0.8,
        });

        for await (const chunk of llmStream) {
          if (chunk.content) {
            const text = chunk.content.toString();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('LLM生成错误:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成失败，请重试' })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
