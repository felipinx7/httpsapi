export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks);

  const response = await fetch(`http://31.97.151.33:4444${req.url}`, {
    method: req.method,
    headers: {
      ...req.headers,
      host: '31.97.151.33',
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const responseBody = await response.arrayBuffer();
  res.send(Buffer.from(responseBody));
}
