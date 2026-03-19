export async function loadLessonFromCloud(lessonId) {
  const response = await fetch(`/api/lesson?lessonId=${encodeURIComponent(lessonId)}`)
  const data = await response.json().catch(() => ({}))

  if (response.status === 404 || data?.notFound) {
    return null
  }

  if (!response.ok) {
    throw new Error(data.error ?? 'Nao foi possivel carregar a aula publicada.')
  }

  return {
    content: data.content,
    layout: data.layout,
    savedAt: data.savedAt ?? null,
    source: data.source ?? 'd1',
  }
}

export async function publishLessonToCloud({ lessonId, draft }) {
  const response = await fetch('/api/lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lessonId,
      content: draft.content,
      layout: draft.layout,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error ?? 'Nao foi possivel publicar a aula em tempo real.')
  }

  return data
}
