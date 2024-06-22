import type { PageServerLoad, Actions } from './$types.js';
import { superValidate, message, fail, setError } from 'sveltekit-superforms';
import { schemas } from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { prisma } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';
// import { redirect } from 'sveltekit-flash-message/server';

export const load: PageServerLoad = async ({ params: { id } }) => {
	const user = await prisma.user.findFirst({ where: { id: Number(id) } });

	const form = await superValidate(user, zod(schemas.User));

	return {
		form
	};
};

export const actions: Actions = {
	default: async (event) => {
		let { cookies } = event;
		let form = await superValidate(event, zod(schemas.User));
		if (!form.valid) {
			console.log('Form is invalid', { form });
			return fail(400, {
				form
			});
		}

		try {
			console.log('Attempting to save user', { form });
			const updateUser = await prisma.user.update({
				where: {
					id: Number(event.params.id)
				},
				data: {
					name: form.data.name,
					email: form.data.email
				}
			});

			// redirect('/', { type: 'success', message: "That's the entrepreneur spirit!" }, cookies);

			return message(form, 'User updated successfully');
			// redirect(200, `/users/view/${updateUser.id}`);
		} catch (error) {
			console.error({ error, 'error.message': (error as any).message });
			return setError(form, 'email', 'E-mail already exists.');
		}
	}
};
