import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SERVER_ADDRESS = "zefircraft.mcsh.io";

interface McSrvStatResponse {
  online: boolean;
  players?: {
    online: number;
    max: number;
    list?: { name: string }[];
  };
  version?: string;
  motd?: {
    clean?: string[];
  };
  icon?: string;
}

export interface ServerStatusResult {
  online: boolean;
  players: { online: number; max: number };
  version: string | null;
  motd: string | null;
  icon: string | null;
  edition: "java" | "bedrock" | null;
  checkedAt: string;
}

async function fetchStatus(url: string): Promise<McSrvStatResponse | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "zefircraft-website (status widget)" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as McSrvStatResponse;
  } catch {
    return null;
  }
}

export async function GET() {
  // Once Java protokolunu dene, sonuc gelmezse veya offline gorunuyorsa Bedrock'u dene.
  const java = await fetchStatus(
    `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`
  );

  let result: McSrvStatResponse | null = java;
  let edition: "java" | "bedrock" | null = java?.online ? "java" : null;

  if (!java?.online) {
    const bedrock = await fetchStatus(
      `https://api.mcsrvstat.us/bedrock/3/${SERVER_ADDRESS}`
    );
    if (bedrock?.online) {
      result = bedrock;
      edition = "bedrock";
    } else if (!result) {
      result = bedrock;
    }
  }

  const payload: ServerStatusResult = {
    online: result?.online ?? false,
    players: {
      online: result?.players?.online ?? 0,
      max: result?.players?.max ?? 0,
    },
    version: result?.version ?? null,
    motd: result?.motd?.clean?.join(" ") ?? null,
    icon: result?.icon ?? null,
    edition,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
