import '@xyflow/react/dist/style.css'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { LessonAdmin } from './components/LessonAdmin'
import { LessonExplorer } from './components/LessonExplorer'
import { buildLessonBlueprint } from './data/buildLessonBlueprint'
import { lessonsCatalog } from './data/lessonsCatalog'
import {
  clearSavedDraft,
  createDraft,
  createEmptyLessonSource,
  loadSavedDraft,
  slugifyLessonId,
} from './utils/editorUtils'
import {
  loadLessonFromCloud,
  loadLessonsFromCloud,
  publishLessonToCloud,
} from './utils/liveLesson'

function parseHashRoute(hashValue) {
  const normalizedHash = hashValue.replace(/^#/, '')
  const [screen = 'catalog', lessonId = null] = normalizedHash
    .split('/')
    .filter(Boolean)

  if (screen === 'aula' || screen === 'editor') {
    return {
      screen,
      lessonId,
    }
  }

  return {
    screen: 'catalog',
    lessonId: null,
  }
}

function buildHashRoute(screen, lessonId = null) {
  if (screen === 'aula' || screen === 'editor') {
    return `#/${screen}/${lessonId ?? ''}`
  }

  return '#/'
}

function buildLessonEntry({ lessonId, source, fallbackEntry = null, savedAt = null }) {
  const meta = source.content.meta ?? {}
  const accent = meta.accent ?? fallbackEntry?.accent ?? 'amber'
  const category = meta.category ?? fallbackEntry?.category ?? 'Estudo biblico'
  const audience = meta.audience ?? fallbackEntry?.audience ?? 'A definir'
  const duration =
    meta.duration ?? fallbackEntry?.duration ?? `${source.content.steps.length} etapas`

  return {
    id: lessonId,
    accent,
    category,
    audience,
    duration,
    savedAt,
    blueprint: buildLessonBlueprint(source.content, source.layout),
    source: {
      ...source,
      files: fallbackEntry?.source?.files ?? null,
    },
  }
}

function createUniqueLessonId(existingIds, title = 'Nova aula') {
  const baseId = slugifyLessonId(title)

  if (!existingIds.has(baseId)) {
    return baseId
  }

  let suffix = 2

  while (existingIds.has(`${baseId}-${suffix}`)) {
    suffix += 1
  }

  return `${baseId}-${suffix}`
}

function CatalogHome({ lessons, onOpenLesson, onOpenAdmin, onCreateLesson }) {
  const [openLessonIds, setOpenLessonIds] = useState([])
  const [showCatalogStats, setShowCatalogStats] = useState(false)

  const toggleLessonAccordion = (lessonId) => {
    setOpenLessonIds((currentIds) =>
      currentIds.includes(lessonId)
        ? currentIds.filter((id) => id !== lessonId)
        : [...currentIds, lessonId],
    )
  }

  return (
    <main className="catalog-shell">
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <span className="eyebrow">Biblioteca de aulas</span>
          <div className="catalog-hero__badge-row">
            <span className="catalog-hero__badge">Mapa mental interativo</span>
            <span className="catalog-hero__badge">Modo apresentacao</span>
          </div>
          <h1>Escolha uma aula para apresentar</h1>
          <p>
            Organize e apresente conteudos em formato de mapa mental, com
            navegacao por etapas e painel de leitura lateral.
          </p>
          <div className="catalog-hero__highlights">
            <div>
              <strong>Narrativa guiada</strong>
              <span>Fluxo visual que conduz a explicacao card a card.</span>
            </div>
            <div>
              <strong>Leitura a distancia</strong>
              <span>Estrutura pensada para aulas em telas amplas e apresentacoes.</span>
            </div>
          </div>
          <div className="catalog-hero__actions">
            <button type="button" className="primary-button" onClick={onCreateLesson}>
              Nova aula
            </button>
          </div>
        </div>

        <div className="catalog-hero__stats-wrap">
          <button
            type="button"
            className={`catalog-hero__stats-toggle ${showCatalogStats ? 'catalog-hero__stats-toggle--open' : ''}`}
            onClick={() => setShowCatalogStats((currentValue) => !currentValue)}
          >
            <span className="status-label">Resumo da plataforma</span>
            <strong>Ver informacoes rapidas</strong>
            <span className="catalog-hero__stats-toggle-icon">
              {showCatalogStats ? '−' : '+'}
            </span>
          </button>

          {showCatalogStats ? (
            <div className="catalog-hero__stats">
              <div className="catalog-stat catalog-stat--accent">
                <span className="status-label">Aulas disponiveis</span>
                <strong>{String(lessons.length).padStart(2, '0')}</strong>
                <p>Biblioteca pronta para crescer com novas aulas.</p>
              </div>
              <div className="catalog-stat">
                <span className="status-label">Formato</span>
                <strong>Mapa mental guiado</strong>
                <p>Navegacao progressiva com foco visual e leitura lateral.</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="catalog-section-heading">
        <span className="eyebrow">Aulas cadastradas</span>
        <h2>Selecione uma aula para abrir ou editar</h2>
      </section>

      <section className="catalog-grid">
        {lessons.map((lessonEntry) => {
          const isOpen = openLessonIds.includes(lessonEntry.id)

          return (
            <section
              key={lessonEntry.id}
              className={`catalog-accordion ${isOpen ? 'catalog-accordion--open' : ''}`}
            >
              <button
                type="button"
                className="catalog-accordion__trigger"
                onClick={() => toggleLessonAccordion(lessonEntry.id)}
              >
                <div className="catalog-accordion__main">
                  <span className="status-label">{lessonEntry.category}</span>
                  <strong>{lessonEntry.blueprint.meta.title}</strong>
                  <p className="catalog-accordion__description">
                    {lessonEntry.blueprint.meta.description}
                  </p>
                  <div className="catalog-accordion__summary">
                    <span>{lessonEntry.audience}</span>
                    <span>{lessonEntry.blueprint.steps.length} etapas</span>
                    <span>{lessonEntry.duration}</span>
                  </div>
                </div>
                <span
                  className={`catalog-accordion__chevron ${isOpen ? 'catalog-accordion__chevron--open' : ''}`}
                >
                  ▼
                </span>
              </button>

              {isOpen ? (
                <article className={`catalog-card catalog-card--${lessonEntry.accent}`}>
                  <div className="catalog-card__meta">
                    <span className="catalog-card__pill">{lessonEntry.category}</span>
                    <span className="catalog-card__duration">{lessonEntry.duration}</span>
                  </div>

                  <div className="catalog-card__headline">
                    <h2>{lessonEntry.blueprint.meta.title}</h2>
                    <p>{lessonEntry.blueprint.meta.description}</p>
                  </div>

                  <div className="catalog-card__benefits">
                    <span>Navegacao progressiva por cards</span>
                    <span>Editor visual integrado ao mapa</span>
                    <span>Publicacao em tempo real no site</span>
                  </div>

                  <dl className="catalog-card__details">
                    <div>
                      <dt>Publico</dt>
                      <dd>{lessonEntry.audience}</dd>
                    </div>
                    <div>
                      <dt>Etapas</dt>
                      <dd>{lessonEntry.blueprint.steps.length}</dd>
                    </div>
                  </dl>

                  <div className="catalog-card__actions">
                    <button
                      type="button"
                      className="ghost-button catalog-card__editor-button"
                      onClick={() => onOpenAdmin(lessonEntry.id)}
                    >
                      Abrir editor
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onOpenLesson(lessonEntry.id)}
                    >
                      Abrir aula
                    </button>
                  </div>
                </article>
              ) : null}
            </section>
          )
        })}
      </section>
    </main>
  )
}

function App() {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash))
  const [lessonDrafts, setLessonDrafts] = useState({})
  const [cloudLessons, setCloudLessons] = useState({})
  const [localLessons, setLocalLessons] = useState({})
  const screen = route.screen
  const activeLessonId = route.lessonId

  const mergedLessons = useMemo(() => {
    const lessonEntries = new Map()

    lessonsCatalog.forEach((lessonEntry) => {
      const cloudLesson = cloudLessons[lessonEntry.id]
      const draftLesson = lessonDrafts[lessonEntry.id]
      const source = draftLesson
        ? {
            content: draftLesson.content,
            layout: draftLesson.layout,
          }
        : cloudLesson
          ? {
              content: cloudLesson.content,
              layout: cloudLesson.layout,
            }
          : lessonEntry.source

      lessonEntries.set(
        lessonEntry.id,
        buildLessonEntry({
          lessonId: lessonEntry.id,
          source,
          fallbackEntry: lessonEntry,
          savedAt: cloudLesson?.savedAt ?? null,
        }),
      )
    })

    Object.entries(cloudLessons).forEach(([lessonId, lessonData]) => {
      if (lessonEntries.has(lessonId)) {
        return
      }

      const draftLesson = lessonDrafts[lessonId]
      const source = draftLesson
        ? {
            content: draftLesson.content,
            layout: draftLesson.layout,
          }
        : {
            content: lessonData.content,
            layout: lessonData.layout,
          }

      lessonEntries.set(
        lessonId,
        buildLessonEntry({
          lessonId,
          source,
          savedAt: lessonData.savedAt ?? null,
        }),
      )
    })

    Object.entries(localLessons).forEach(([lessonId, sourceData]) => {
      if (lessonEntries.has(lessonId)) {
        return
      }

      const draftLesson = lessonDrafts[lessonId]
      const source = draftLesson
        ? {
            content: draftLesson.content,
            layout: draftLesson.layout,
          }
        : sourceData

      lessonEntries.set(
        lessonId,
        buildLessonEntry({
          lessonId,
          source,
        }),
      )
    })

    return [...lessonEntries.values()].sort((firstLesson, secondLesson) =>
      firstLesson.blueprint.meta.title.localeCompare(secondLesson.blueprint.meta.title, 'pt-BR'),
    )
  }, [cloudLessons, lessonDrafts, localLessons])

  const activeLessonEntry =
    mergedLessons.find((lesson) => lesson.id === activeLessonId) ?? null

  const activeLessonDraft =
    activeLessonEntry
      ? lessonDrafts[activeLessonEntry.id] ??
        (screen === 'editor'
          ? loadSavedDraft(activeLessonEntry.id) ?? createDraft(activeLessonEntry.source)
          : null)
      : null

  const activeLessonBlueprint =
    activeLessonEntry && activeLessonDraft
      ? buildLessonBlueprint(activeLessonDraft.content, activeLessonDraft.layout)
      : activeLessonEntry?.blueprint ?? null

  useEffect(() => {
    const syncRoute = () => {
      setRoute(parseHashRoute(window.location.hash))
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', buildHashRoute('catalog'))
    }

    syncRoute()
    window.addEventListener('hashchange', syncRoute)

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    const lessonTitle = activeLessonEntry?.blueprint.meta.title

    if (screen === 'editor' && lessonTitle) {
      document.title = `Editor | ${lessonTitle}`
      return
    }

    if (screen === 'aula' && lessonTitle) {
      document.title = `Apresentacao | ${lessonTitle}`
      return
    }

    document.title = 'Trilha da Aula'
  }, [activeLessonEntry, screen])

  useEffect(() => {
    let isActive = true

    loadLessonsFromCloud()
      .then((lessons) => {
        if (!isActive) {
          return
        }

        setCloudLessons(
          lessons.reduce(
            (accumulator, lesson) => ({
              ...accumulator,
              [lesson.lessonId]: {
                content: lesson.content,
                layout: lesson.layout,
                savedAt: lesson.savedAt,
                source: lesson.source,
              },
            }),
            {},
          ),
        )
      })
      .catch(() => {
        // Mantem o fallback local e os arquivos estaticos quando a listagem do D1 falhar.
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!activeLessonEntry || cloudLessons[activeLessonEntry.id]) {
      return undefined
    }

    let isActive = true

    loadLessonFromCloud(activeLessonEntry.id)
      .then((lessonData) => {
        if (!isActive || !lessonData) {
          return
        }

        setCloudLessons((currentLessons) => ({
          ...currentLessons,
          [activeLessonEntry.id]: lessonData,
        }))
      })
      .catch(() => {
        // Mantem fallback local quando nao houver registro publicado no D1.
      })

    return () => {
      isActive = false
    }
  }, [activeLessonEntry, cloudLessons])

  const navigateTo = (nextScreen, lessonId = null) => {
    window.location.hash = buildHashRoute(nextScreen, lessonId)
  }

  const openAdmin = (lessonId) => {
    const lessonEntry = mergedLessons.find((lesson) => lesson.id === lessonId)

    if (!lessonEntry) {
      return
    }

    setLessonDrafts((currentDrafts) =>
      currentDrafts[lessonId]
        ? currentDrafts
        : {
            ...currentDrafts,
            [lessonId]: loadSavedDraft(lessonId) ?? createDraft(lessonEntry.source),
          },
    )

    navigateTo('editor', lessonId)
  }

  const openLesson = (lessonId) => {
    navigateTo('aula', lessonId)
  }

  const createLesson = () => {
    const lessonIds = new Set(mergedLessons.map((lesson) => lesson.id))
    const lessonId = createUniqueLessonId(lessonIds, 'Nova aula')
    const source = createEmptyLessonSource()

    setLocalLessons((currentLessons) => ({
      ...currentLessons,
      [lessonId]: source,
    }))
    setLessonDrafts((currentDrafts) => ({
      ...currentDrafts,
      [lessonId]: createDraft(source),
    }))

    navigateTo('editor', lessonId)
  }

  if (screen === 'editor' && activeLessonEntry && activeLessonDraft) {
    return (
      <LessonAdmin
        lessonEntry={activeLessonEntry}
        draft={activeLessonDraft}
        onDraftChange={(nextDraft) =>
          setLessonDrafts((currentDrafts) => ({
            ...currentDrafts,
            [activeLessonEntry.id]: nextDraft,
          }))
        }
        onBack={() => navigateTo('catalog')}
        onPreview={() => navigateTo('aula', activeLessonEntry.id)}
        onRestoreSavedDraft={() => {
          const savedDraft = loadSavedDraft(activeLessonEntry.id)

          if (!savedDraft) {
            return false
          }

          setLessonDrafts((currentDrafts) => ({
            ...currentDrafts,
            [activeLessonEntry.id]: savedDraft,
          }))

          return true
        }}
        onResetDraft={() => {
          const originalDraft = createDraft(activeLessonEntry.source)
          clearSavedDraft(activeLessonEntry.id)
          setLessonDrafts((currentDrafts) => ({
            ...currentDrafts,
            [activeLessonEntry.id]: originalDraft,
          }))
        }}
        onSaveToRepo={(draftToSave) =>
          publishLessonToCloud({
            lessonId: activeLessonEntry.id,
            draft: draftToSave,
          }).then((result) => {
            clearSavedDraft(activeLessonEntry.id)
            setCloudLessons((currentLessons) => ({
              ...currentLessons,
              [activeLessonEntry.id]: {
                content: draftToSave.content,
                layout: draftToSave.layout,
                savedAt: result?.savedAt ?? new Date().toISOString(),
                source: result?.source ?? 'd1',
              },
            }))
            setLocalLessons((currentLessons) => {
              if (!currentLessons[activeLessonEntry.id]) {
                return currentLessons
              }

              const nextLessons = { ...currentLessons }
              delete nextLessons[activeLessonEntry.id]
              return nextLessons
            })
            return result
          })
        }
      />
    )
  }

  if (screen === 'aula' && activeLessonEntry && activeLessonBlueprint) {
    return (
      <LessonExplorer
        lesson={activeLessonBlueprint}
        onBack={() => navigateTo('catalog')}
      />
    )
  }

  return (
    <CatalogHome
      lessons={mergedLessons}
      onOpenLesson={openLesson}
      onOpenAdmin={openAdmin}
      onCreateLesson={createLesson}
    />
  )
}

export default App
