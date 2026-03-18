const draftStoragePrefix = 'aula-mapa-mental:draft:'

export function createDraft(source) {
  return {
    content: JSON.parse(JSON.stringify(source.content)),
    layout: JSON.parse(JSON.stringify(source.layout)),
  }
}

function getDraftStorageKey(lessonId) {
  return `${draftStoragePrefix}${lessonId}`
}

export function loadSavedDraft(lessonId) {
  if (typeof window === 'undefined') {
    return null
  }

  const rawDraft = window.localStorage.getItem(getDraftStorageKey(lessonId))

  if (!rawDraft) {
    return null
  }

  try {
    return JSON.parse(rawDraft)
  } catch {
    return null
  }
}

export function saveDraftToStorage(lessonId, draft) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getDraftStorageKey(lessonId), JSON.stringify(draft))
}

export function clearSavedDraft(lessonId) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getDraftStorageKey(lessonId))
}
