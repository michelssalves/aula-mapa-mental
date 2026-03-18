import { useEffect, useState } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'
import { lessonsCatalog } from './data/lessonsCatalog'

function LessonNode({ data }) {
  return (
    <article
      className={`lesson-node lesson-node--${data.tone} ${data.isActiveStep ? 'lesson-node--active-step' : ''} ${data.isSelected ? 'lesson-node--selected' : ''}`}
    >
      <span className="lesson-node__tag">{data.tag}</span>
      <h3>{data.title}</h3>
      {data.summary ? <p className="lesson-node__summary">{data.summary}</p> : null}

      {data.points?.length ? (
        <ul className="lesson-node__list">
          {data.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}

      {data.scriptures?.length ? (
        <div className="lesson-node__scriptures">
          <strong>Textos</strong>
          <ul className="lesson-node__scripture-list">
            {data.scriptures.map((scripture) => (
              <li key={scripture}>{scripture}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

const nodeTypes = {
  lessonNode: LessonNode,
}

function MindMapCanvas({ nodes, edges, activeStep, onNodeSelect }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    const focusNodes = nodes.filter((node) => node.data.isActiveStep)
    const nodesToFit = focusNodes.length ? focusNodes : nodes

    const timer = window.setTimeout(() => {
      fitView({
        nodes: nodesToFit,
        duration: 900,
        padding: nodesToFit.length > 1 ? 0.3 : 0.55,
        maxZoom: nodesToFit.length > 1 ? 0.92 : 0.98,
      })
    }, 80)

    return () => window.clearTimeout(timer)
  }, [activeStep, fitView, nodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnDoubleClick={false}
      panOnScroll
      minZoom={0.35}
      maxZoom={1.5}
    >
      <Background gap={28} size={1.3} color="rgba(64, 51, 28, 0.12)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  )
}

function LessonExplorer({ lesson, onBack }) {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState(
    lesson.nodes.find((node) => node.step === 0)?.id ?? null,
  )

  const totalSteps = lesson.steps.length
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === totalSteps - 1
  const visibleBlueprintNodes = lesson.nodes.filter((node) => node.step <= activeStep)
  const activeStepFirstNodeId =
    lesson.nodes.find((node) => node.step === activeStep)?.id ?? null
  const effectiveSelectedNodeId = visibleBlueprintNodes.some(
    (node) => node.id === selectedNodeId,
  )
    ? selectedNodeId
    : activeStepFirstNodeId

  const visibleNodes = visibleBlueprintNodes.map((node) => ({
    id: node.id,
    type: 'lessonNode',
    position: node.position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      title: node.title,
      summary: node.summary,
      points: node.points,
      scriptures: node.scriptures,
      tag: node.tag,
      tone: node.tone,
      isActiveStep: node.step === activeStep,
      isSelected: node.id === effectiveSelectedNodeId,
    },
  }))

  const visibleEdges = lesson.edges
    .filter((edge) => edge.step <= activeStep)
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.step === activeStep,
      type: 'smoothstep',
      pathOptions: {
        borderRadius: 24,
        offset: 28,
      },
      style: {
        stroke: edge.color,
        strokeWidth: edge.step === activeStep ? 4.5 : 3,
        opacity: edge.step === activeStep ? 1 : 0.78,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: edge.color,
      },
    }))

  const selectedNode =
    visibleBlueprintNodes.find((node) => node.id === effectiveSelectedNodeId) ??
    visibleBlueprintNodes[0] ??
    null

  const progress = Math.round(((activeStep + 1) / totalSteps) * 100)

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <button type="button" className="back-link" onClick={onBack}>
            Voltar para o catalogo
          </button>
          <span className="eyebrow">Aula em mapa mental interativo</span>
          <h1>{lesson.meta.title}</h1>
          <p className="hero-panel__lead">{lesson.meta.description}</p>
        </div>

        <div className="hero-panel__status">
          <div>
            <span className="status-label">Progresso</span>
            <strong>{progress}%</strong>
          </div>
          <div>
            <span className="status-label">Etapa atual</span>
            <strong>{lesson.steps[activeStep].title}</strong>
          </div>
          <div>
            <span className="status-label">Destaque</span>
            <strong>{lesson.steps[activeStep].focus}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="timeline-panel">
          <div className="timeline-panel__header">
            <span className="eyebrow">Linha da aula</span>
            <h2>Avance no ritmo da explicacao</h2>
            <p>
              Cada clique libera os proximos blocos do conteudo e reforca a
              narrativa visual da aula.
            </p>
          </div>

          <ol className="timeline-list">
            {lesson.steps.map((step, index) => {
              const state =
                index < activeStep
                  ? 'done'
                  : index === activeStep
                    ? 'current'
                    : 'upcoming'

              return (
                <li key={step.id} className={`timeline-item timeline-item--${state}`}>
                  <span className="timeline-item__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.summary}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="timeline-panel__actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
              disabled={isFirstStep}
            >
              Voltar
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setActiveStep((step) => Math.min(step + 1, totalSteps - 1))
              }
              disabled={isLastStep}
            >
              {isLastStep ? 'Aula completa' : 'Avancar'}
            </button>
          </div>
        </aside>

        <section className="canvas-panel">
          <header className="canvas-panel__header">
            <div>
              <span className="eyebrow">Mapa mental</span>
              <h2>{lesson.steps[activeStep].title}</h2>
            </div>
            <p>{lesson.steps[activeStep].focus}</p>
          </header>

          <div className="canvas-content">
            <div className="canvas-frame">
              <ReactFlowProvider>
                <MindMapCanvas
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  activeStep={activeStep}
                  onNodeSelect={setSelectedNodeId}
                />
              </ReactFlowProvider>
            </div>

            <aside className="details-panel">
              {selectedNode ? (
                <>
                  <span className="eyebrow">Card selecionado</span>
                  <h3>{selectedNode.title}</h3>
                  <p className="details-panel__summary">{selectedNode.summary}</p>

                  {selectedNode.points?.length ? (
                    <>
                      <h4>Pontos principais</h4>
                      <ul className="details-panel__list">
                        {selectedNode.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {selectedNode.scriptures?.length ? (
                    <>
                      <h4>Versiculos</h4>
                      <ul className="details-panel__list details-panel__list--scriptures">
                        {selectedNode.scriptures.map((scripture) => (
                          <li key={scripture}>{scripture}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="details-panel__empty">
                      Este card funciona como organizador da narrativa.
                    </p>
                  )}
                </>
              ) : null}
            </aside>
          </div>
        </section>
      </section>
    </main>
  )
}

function CatalogHome({ lessons, onOpenLesson }) {
  return (
    <main className="catalog-shell">
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <span className="eyebrow">Biblioteca de aulas</span>
          <h1>Escolha uma aula para apresentar</h1>
          <p>
            Estrutura pronta para hospedar no GitHub Pages com aulas em formato
            de mapa mental, navegacao por etapas e painel de leitura lateral.
          </p>
        </div>

        <div className="catalog-hero__stats">
          <div>
            <span className="status-label">Aulas disponiveis</span>
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

            <button
              type="button"
              className="primary-button"
              onClick={() => onOpenLesson(lessonEntry.id)}
            >
              Abrir aula
            </button>
          </article>
        ))}
      </section>
    </main>
  )
}

function App() {
  const [activeLessonId, setActiveLessonId] = useState(null)

  const activeLessonEntry =
    lessonsCatalog.find((lesson) => lesson.id === activeLessonId) ?? null

  if (activeLessonEntry) {
    return (
      <LessonExplorer
        lesson={activeLessonEntry.blueprint}
        onBack={() => setActiveLessonId(null)}
      />
    )
  }

  return (
    <CatalogHome
      lessons={lessonsCatalog}
      onOpenLesson={(lessonId) => setActiveLessonId(lessonId)}
    />
  )
}

export default App
