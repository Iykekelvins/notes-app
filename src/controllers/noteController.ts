import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { notes, noteTags } from '../db/schema.ts';
import { and, desc, eq } from 'drizzle-orm';
import db from '../db/connection.ts';

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { title, body, tagIds } = req.body;
		const userId = req.user!.id;

		// Start a transaction to keep notes and tags in sync
		const result = await db.transaction(async (txn) => {
			const [newNote] = await txn
				.insert(notes)
				.values({
					userId,
					title,
					body,
				})
				.returning();

			// If tags are provided
			if (tagIds && tagIds.length > 0) {
				const noteTagValues = tagIds.map((tagId: string) => ({
					noteId: newNote.id,
					tagId,
				}));
				await txn.insert(noteTags).values(noteTagValues);
			}

			return newNote;
		});

		res.status(201).json({
			message: 'Note created successfully',
			note: result,
		});
	} catch (error) {
		console.error('Create note error:', error);
		res.status(500).json({ error: 'Failed to create note' });
	}
};

export const getUserNotes = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user!.id;

		// Get user notes with their tags
		const userNotesWithTags = await db.query.notes.findMany({
			where: eq(notes.userId, userId),
			with: {
				noteTags: {
					with: {
						tag: true,
					},
				},
			},
			orderBy: [desc(notes.createdAt)],
		});

		// Transform data to include tags
		const notesWithTags = userNotesWithTags.map((note) => ({
			...note,
			tags: note.noteTags.map((nt) => nt.tag),
			noteTags: undefined,
		}));

		res.json({
			notes: notesWithTags,
		});
	} catch (error) {
		console.error('Fetch notes error:', error);
		res.status(500).json({ error: 'Failed to fetch notes' });
	}
};

export const getNoteById = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user!.id;

		const note = await db.query.notes.findFirst({
			where: and(eq(notes.id, id.toString()), eq(notes.userId, userId)),
			with: {
				noteTags: {
					with: {
						tag: true,
					},
				},
			},
		});

		if (!note) {
			return res.status(404).json({ error: 'Note not found' });
		}

		const noteWithTags = {
			...note,
			tags: note.noteTags.map((nt) => nt.tag),
			noteTags: undefined,
		};

		res.json({
			note: noteWithTags,
		});
	} catch (error) {
		console.error('Fetch note error:', error);
		res.status(500).json({ error: 'Failed to fetch note' });
	}
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user!.id;
		const { tagIds, ...fields } = req.body;

		const result = await db.transaction(async (txn) => {
			const [updatedNote] = await txn
				.update(notes)
				.set({ ...fields, updatedAt: new Date() })
				.where(and(eq(notes.id, id.toString()), eq(notes.userId, userId)))
				.returning();

			if (!updatedNote) {
				return res.status(404).json({ error: 'Note not found' });
			}

			if (tagIds !== undefined) {
				await txn.delete(noteTags).where(eq(noteTags.noteId, id.toString()));

				if (tagIds.length > 0) {
					const noteTagValues = tagIds.map((tagId: string) => ({
						noteId: id,
						tagId,
					}));
					await txn.insert(noteTags).values(noteTagValues);
				}
			}

			return updatedNote;
		});

		res.json({
			message: 'Note updated successfully',
			note: result,
		});
	} catch (error) {
		console.error('Update  error:', error);
		res.status(500).json({ error: 'Failed to update note' });
	}
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user!.id;

		const [note] = await db
			.delete(notes)
			.where(and(eq(notes.id, id.toString()), eq(notes.userId, userId)))
			.returning();

		if (!note) {
			return res.status(404).json({ error: 'Note not found' });
		}

		res.json({
			message: 'Note deleted successfully',
		});
	} catch (error) {
		console.error('Delete note error:', error);
		res.status(500).json({ error: 'Failed to delete note' });
	}
};
