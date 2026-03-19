function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function ensureDatabase(env) {
  if (!env.DB) {
    throw new Error(
      'Binding D1 "DB" nao encontrado. Configure o banco D1 no Cloudflare Pages.',
    )
  }

  return env.DB
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true })
}

export async function onRequestGet(context) {
  try {
    const db = ensureDatabase(context.env)
    const url = new URL(context.request.url)
    const lessonId = url.searchParams.get('lessonId')
    const mode = url.searchParams.get('mode')

    if (mode === 'list') {
      const { results } = await db
        .prepare(
          `
          SELECT id, content_json, layout_json, updated_at
          FROM lessons
          ORDER BY updated_at DESC
          `,
        )
        .all()

      return jsonResponse({
        ok: true,
        lessons: (results ?? []).map((row) => ({
          lessonId: row.id,
          content: JSON.parse(row.content_json),
          layout: JSON.parse(row.layout_json),
          savedAt: row.updated_at,
          source: 'd1',
        })),
      })
    }

    if (!lessonId) {
      return jsonResponse({ error: 'lessonId e obrigatorio.' }, 400)
    }

    const row = await db
      .prepare(
        `
        SELECT id, content_json, layout_json, updated_at
        FROM lessons
        WHERE id = ?
        LIMIT 1
        `,
      )
      .bind(lessonId)
      .first()

    if (!row) {
      return jsonResponse({ ok: false, notFound: true }, 404)
    }

    return jsonResponse({
      ok: true,
      lessonId: row.id,
      content: JSON.parse(row.content_json),
      layout: JSON.parse(row.layout_json),
      savedAt: row.updated_at,
      source: 'd1',
    })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Erro ao carregar aula do D1.',
      },
      500,
    )
  }
}

export async function onRequestPost(context) {
  try {
    const db = ensureDatabase(context.env)
    const { lessonId, content, layout } = await context.request.json()

    if (!lessonId || !content || !layout) {
      return jsonResponse({ error: 'Payload incompleto para salvar a aula.' }, 400)
    }

    const savedAt = new Date().toISOString()

    await db
      .prepare(
        `
        INSERT INTO lessons (
          id,
          title,
          content_json,
          layout_json,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          content_json = excluded.content_json,
          layout_json = excluded.layout_json,
          updated_at = excluded.updated_at
        `,
      )
      .bind(
        lessonId,
        content.meta?.title ?? lessonId,
        JSON.stringify(content),
        JSON.stringify(layout),
        savedAt,
      )
      .run()

    return jsonResponse({
      ok: true,
      message: 'Aula publicada em tempo real com sucesso.',
      savedAt,
      source: 'd1',
    })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Erro ao salvar aula no D1.',
      },
      500,
    )
  }
}
