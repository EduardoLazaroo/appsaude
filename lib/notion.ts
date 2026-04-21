import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID || '';

function getTextValue(property: any): string {
  if (!property) return '';
  if (property.title) return property.title.map((item: any) => item.plain_text).join('');
  if (property.rich_text) return property.rich_text.map((item: any) => item.plain_text).join('');
  return '';
}

function getSelectValue(property: any): string {
  return property?.select?.name || '';
}

function getMultiSelectValues(property: any): string[] {
  return property?.multi_select?.map((item: any) => item.name) || [];
}

export async function queryIdeas() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        { property: 'Status', select: { equals: 'Ideia' } },
        { property: 'Status', select: { equals: 'Gerado' } },
        { property: 'Status', select: { equals: 'Aprovado' } },
      ],
    },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: 50,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    theme: getTextValue(page.properties.Tema),
    subtheme: getTextValue(page.properties.Subtema),
    status: getSelectValue(page.properties.Status),
    type: getSelectValue(page.properties.Tipo) || 'Base',
    text: getTextValue(page.properties.Texto),
    tags: getMultiSelectValues(page.properties.Tags),
    date: page.properties['Data Postagem']?.date?.start || null,
  }));
}

export async function getPageById(pageId: string) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return {
    id: page.id,
    theme: getTextValue((page as any).properties.Tema),
    subtheme: getTextValue((page as any).properties.Subtema),
  };
}

export async function getRecentThemes(limit = 10) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Aprovado' },
    },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: limit,
  });

  return response.results.map((page: any) => getTextValue(page.properties.Tema));
}

export async function updatePageContent(pageId: string, text: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Texto: {
        rich_text: [{ type: 'text', text: { content: text } }],
      },
      Status: {
        select: { name: 'Gerado' },
      },
    },
  });
}

export async function approvePage(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: {
        select: { name: 'Aprovado' },
      },
    },
  });
}

export async function getAllExistingThemes(): Promise<string[]> {
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  const allThemes: string[] = [];

  while (hasMore) {
    const queryArgs: any = {
      database_id: databaseId,
      page_size: 100,
    };
    if (nextCursor) {
      queryArgs.start_cursor = nextCursor;
    }

    const response: any = await notion.databases.query(queryArgs);
    
    for (const page of response.results) {
      if(page.properties.Tema) {
        const theme = getTextValue(page.properties.Tema);
        if (theme) allThemes.push(theme);
      }
      if(page.properties.Subtema) {
        const subtheme = getTextValue(page.properties.Subtema);
        if (subtheme) allThemes.push(subtheme);
      }
    }

    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  return allThemes;
}

export async function createPreformedPage(theme: string, text: string) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Tema: {
        title: [
          { type: 'text', text: { content: theme } }
        ]
      },
      Texto: {
        rich_text: [
          { type: 'text', text: { content: text } }
        ]
      },
      Status: {
        select: { name: 'Gerado' }
      },
      Tipo: {
        select: { name: 'Pilar Básico' }
      }
    }
  });
}

export async function rejectPage(pageId: string) {
  // Arquiva a página (soft delete padrão do Notion) para que suma do painel
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

