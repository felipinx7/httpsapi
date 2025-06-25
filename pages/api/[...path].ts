export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  const path = req.query.path?.join('/') || '';
  const query = req.url?.split('?')[1];
  const backendPath = `${path ? '/' + path : ''}${query ? `?${query}` : ''}`;

  // Filtrando headers problemáticos
  const {
    connection,
    'content-length': _,
    'accept-encoding': __,
    ...safeHeaders
  } = req.headers;

  safeHeaders['host'] = '31.97.151.33';
  safeHeaders['content-type'] = safeHeaders['content-type'] || 'application/json';

  console.log('\n--- PROXY DEBUG ---');
  console.log('➡️ Requisição recebida:');
  console.log('Método:', req.method);
  console.log('URL original:', req.url);
  console.log('Encaminhado para:', `http://31.97.151.33:4444${backendPath}`);
  console.log('---------------------\n');

  try {
    const response = await fetch(`http://31.97.151.33:4444${backendPath}`, {
      method: req.method,
      headers: safeHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
    });

    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));

    const responseBody = await response.arrayBuffer();
    res.send(Buffer.from(responseBody));
  } catch (error) {
    console.error('Erro ao fazer proxy:', error);
    res.status(502).json({ error: 'Erro ao redirecionar para o backend.' });
  }
}
