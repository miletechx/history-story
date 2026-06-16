import { pgTable, serial, timestamp, text, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 博客文章表
export const blogPosts = pgTable(
	"blog_posts",
	{
		id: serial().primaryKey(),
		title: text("title").notNull(),
		summary: text("summary").notNull(),
		content: text("content").notNull(),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("blog_posts_created_at_idx").on(table.created_at),
	]
);

// 用户表
export const users = pgTable(
	"users",
	{
		id: serial().primaryKey(),
		username: text("username").notNull().unique(),
		password: text("password").notNull(), // bcrypt哈希加密存储
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("users_username_idx").on(table.username),
	]
);

// 已生成故事缓存表
export const generatedStories = pgTable(
	"generated_stories",
	{
		id: serial().primaryKey(),
		story_id: text("story_id").notNull().unique(),
		query: text("query").notNull(),
		age_group: text("age_group").notNull(),
		content: text("content").notNull(),
		audio_url: text("audio_url"),
		image_data: text("image_data"),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("generated_stories_story_id_idx").on(table.story_id),
		index("generated_stories_query_age_idx").on(table.query, table.age_group),
	]
);

// 播放记录表
export const storyRecords = pgTable(
	"story_records",
	{
		id: serial().primaryKey(),
		user_id: serial("user_id").notNull(), // 关联users表
		story_name: text("story_name").notNull(), // 故事名称
		story_id: text("story_id").notNull(), // 故事ID（用于唯一标识故事，相同故事名称+年龄段使用同一ID）
		duration: text("duration").notNull(), // 播放时长记录（格式：XX分XX秒）
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("story_records_user_id_idx").on(table.user_id),
		index("story_records_story_id_idx").on(table.story_id), // 添加story_id索引，便于统计
		index("story_records_created_at_idx").on(table.created_at),
	]
);
