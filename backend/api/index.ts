export default async function handler(req: any, res: any) {
	try {
		if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
			return new Response(
				JSON.stringify({
					error: 'Runtime incompatível para handler Express',
					message: 'A função foi invocada no formato Web Request sem objetos req/res do Node.',
				}),
				{
					status: 500,
					headers: { 'content-type': 'application/json' },
				}
			);
		}

		const { default: app } = await import('../src/app.js');
		return app(req, res);
	} catch (error) {
		console.error('Falha ao inicializar a aplicação na Vercel:', error);

		const message = error instanceof Error ? error.message : 'Erro desconhecido ao inicializar a aplicação';

		if (res && typeof res.status === 'function' && typeof res.json === 'function') {
			res.status(500).json({
				error: 'Falha ao inicializar a aplicação',
				message,
			});
			return;
		}

		return new Response(
			JSON.stringify({
				error: 'Falha ao inicializar a aplicação',
				message,
			}),
			{
				status: 500,
				headers: { 'content-type': 'application/json' },
			}
		);
	}
}