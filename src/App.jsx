import { useState } from 'react'
import '@xyflow/react/dist/style.css'
import './App.css'
import { buildLessonBlueprint } from './data/buildLessonBlueprint'
import { lessonsCatalog } from './data/lessonsCatalog'
import { LessonAdmin } from './components/LessonAdmin'
import { LessonExplorer } from './components/LessonExplorer'
import { saveLessonToRepository } from './utils/cloudSave'
import {
  clearSavedDraft,
  createDraft,
  loadSavedDraft,
  saveDraftToStorage,
} from './utils/editorUtils'

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
            <span className="catalog-hero__badge">Modo apresentação</span>
          </div>
          <h1>Escolha uma aula para apresentar</h1>
          <p>
            Organize e apresente conteúdos em formato de mapa mental, com
            navegação por etapas e painel de leitura lateral.
          </p>
          <div className="catalog-hero__highlights">
            <div>
              <strong>Narrativa guiada</strong>
              <span>Fluxo visual que conduz a explicação card a card.</span>
            </div>
            <div>
              <strong>Leitura à distância</strong>
              <span>Estrutura pensada para aulas em telas amplas e apresentações.</span>
            </div>
          </div>
        </div>

        <div className="catalog-hero__stats">
          <div className="catalog-stat catalog-stat--accent">
            <span className="status-label">Aulas disponíveis</span>
            <strong>{String(lessons.length).padStart(2, '0')}</strong>
            <p>Biblioteca pronta para crescer com novas aulas.</p>
          </div>
          <div className="catalog-stat">
            <span className="status-label">Formato</span>
            <strong>Mapa mental guiado</strong>
            <p>Navegação progressiva com foco visual e leitura lateral.</p>
          </div>
          <div className="catalog-stat">
            <span className="status-label">Experiência</span>
            <strong>Leitura e edição no mesmo lugar</strong>
            <p>Abra a aula para apresentar ou entre no editor para ajustar o conteúdo.</p>
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
                  ▾
                </span>
              </button>

              {isOpen ? (
                <article
                  className={`catalog-card catalog-card--${lessonEntry.accent}`}
                >
                  <div className="catalog-card__meta">
                    <span className="catalog-card__pill">{lessonEntry.category}</span>
                    <span className="catalog-card__duration">{lessonEntry.duration}</span>
                  </div>

                  <div className="catalog-card__headline">
                    <h2>{lessonEntry.blueprint.meta.title}</h2>
                    <p>{lessonEntry.blueprint.meta.description}</p>
                  </div>

                  <div className="catalog-card__benefits">
                    <span>Panorama bíblico da mordomia</span>
                    <span>Leitura guiada do dízimo na Lei e no Novo Testamento</span>
                    <span>Estrutura pronta para aula e apresentação</span>
                  </div>

                  <dl className="catalog-card__details">
                    <div>
                      <dt>Público</dt>
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
  const [screen, setScreen] = useState('catalog')
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [lessonDrafts, setLessonDrafts] = useState({})

  const activeLessonEntry =
    lessonsCatalog.find((lesson) => lesson.id === activeLessonId) ?? null

  const activeLessonDraft =
    activeLessonEntry && lessonDrafts[activeLessonEntry.id]
      ? lessonDrafts[activeLessonEntry.id]
      : null

  const activeLessonBlueprint =
    activeLessonEntry && activeLessonDraft
      ? buildLessonBlueprint(activeLessonDraft.content, activeLessonDraft.layout)
      : activeLessonEntry?.blueprint ?? null

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
    setActiveLessonId(lessonId)
    setScreen('admin')
  }

  const openLesson = (lessonId) => {
    setActiveLessonId(lessonId)
    setScreen('lesson')
  }

  if (screen === 'admin' && activeLessonEntry && activeLessonDraft) {
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
        onBack={() => {
          setScreen('catalog')
          setActiveLessonId(null)
        }}
        onPreview={() => setScreen('lesson')}
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
          saveLessonToRepository({
            lessonId: activeLessonEntry.id,
            draft: draftToSave,
            files: activeLessonEntry.source.files,
          }).then((result) => {
            clearSavedDraft(activeLessonEntry.id)
            return result
          })
        }
      />
    )
  }

  if (screen === 'lesson' && activeLessonEntry && activeLessonBlueprint) {
    return (
      <LessonExplorer
        lesson={activeLessonBlueprint}
        onBack={() => {
          setScreen('catalog')
          setActiveLessonId(null)
        }}
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
