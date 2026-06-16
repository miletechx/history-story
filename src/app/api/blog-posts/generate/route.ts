import { NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';

interface GenerateRequest {
	topic: string;
}

// 根据主题生成历史文章
export async function POST(request: Request) {
	try {
		const body = (await request.json()) as GenerateRequest;
		const { topic } = body;

		if (!topic) {
			return NextResponse.json({ error: '请提供文章主题' }, { status: 400 });
		}

		// 使用LLM生成文章
		const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
		const config = new Config();
		const client = new LLMClient(config, customHeaders);

		const prompt = `你是一位资深的历史学者和科普作家。请以"${topic}"为主题，写一篇深度历史文章。

要求：
1. 标题要吸引人，能概括文章核心内容
2. 内容要有深度，不能流于表面
3. 要有明确的历史脉络和逻辑结构
4. 语言要通俗易懂，可读性强
5. 字数约1500字
6. 使用Markdown格式，包含二级标题（##）分段

输出格式（严格按照以下JSON格式）：
{
  "title": "文章标题",
  "summary": "文章摘要（50-80字）",
  "content": "完整的Markdown文章内容"
}

只输出JSON，不要输出其他内容。`;

		// 使用LLM生成文章
		const response = await client.invoke(
			[
				{
					role: 'user',
					content: prompt,
				},
			],
			{
				model: 'doubao-seed-2-0-lite-260215',
				temperature: 0.7,
			}
		);

		const responseText = response.content || '';

		// 解析JSON
		let articleData;
		try {
			// 尝试从响应中提取JSON
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('无法从响应中提取JSON');
			}
			articleData = JSON.parse(jsonMatch[0]);
		} catch (parseError) {
			console.error('解析LLM响应失败:', parseError);
			return NextResponse.json(
				{ error: '生成文章格式错误，请重试' },
				{ status: 500 }
			);
		}

		// 保存到数据库
		const supabase = getSupabaseClient();
		const { data, error } = await supabase
			.from('blog_posts')
			.insert({
				title: articleData.title,
				summary: articleData.summary,
				content: articleData.content,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`保存失败: ${error.message}`);
		}

		return NextResponse.json({
			message: '文章生成成功',
			article: data,
		});
	} catch (error) {
		console.error('生成文章失败:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '生成失败' },
			{ status: 500 }
		);
	}
}
