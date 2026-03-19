function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function serializeModuleExport(exportName, value) {
  return `export const ${exportName} = ${JSON.stringify(value, null, 2)}\n`
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
}

async function readCurrentSha({ owner, repo, branch, path, token }) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Nao consegui ler ${path} no GitHub: ${errorBody}`)
  }

  const data = await response.json()
  return data.sha ?? null
}

async function updateRepositoryFile({
  owner,
  repo,
  branch,
  path,
  token,
  content,
  commitMessage,
}) {
  const sha = await readCurrentSha({ owner, repo, branch, path, token })
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: toBase64(content),
        branch,
        sha,
      }),
    },
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Nao consegui salvar ${path} no GitHub: ${errorBody}`)
  }

  return response.json()
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true })
}

export async function onRequestPost(context) {
  try {
    const { env, request } = context
    const { lessonId, content, layout, files } = await request.json()

    if (!lessonId || !content || !layout || !files) {
      return jsonResponse({ error: 'Payload incompleto para salvar a aula.' }, 400)
    }

    const { contentPath, layoutPath, contentExportName, layoutExportName } = files

    if (!contentPath || !layoutPath || !contentExportName || !layoutExportName) {
      return jsonResponse({ error: 'Arquivos de destino nao configurados.' }, 400)
    }

    const token = env.GITHUB_TOKEN
    const owner = env.GITHUB_OWNER
    const repo = env.GITHUB_REPO
    const branch = env.GITHUB_BRANCH || 'main'

    if (!token || !owner || !repo) {
      return jsonResponse(
        {
          error:
            'Variaveis GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO precisam estar configuradas no Cloudflare.',
        },
        500,
      )
    }

    const commitPrefix = env.GITHUB_COMMIT_PREFIX || 'Atualiza aula'
    const commitMessage = `${commitPrefix}: ${lessonId}`

    const contentResult = await updateRepositoryFile({
      owner,
      repo,
      branch,
      path: contentPath,
      token,
      content: serializeModuleExport(contentExportName, content),
      commitMessage,
    })

    const layoutResult = await updateRepositoryFile({
      owner,
      repo,
      branch,
      path: layoutPath,
      token,
      content: serializeModuleExport(layoutExportName, layout),
      commitMessage,
    })

    return jsonResponse({
      ok: true,
      message: 'Aula salva no repositorio com sucesso.',
      savedAt: new Date().toISOString(),
      branch,
      commitSha: layoutResult?.commit?.sha ?? contentResult?.commit?.sha ?? null,
      commitUrl:
        layoutResult?.commit?.html_url ?? contentResult?.commit?.html_url ?? null,
    })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Erro ao salvar no repositorio.',
      },
      500,
    )
  }
}
