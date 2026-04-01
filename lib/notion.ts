import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export type Source = "WhatsApp" | "LinkedIn" | "Email" | "SMS" | "Autre";

export type Message = {
  id: string;
  source: Source;
  sender: string;
  content: string;
  date: string;
  read: boolean;
  priority: "haute" | "normale" | "basse";
};

export async function getMessages(source?: Source): Promise<Message[]> {
  const filter =
    source && source !== "Autre"
      ? {
          property: "Source",
          select: { equals: source },
        }
      : undefined;

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter,
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return response.results
    .filter((page): page is typeof page & { properties: Record<string, any> } =>
      "properties" in page
    )
    .map((page) => {
      const props = page.properties as Record<string, any>;
      return {
        id: page.id,
        source: props.Source?.select?.name ?? "Autre",
        sender: props.Expéditeur?.title?.[0]?.plain_text ?? "Inconnu",
        content: props.Contenu?.rich_text?.[0]?.plain_text ?? "",
        date: props.Date?.date?.start ?? new Date().toISOString(),
        read: props.Lu?.checkbox ?? false,
        priority: props.Priorité?.select?.name ?? "normale",
      };
    });
}

export async function markAsRead(messageId: string): Promise<void> {
  await notion.pages.update({
    page_id: messageId,
    properties: {
      Lu: { checkbox: true },
    },
  });
}
