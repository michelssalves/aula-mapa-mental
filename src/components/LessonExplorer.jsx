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
import { LessonNode } from './LessonNode'
import { renderHighlightedText, toneEdgeColors } from '../utils/lessonUtils'

const nodeTypes = {
  lessonNode: LessonNode,
}

function MindMapCanvas({ nodes, edges, activeNodeId, onNodeSelect }) {
  const { setCenter } = useReactFlow()

  useEffect(() => {
    const activeNode = nodes.find((node) => node.id === activeNodeId)
    const viewportWidth = window.innerWidth
    const responsiveZoom =
      viewportWidth >= 1800 ? 0.98 : viewportWidth >= 1400 ? 0.93 : viewportWidth >= 1100 ? 0.88 : 0.8

    const timer = window.setTimeout(() => {
      if (activeNode) {
        setCenter(activeNode.position.x + 190, activeNode.position.y + 220, {
          zoom: responsiveZoom,
          duration: 900,
        })
      }
    }, 80)

    return () => window.clearTimeout(timer)
  }, [activeNodeId, edges, nodes, setCenter])

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
      <Controls
        showInteractive={false}
        position="bottom-center"
        orientation="horizontal"
      />
    </ReactFlow>
  )
}

export function LessonExplorer({ lesson, onBack }) {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0)
  const [unlockedNodeIndex, setUnlockedNodeIndex] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState(
    lesson.nodes[0]?.id ?? null,
  )
  const [leftPanel, setLeftPanel] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const totalNodes = lesson.nodes.length
  const currentNode = lesson.nodes[activeNodeIndex] ?? lesson.nodes[0]
  const activeStep = currentNode.step
  const isFirstStep = activeNodeIndex === 0
  const isLastStep = unlockedNodeIndex === totalNodes - 1
  const visibleBlueprintNodes = lesson.nodes.slice(0, unlockedNodeIndex + 1)
  const activeStepFirstNodeId = currentNode?.id ?? null
  const effectiveSelectedNodeId = visibleBlueprintNodes.some(
    (node) => node.id === selectedNodeId,
  )
    ? selectedNodeId
    : activeStepFirstNodeId

  const visibleNodes = visibleBlueprintNodes.map((node) => {
    const nodeIndex = lesson.nodes.findIndex((lessonNode) => lessonNode.id === node.id)

    return {
      id: node.id,
      type: 'lessonNode',
      position: node.position,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        title: node.title,
        summary: node.summary,
        previewPoints: node.points?.slice(0, 3) ?? [],
        points: node.points,
        scriptures: node.scriptures,
        imageUrl: node.imageUrl ?? '',
        tag: String(nodeIndex + 1).padStart(2, '0'),
        tone: node.tone,
        isActiveStep: node.id === currentNode.id,
        isSelected: node.id === effectiveSelectedNodeId,
      },
    }
  })

  const visibleEdges = visibleBlueprintNodes.slice(1).map((node, index) => {
    const previousNode = visibleBlueprintNodes[index]
    const edgeColor = toneEdgeColors[node.tone] ?? '#3a7bd5'

    return {
      id: `sequence-${previousNode.id}-${node.id}`,
      source: previousNode.id,
      target: node.id,
      animated: node.id === currentNode.id,
      type: 'smoothstep',
      pathOptions: {
        borderRadius: 24,
        offset: 28,
      },
      style: {
        stroke: node.id === currentNode.id ? '#d96f2d' : edgeColor,
        strokeWidth: node.id === currentNode.id ? 4.5 : 3,
        opacity: node.id === currentNode.id ? 1 : 0.78,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: node.id === currentNode.id ? '#d96f2d' : edgeColor,
      },
    }
  })

  const selectedNode =
    visibleBlueprintNodes.find((node) => node.id === effectiveSelectedNodeId) ??
    visibleBlueprintNodes[0] ??
    null

  const progress = Math.round(((activeNodeIndex + 1) / totalNodes) * 100)

  const handlePrevious = () => {
    const nextIndex = Math.max(activeNodeIndex - 1, 0)
    setActiveNodeIndex(nextIndex)
    setSelectedNodeId(lesson.nodes[nextIndex]?.id ?? null)
  }

  const handleNext = () => {
    const nextIndex = Math.min(activeNodeIndex + 1, totalNodes - 1)
    setActiveNodeIndex(nextIndex)
    setUnlockedNodeIndex((currentUnlocked) => Math.max(currentUnlocked, nextIndex))
    setSelectedNodeId(lesson.nodes[nextIndex]?.id ?? null)
  }

  const handleTimelineSelect = (nodeIndex) => {
    if (nodeIndex >= 0 && nodeIndex < totalNodes) {
      setActiveNodeIndex(nodeIndex)
      setUnlockedNodeIndex((currentUnlocked) => Math.max(currentUnlocked, nodeIndex))
      setSelectedNodeId(lesson.nodes[nodeIndex]?.id ?? null)
    }
  }

  return (
    <main className="app-shell app-shell--focus">
      <section className="canvas-panel canvas-panel--focus">
        <div className="canvas-frame canvas-frame--focus">
          <ReactFlowProvider>
            <MindMapCanvas
              nodes={visibleNodes}
              edges={visibleEdges}
              activeNodeId={currentNode.id}
              onNodeSelect={(nodeId) => {
                setSelectedNodeId(nodeId)
                setDetailsOpen(true)
              }}
            />
          </ReactFlowProvider>
        </div>
      </section>

      <aside className={`side-panel ${leftPanel ? 'side-panel--open' : ''}`}>
        <div className="side-panel__header">
          <strong>{leftPanel === 'overview' ? 'Resumo' : leftPanel === 'timeline' ? 'Linha da aula' : ''}</strong>
          <button
            type="button"
            className="side-panel__close"
            onClick={() => setLeftPanel(null)}
          >
            Fechar
          </button>
        </div>

        <div className="side-panel__body">
          {leftPanel === 'overview' ? (
            <>
              <button type="button" className="back-link" onClick={onBack}>
                Voltar para o catálogo
              </button>
              <span className="side-panel__eyebrow">Visão geral da aula</span>
              <h3 className="side-panel__title">{lesson.meta.title}</h3>
              <p className="details-panel__summary">
                {renderHighlightedText(lesson.meta.description)}
              </p>
              <div className="side-panel__stats">
                <div>
                  <span className="status-label">Progresso</span>
                  <strong>{progress}%</strong>
                </div>
                <div>
                  <span className="status-label">Etapa atual</span>
                  <strong>{lesson.steps[activeStep].title}</strong>
                </div>
                <div>
                  <span className="status-label">Card atual</span>
                  <strong>
                    {activeNodeIndex + 1} de {totalNodes}
                  </strong>
                </div>
                <div>
                  <span className="status-label">Destaque</span>
                  <strong>{currentNode.title}</strong>
                </div>
              </div>
            </>
          ) : null}

          {leftPanel === 'timeline' ? (
            <>
              <div className="timeline-panel__hero">
                <span className="eyebrow">Navegação da aula</span>
                <h3>Todos os cards da apresentação</h3>
                <p>Selecione qualquer ponto da narrativa para ir direto ao card correspondente.</p>
              </div>

              <ol className="timeline-list">
                {lesson.nodes.map((node, index) => {
                  const state =
                    index < unlockedNodeIndex
                      ? 'done'
                      : index === activeNodeIndex
                        ? 'current'
                        : 'upcoming'

                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        className={`timeline-item timeline-item--${state}`}
                        onClick={() => handleTimelineSelect(index)}
                      >
                        <span className="timeline-item__index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="timeline-item__content">
                          <span className="timeline-item__section">
                            {lesson.steps[node.step].title}
                          </span>
                          <strong>{node.title}</strong>
                          <p>{node.summary}</p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </>
          ) : null}
        </div>
      </aside>

      <aside className={`side-panel side-panel--right ${detailsOpen ? 'side-panel--open' : ''}`}>
        <div className="side-panel__header">
          <strong>Detalhes</strong>
          <button
            type="button"
            className="side-panel__close"
            onClick={() => setDetailsOpen(false)}
          >
            Fechar
          </button>
        </div>

        <div className="side-panel__body">
          {selectedNode ? (
            <>
              <div className="details-panel__hero">
                <span className="details-panel__number">
                  Card {String(lesson.nodes.findIndex((node) => node.id === selectedNode.id) + 1).padStart(2, '0')}
                </span>
                <span className="details-panel__section">
                  {lesson.steps[selectedNode.step].title}
                </span>
              </div>
              <h3>{selectedNode.title}</h3>
              <p className="details-panel__summary">
                {renderHighlightedText(selectedNode.summary)}
              </p>

              {selectedNode.imageUrl ? (
                <div className="details-panel__media">
                  <img
                    src={selectedNode.imageUrl}
                    alt={selectedNode.title}
                    loading="lazy"
                    className="details-panel__image"
                  />
                </div>
              ) : null}

              {selectedNode.points?.length ? (
                <>
                  <h4>Pontos principais</h4>
                  <ul className="details-panel__list">
                    {selectedNode.points.map((point) => (
                      <li key={point}>{renderHighlightedText(point)}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {selectedNode.scriptures?.length ? (
                <>
                  <h4>Versículos</h4>
                  <ul className="details-panel__list details-panel__list--scriptures">
                    {selectedNode.scriptures.map((scripture) => (
                      <li key={scripture}>{renderHighlightedText(scripture)}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </aside>

      <div className="floating-menu">
        <div className="floating-nav">
          <div className="floating-nav__group">
            <button
              type="button"
              className={`toolbar-button ${leftPanel === 'overview' ? 'toolbar-button--active' : ''}`}
              onClick={() =>
                setLeftPanel((value) => (value === 'overview' ? null : 'overview'))
              }
            >
              Resumo
            </button>
            <button
              type="button"
              className={`toolbar-button ${leftPanel === 'timeline' ? 'toolbar-button--active' : ''}`}
              onClick={() =>
                setLeftPanel((value) => (value === 'timeline' ? null : 'timeline'))
              }
            >
              Linha da aula
            </button>
            <button
              type="button"
              className={`toolbar-button ${detailsOpen ? 'toolbar-button--active' : ''}`}
              onClick={() => setDetailsOpen((value) => !value)}
            >
              Detalhes
            </button>
          </div>

          <div className="floating-nav__divider"></div>

          <div className="floating-nav__group">
            <div className="floating-nav__progress">
              <span>Progresso</span>
              <strong>
                {String(activeNodeIndex + 1).padStart(2, '0')} / {String(totalNodes).padStart(2, '0')}
              </strong>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              Voltar
            </button>
            <button
              type="button"
              className={`primary-button ${!isLastStep ? 'primary-button--next' : ''}`}
              onClick={handleNext}
              disabled={isLastStep}
            >
              {isLastStep ? 'Aula completa' : 'Avançar'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
