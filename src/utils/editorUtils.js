const draftStoragePrefix = 'aula-mapa-mental:draft:'
const publishStoragePrefix = 'aula-mapa-mental:publish:'

export function createDraft(source) {
  return {
    content: JSON.parse(JSON.stringify(source.content)),
    layout: JSON.parse(JSON.stringify(source.layout)),
  }
}

function getDraftStorageKey(lessonId) {
  return `${draftStoragePrefix}${lessonId}`
}

function getPublishStorageKey(lessonId) {
  return `${publishStoragePrefix}${lessonId}`
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

export function loadPublishMeta(lessonId) {
  if (typeof window === 'undefined') {
    return null
  }

  const rawMeta = window.localStorage.getItem(getPublishStorageKey(lessonId))

  if (!rawMeta) {
    return null
  }

  try {
    return JSON.parse(rawMeta)
  } catch {
    return null
  }
}

export function savePublishMeta(lessonId, meta) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getPublishStorageKey(lessonId), JSON.stringify(meta))
}
