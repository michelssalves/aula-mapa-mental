export async function saveLessonToRepository({ lessonId, draft, files }) {
  const response = await fetch('/api/save-lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lessonId,
      content: draft.content,
      layout: draft.layout,
      files,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error ?? 'Nao foi possivel salvar no repositorio.')
  }

  return data
}
