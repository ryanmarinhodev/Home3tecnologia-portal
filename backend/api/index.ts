export default async function handler(req: any, res: any) {
	try {
		const { default: app } = await import('../src/app.js');
		return app(req, res);
	} catch (error) {
		console.error('Falha ao inicializar a aplicação na Vercel:', error);

		const message = error instanceof Error ? error.message : 'Erro desconhecido ao inicializar a aplicação';

		res.status(500).json({
			error: 'Falha ao inicializar a aplicação',
			message,
		});
	}
}