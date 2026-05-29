import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import {
	createTag,
	deleteTag,
	getAllTags,
	getTagById,
	updateTag,
} from '../controllers/tagController.ts';
import { validateBody, validateParams } from '../middleware/validation.ts';
import { insertTagSchema } from '../db/schema.ts';
import z from 'zod';

const router = Router();

const updateTagSchema = z.object({
	name: z.string().min(1).max(50).optional(),
});

const uuidSchema = z.object({
	id: z.string().uuid('Invalid tag ID format'),
});

router.use(authenticateToken);

router.get('/', getAllTags);
router.post('/', validateBody(insertTagSchema), createTag);
router.get('/:id', validateParams(uuidSchema), getTagById);
router.put(
	'/:id',
	validateParams(uuidSchema),
	validateBody(updateTagSchema),
	updateTag,
);
router.delete('/:id', validateParams(uuidSchema), deleteTag);

export default router;
