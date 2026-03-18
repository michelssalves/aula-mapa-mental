import { useState } from 'react'
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

function CatalogHome({ lessons, onOpenLesson, onOpenAdmin }) {
  return (
    <main className="catalog-shell">
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <span className="eyebrow">Biblioteca de aulas</span>
          <h1>Escolha uma aula para apresentar</h1>
          <p>
            Estrutura pronta para hospedar no GitHub Pages com aulas em formato
            de mapa mental, navegação por etapas e painel de leitura lateral.
          </p>
        </div>

        <div className="catalog-hero__stats">
          <div>
            <span className="status-label">Aulas disponíveis</span>
            <strong>{lessons.length}</strong>
          </div>
          <div>
            <span className="status-label">Formato</span>
            <strong>Mapa mental guiado</strong>
          </div>
          <div>
            <span className="status-label">Publicacao</span>
            <strong>GitHub Pages pronto</strong>
          </div>
        </div>
      </section>

      <section className="catalog-grid">
        {lessons.map((lessonEntry) => (
          <article
            key={lessonEntry.id}
            className={`catalog-card catalog-card--${lessonEntry.accent}`}
          >
            <div className="catalog-card__meta">
              <span>{lessonEntry.category}</span>
              <span>{lessonEntry.duration}</span>
            </div>

            <h2>{lessonEntry.blueprint.meta.title}</h2>
            <p>{lessonEntry.blueprint.meta.description}</p>

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
                className="ghost-button"
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
        ))}
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
