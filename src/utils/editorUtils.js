const draftStoragePrefix = 'aula-mapa-mental:draft:'
const publishStoragePrefix = 'aula-mapa-mental:publish:'

export function createDraft(source) {
  return {
    content: JSON.parse(JSON.stringify(source.content)),
    layout: JSON.parse(JSON.stringify(source.layout)),
  }
}

export function createEmptyLessonSource(overrides = {}) {
  const title = overrides.title ?? 'Nova aula'
  const description =
    overrides.description ?? 'Descreva aqui o objetivo principal da aula.'

  return {
    content: {
      meta: {
        title,
        description,
        category: overrides.category ?? 'Estudo biblico',
        audience: overrides.audience ?? 'A definir',
        duration: overrides.duration ?? '1 etapa',
        accent: overrides.accent ?? 'amber',
      },
      steps: [
        {
          id: 'step-1',
          title: 'Primeira etapa',
          summary: 'Resumo inicial da etapa.',
          focus: 'Defina aqui o foco principal desta etapa.',
        },
      ],
      nodes: [
        {
          id: 'card-1',
          step: 0,
          title: 'Primeiro card',
          summary: 'Resumo inicial do card.',
          points: ['Primeiro ponto principal'],
          scriptures: [],
          tone: 'sun',
          imageUrl: '',
        },
      ],
    },
    layout: {
      positions: {
        'card-1': {
          x: 120,
          y: 520,
        },
      },
      edges: [],
    },
  }
}

export function slugifyLessonId(value) {
  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'nova-aula'
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
