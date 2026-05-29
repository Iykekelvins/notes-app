import request from 'supertest';
import app from '../src/server.ts';
import { afterEach } from 'vitest';
import {
	createTestUser,
	createTestNote,
	cleanupDatabase,
} from './helpers/dbHelpers.ts';

describe('Notes API', () => {
	afterEach(async () => {
		await cleanupDatabase();
	});

	describe('POST /api/notes', () => {
		it('should create a new note', async () => {
			const { token } = await createTestUser();

			const response = await request(app)
				.post('/api/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'My first note',
					body: 'My first note body',
				});

			expect(response.status).toBe(201);
			expect(response.body.note).toBeDefined();
			expect(response.body.note.title).toBe('My first note');
		});

		it('should require authentication', async () => {
			const response = await request(app).post('/api/notes').send({
				title: 'My first note',
				body: 'My first note body',
			});

			expect(response.status).toBe(401);
		});

		it('should validate input data', async () => {
			const { token } = await createTestUser();

			const response = await request(app)
				.post('/api/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'My note',
					body: '',
				});

			expect(response.status).toBe(400);
		});
	});

	describe('GET /api/notes', () => {
		it('should get all user notes', async () => {
			const { user, token } = await createTestUser();
			await createTestNote(user.id);

			const response = await request(app)
				.get('/api/notes')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.notes)).toBe(true);
			expect(response.body.notes.length).toBeGreaterThan(0);
		});

		it('should return empty array for user with no notes', async () => {
			const { token } = await createTestUser();

			const response = await request(app)
				.get('/api/notes')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.notes)).toBe(true);
			expect(response.body.notes.length).toBe(0);
		});
	});

	describe('PUT /api/notes/:id', () => {
		it('should update a note', async () => {
			const { user, token } = await createTestUser();
			const note = await createTestNote(user.id);

			const response = await request(app)
				.put(`/api/notes/${note.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'My updated note',
					body: 'My updated note body',
				});

			expect(response.status).toBe(200);
			expect(response.body.note.title).toBe('My updated note');
		});

		it('should return 404 for non-existent note', async () => {
			const { token } = await createTestUser();
			const fakeId = '00000000-0000-0000-0000-000000000000';

			const response = await request(app)
				.put(`/api/notes/${fakeId}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Updated title',
				});

			expect(response.status).toBe(404);
		});
	});

	describe('DELETE /api/notes/:id', () => {
		it('should delete a note', async () => {
			const { user, token } = await createTestUser();
			const note = await createTestNote(user.id, {
				title: 'Temporary note',
				body: 'Note to be deleted',
			});

			const response = await request(app)
				.delete(`/api/notes/${note.id}`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Note deleted successfully');
		});

		it('should return 404 for non-existent note', async () => {
			const { token } = await createTestUser();
			const fakeId = '00000000-0000-0000-0000-000000000000';

			const response = await request(app)
				.delete(`/api/notes/${fakeId}`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(404);
		});
	});
});
