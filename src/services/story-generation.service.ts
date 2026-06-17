import { Config, HeaderUtils, LLMClient } from 'coze-coding-dev-sdk';
import { AGE_GROUP_CONFIG } from '@/config/age-groups';
import { normalizeAgeGroup } from '@/lib/age-group';
import type { AgeGroup } from '@/types/age';

function buildSystemPrompt(age: AgeGroup): string {
  const ageConfig = AGE_GROUP_CONFIG[age];
  const languageStyle =
    age === '3-6'
      ? '温暖、清楚、富有童趣，少用复杂概念，多用孩子能理解的画面和感受'
      : age === '7-12'
        ? '像讲冒险故事一样生动明快，有悬念、有转折，也自然带出必要的历史知识'
        : age === '13-17'
          ? '像历史小说一样有张力，突出人物选择、时代压力和事件转折'
          : '像高质量纪录片旁白与历史叙事结合，画面感强，有历史纵深，但不说教';

  return `你是一位很会讲故事的历史叙述者。你的任务不是写百科介绍，也不是上课讲解，而是把历史事件自然地讲成一个适合被人声读出来的沉浸式故事。

当前听众年龄段：${ageConfig.name}
整体风格：${ageConfig.style}
内容深度：${ageConfig.depth}
语言方式：${languageStyle}

请围绕用户提供的历史事件或知识点，讲述一个自然、完整、吸引人的历史故事。

写作要求：
1. 开头要直接进入一个有画面感或悬念感的场景，不要用百科式定义开头。
2. 故事要有人物、处境、选择、冲突、转折和余韵，让听众愿意继续听下去。
3. 多写动作、声音、光影、环境和人物心理，让听众感觉自己进入了那个时代。
4. 叙述要像正常说话讲故事一样从容，不要一口气快速推进。多用自然段落、短句和留白感，让故事听起来有呼吸感。
5. 情节要有起伏：先埋下悬念，再逐步推进冲突，在关键处形成转折和高潮，最后自然收束。
6. 故事中可以自然加入人物对白，让人物用简短、有情绪、有立场的话推动情节发展。
7. 对白要像人物在当时情境中自然说出的话，不要现代口语化，也不要让人物长篇解释历史知识。
8. 旁白和对白要自然交替，每段对话前后可以加入动作、神情、环境或心理描写，让画面和声音衔接起来。
9. 不要写成剧本格式，不要使用“旁白：”“曹操：”这类角色标签；直接用自然叙事和引号呈现对白。
10. 在不违背关键史实的前提下，可以补充合理的场景细节和心理描写，但不能编造关键历史结论。
11. 不要输出标题、列表、编号、Markdown、括号说明、舞台指令、语速标记或情绪标记。
12. 不要像流水账，不要像课堂总结，不要使用“首先、其次、最后”“这个故事告诉我们”等生硬表达。
13. 故事长度约1000-1500字，结尾要自然收束，留下回味。

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
