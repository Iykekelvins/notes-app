import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import {
	createNote,
	deleteNote,
	getUserNotes,
	updateNote,
} from '../controllers/noteController.ts';
import { validateBody, validateParams } from '../middleware/validation.ts';
import z from 'zod';

const router = Router();

const createNoteSchema = z.object({
	title: z.string().min(1, 'Note title is required').max(255, 'Name too long'),
	body: z.string().min(1, 'Note body is required'),
	tagIds: z.array(z.string().uuid()).optional(),
});

const updateNoteSchema = z.object({
	title: z.string().min(1).max(255, 'Name too long').optional(),
	body: z.string().min(1).optional(),
	tagIds: z.array(z.string().uuid()).optional(),
});

const uuidSchema = z.object({
	id: z.string().uuid('Invalid habit ID format'),
});

router.use(authenticateToken);

router.get('/', getUserNotes);
router.post('/', validateBody(createNoteSchema), createNote);
router.put(
	'/:id',
	validateParams(uuidSchema),
	validateBody(updateNoteSchema),
	updateNote,
);
router.delete('/:id', validateParams(uuidSchema), deleteNote);

export default router;
