import { config } from 'dotenv';
config({ path: '.env.test' });

import { db } from '../../src/db/connection.ts';
import { users, notes, tags } from '../../src/db/schema.ts';
import { hashPassword } from '../../src/utils/password.ts';
import { generateToken } from '../../src/utils/jwt.ts';

export async function createTestUser(
	userData: Partial<{
		email: string;
		username: string;
		password: string;
		firstName: string;
		lastName: string;
	}> = {},
) {
	const defaultData = {
		email: `test-${Date.now()}-${Math.random()}@example.com`,
		username: `testuser-${Date.now()}-${Math.random()}`,
		password: 'TestPassword123!',
		firstName: 'Test',
		lastName: 'User',
		...userData,
	};

	const hashedPassword = await hashPassword(defaultData.password);
	const [user] = await db
		.insert(users)
		.values({
			...defaultData,
			password: hashedPassword,
		})
		.returning();

	const token = await generateToken({
		id: user.id,
		email: user.email,
		username: user.username,
	});

	return { user, token, rawPassword: defaultData.password };
}

export async function createTestNote(
	userId: string,
	noteData: Partial<{
		title: string;
		body: string;
	}> = {},
) {
	const defaultData = {
		title: `Test Note ${Date.now()}`,
		body: 'A test note',
		...noteData,
	};

	const [note] = await db
		.insert(notes)
		.values({
			userId,
			...defaultData,
		})
		.returning();

	return note;
}

export async function cleanupDatabase() {
	// Clean up in the right order due to foreign key constraints
	await db.delete(tags);
	await db.delete(notes);
	await db.delete(users);
}
