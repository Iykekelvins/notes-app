import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { tags, noteTags } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import db from '../db/connection.ts';

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { name } = req.body;

		// Check if tag already exists
		const existingTag = await db.query.tags.findFirst({
			where: eq(tags.name, name),
		});

		if (existingTag) {
			res.status(409).json({ error: 'Tag with this name already exists' });
		}

		const [newTag] = await db
			.insert(tags)
			.values({
				name,
			})
			.returning();

		res.status(201).json({
			message: 'Tag created successfully',
			tag: newTag,
		});
	} catch (error) {
		console.error('Create tag error:', error);
		res.status(500).json({ error: 'Failed to create tag' });
	}
};

export const getAllTags = async (req: Request, res: Response) => {
	try {
		const dbTags = await db.select().from(tags).orderBy(tags.name);

		res.json({
			tags: dbTags,
		});
	} catch (error) {
		console.error('Fetch tags error:', error);
		res.status(500).json({ error: 'Failed to fetch tags' });
	}
};

export const getTagById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const tag = await db.query.tags.findFirst({
			where: eq(tags.id, id.toString()),
			with: {
				noteTags: {
					with: {
						note: {
							columns: {
								id: true,
								title: true,
								body: true,
							},
						},
					},
				},
			},
		});

		if (!tag) {
			res.status(404).json({ error: 'Tag not found' });
		}

		// Transform the data
		const tagWithNotes = {
			...tag,
			notes: tag?.noteTags.map((t) => t.note),
			noteTags: undefined,
		};

		res.json({
			tag: tagWithNotes,
		});
	} catch (error) {
		console.error('Fetch tag error:', error);
		res.status(500).json({ error: 'Failed to fetch tag' });
	}
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		if (name) {
			const existingTag = await db.query.tags.findFirst({
				where: eq(tags.name, name),
			});

			if (existingTag && existingTag.id !== id) {
				return res.status(409).json({ error: 'Tag with this name already exists' });
			}
		}

		const [updatedTag] = await db
			.update(tags)
			.set({
				...(name && { name }),
				updatedAt: new Date(),
			})
			.where(eq(tags.id, id.toString()))
			.returning();

		if (!updatedTag) {
			return res.status(404).json({ error: 'Tag not found' });
		}

		res.json({
			message: 'Tag updated successfully',
			tag: updatedTag,
		});
	} catch (error) {
		console.error('Update tag error:', error);
		res.status(500).json({ error: 'Failed to update tag' });
	}
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;

		// Check if tag is being used
		const tagUsage = await db
			.select()
			.from(noteTags)
			.where(eq(noteTags.tagId, id.toString()))
			.limit(1);

		if (tagUsage.length > 0) {
			return res.status(409).json({
				error: 'Cannot delete tag that is currently in use',
				message: 'Remove this tag from all notes before deleting',
			});
		}

		const [tag] = await db
			.delete(tags)
			.where(eq(tags.id, id.toString()))
			.returning();

		if (!tag) {
			return res.status(404).json({ error: 'Tag not found' });
		}

		res.json({
			message: 'Tag deleted successfully',
		});
	} catch (error) {
		console.error('Delete tag error:', error);
		res.status(500).json({ error: 'Failed to delete tag' });
	}
};
