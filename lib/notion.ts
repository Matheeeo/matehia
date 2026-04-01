import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export type Source = "WhatsApp" | "LinkedIn" | "Email" | "SMS" | "Autre";

export type Message = {
  id: string;
  source: Source;
  sender: string;
  content: string;
  summary: string;
  date: string;
  read: boolean;
  priority: "haute" | "normale" | "basse";
  archived: boolean;
};

export async function getMessages(source?: Source): Promise<Message[]> {
  const filters: any[] = [
    { property: "Archivé", checkbox: { equals: false } },
  ];

  if (source) {
    filters.push({ property: "Source", select: { equals: source } });
  }

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: filters.length > 1 ? { and: filters } : filters[0],
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return response.results
    .filter((p): p is typeof p & { properties: Record<string, any> } =>
      "properties" in p
    )
    .map((page) => {
      const p = page.properties as Record<string, any>;
      return {
        id: page.id,
        source: p.Source?.select?.name ?? "Autre",
        sender: p.Expéditeur?.title?.[0]?.plain_text ?? "Inconnu",
        content: p.Contenu?.rich_text?.[0]?.plain_text ?? "",
        summary: p.Résumé?.rich_text?.[0]?.plain_text ?? "",
        date: p.Date?.date?.start ?? new Date().toISOString(),
        read: p.Lu?.checkbox ?? false,
        priority: p.Priorité?.select?.name ?? "normale",
        archived: p.Archivé?.checkbox ?? false,
      };
    });
}

export async function markAsRead(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: { Lu: { checkbox: true } },
  });
}

export async function archiveMessage(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: { Archivé: { checkbox: true } },
  });
}

export async function setUrgent(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      Priorité: { select: { name: "haute" } },
      Lu: { checkbox: false },
    },
  });
}
