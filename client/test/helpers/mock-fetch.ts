type RouteRule = {
  match: (url: string, init?: RequestInit) => boolean;
  body: unknown;
  status?: number;
};

export function createJsonFetchMock(rules: RouteRule[]) {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const rule = rules.find((r) => r.match(url, init));
    if (rule === undefined) {
      return Promise.resolve(new Response(null, { status: 404 }));
    }
    return Promise.resolve(
      new Response(JSON.stringify(rule.body), {
        status: rule.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  };
}
