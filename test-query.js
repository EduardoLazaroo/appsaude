const { Client } = require('@notionhq/client');


const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        or: [
          { property: 'Status', select: { equals: 'Ideia' } },
          { property: 'Status', select: { equals: 'Gerado' } },
          { property: 'Status', select: { equals: 'Aprovado' } },
        ],
      },
      sorts: [{ property: 'Created', direction: 'descending' }],
      page_size: 50,
    });
    console.log("Success! Items:", res.results.length);
  } catch (e) {
    console.error("NOTION QUERY ERROR:", e);
  }
}
run();
