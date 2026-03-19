import { useEffect, useState } from 'react'
import '@xyflow/react/dist/style.css'
import './App.css'
import { buildLessonBlueprint } from './data/buildLessonBlueprint'
import { lessonsCatalog } from './data/lessonsCatalog'
import { LessonAdmin } from './components/LessonAdmin'
import { LessonExplorer } from './components/LessonExplorer'
import {
  clearSavedDraft,
  createDraft,
  loadSavedDraft,
  saveDraftToStorage,
} from './utils/editorUtils'
import { loadLessonFromCloud, publishLessonToCloud } from './utils/liveLesson'

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

function CatalogHome({ lessons, onOpenLesson, onOpenAdmin }) {
  const [openLessonIds, setOpenLessonIds] = useState([])

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
        </div>

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
          <div className="catalog-stat">
            <span className="status-label">Experiencia</span>
            <strong>Leitura e edicao no mesmo lugar</strong>
            <p>Abra a aula para apresentar ou entre no editor para ajustar o conteudo.</p>
          </div>
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
                <span className={`catalog-accordion__chevron ${isOpen ? 'catalog-accordion__chevron--open' : ''}`}>
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
                    <span>Panorama biblico da mordomia</span>
                    <span>Leitura guiada do dizimo na Lei e no Novo Testamento</span>
                    <span>Estrutura pronta para aula e apresentacao</span>
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
  const [publishedLessons, setPublishedLessons] = useState({})
  const screen = route.screen
  const activeLessonId = route.lessonId

  const activeLessonEntry =
    lessonsCatalog.find((lesson) => lesson.id === activeLessonId) ?? null

  const activePublishedLesson =
    activeLessonEntry ? publishedLessons[activeLessonEntry.id] ?? null : null

  const activeLessonSource =
    activeLessonEntry && activePublishedLesson
      ? {
          content: activePublishedLesson.content,
          layout: activePublishedLesson.layout,
        }
      : activeLessonEntry?.source ?? null

  const activeLessonDraft =
    activeLessonSource
      ? lessonDrafts[activeLessonEntry.id] ??
        (screen === 'editor'
          ? loadSavedDraft(activeLessonEntry.id) ?? createDraft(activeLessonSource)
          : null)
      : null

  const activeLessonBlueprint =
    activeLessonSource && activeLessonDraft
      ? buildLessonBlueprint(activeLessonDraft.content, activeLessonDraft.layout)
      : activeLessonSource
        ? buildLessonBlueprint(activeLessonSource.content, activeLessonSource.layout)
        : null

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
    if (!activeLessonEntry) {
      return undefined
    }

    let isActive = true

    loadLessonFromCloud(activeLessonEntry.id)
      .then((lessonData) => {
        if (!isActive || !lessonData) {
          return
        }

        setPublishedLessons((currentLessons) => ({
          ...currentLessons,
          [activeLessonEntry.id]: lessonData,
        }))
      })
      .catch(() => {
        // Mantem fallback para os arquivos locais quando nao houver aula publicada no D1.
      })

    return () => {
      isActive = false
    }
  }, [activeLessonEntry])

  const navigateTo = (nextScreen, lessonId = null) => {
    window.location.hash = buildHashRoute(nextScreen, lessonId)
  }

  const openAdmin = (lessonId) => {
    const lessonEntry = lessonsCatalog.find((lesson) => lesson.id === lessonId)

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
        onSaveDraft={(draftToSave) => {
          saveDraftToStorage(activeLessonEntry.id, draftToSave)
        }}
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
            setPublishedLessons((currentLessons) => ({
              ...currentLessons,
              [activeLessonEntry.id]: {
                content: draftToSave.content,
                layout: draftToSave.layout,
                savedAt: result?.savedAt ?? new Date().toISOString(),
                source: result?.source ?? 'd1',
              },
            }))
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
      lessons={lessonsCatalog}
      onOpenLesson={openLesson}
      onOpenAdmin={openAdmin}
    />
  )
}

export default App
