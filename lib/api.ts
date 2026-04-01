export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api";

type ApiFetchOptions = RequestInit & {
  token?: string;
};

function joinApiPath(path: string) {
  if (!path) return API_PREFIX;
  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...init } = options;

  const response = await fetch(joinApiPath(path), {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `API error ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

