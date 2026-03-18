import { useEffect, useMemo, useState } from 'react'
import {
  applyNodeChanges,
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { LessonNode } from './LessonNode'
import { toneEdgeColors } from '../utils/lessonUtils'

const nodeTypes = {
  lessonNode: LessonNode,
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createEdgeId(index) {
  return `editor-edge-${index + 1}`
}

function syncLayoutWithNodes(nodes, currentLayout) {
  const positions = {}
  const nodeIds = new Set(nodes.map((node) => node.id))

  nodes.forEach((node, index) => {
    positions[node.id] = currentLayout.positions[node.id] ?? {
      x: 120 + index * 520,
      y: 520,
    }
  })

  const edges = nodes.slice(1).map((node, index) => ({
    id: createEdgeId(index),
    source: nodes[index].id,
    target: node.id,
    step: node.step,
    color: toneEdgeColors[node.tone] ?? '#3a7bd5',
  }))

  const cleanEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  )

  return {
    ...currentLayout,
    positions,
    edges: cleanEdges,
  }
}

function buildUniqueNodeId(nodes, title) {
  const baseId = slugify(title) || 'novo-card'
  const usedIds = new Set(nodes.map((node) => node.id))

  if (!usedIds.has(baseId)) {
    return baseId
  }

  let suffix = 2

  while (usedIds.has(`${baseId}-${suffix}`)) {
    suffix += 1
  }

  return `${baseId}-${suffix}`
}

function buildUniqueStepId(steps) {
  const usedIds = new Set(steps.map((step) => step.id))
  let index = steps.length + 1

  while (usedIds.has(`step-${index}`)) {
    index += 1
  }

  return `step-${index}`
}

function swapItems(list, firstIndex, secondIndex) {
  const nextList = [...list]
  const temp = nextList[firstIndex]
  nextList[firstIndex] = nextList[secondIndex]
  nextList[secondIndex] = temp
  return nextList
}

function splitTextareaList(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function serializeModuleExport(exportName, value) {
  return `export const ${exportName} = ${JSON.stringify(value, null, 2)}\n`
}

function AdminCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodePositionChange,
}) {
  const [flowNodes, setFlowNodes] = useState(nodes)

  useEffect(() => {
    setFlowNodes(nodes)
  }, [nodes])

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={(changes) => setFlowNodes((current) => applyNodeChanges(changes, current))}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      onNodeDragStop={(_, node) =>
        onNodePositionChange(node.id, {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        })
      }
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      zoomOnDoubleClick={false}
      panOnScroll
      fitView
      minZoom={0.25}
      maxZoom={1.6}
    >
      <Background gap={28} size={1.3} color="rgba(64, 51, 28, 0.12)" />
      <Controls
        showInteractive={false}
        position="bottom-center"
        orientation="horizontal"
      />
      <div className="admin-canvas__hint">
        <strong>Editor visual</strong>
        <span>Arraste os cards no mapa para reposicionar.</span>
      </div>
      <div className="admin-canvas__selection">
        {selectedNodeId ? <span>Selecionado: {selectedNodeId}</span> : null}
      </div>
    </ReactFlow>
  )
}

export function LessonAdmin({
  lessonEntry,
  draft,
  onDraftChange,
  onBack,
  onPreview,
  onSaveDraft,
  onRestoreSavedDraft,
  onResetDraft,
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(
    draft.content.nodes[0]?.id ?? null,
  )
  const [statusMessage, setStatusMessage] = useState('')
  const effectiveSelectedNodeId = draft.content.nodes.some(
    (node) => node.id === selectedNodeId,
  )
    ? selectedNodeId
    : draft.content.nodes[0]?.id ?? null

  const selectedNode =
    draft.content.nodes.find((node) => node.id === effectiveSelectedNodeId) ??
    draft.content.nodes[0] ??
    null
  const selectedStep =
    selectedNode ? draft.content.steps[selectedNode.step] : draft.content.steps[0]
  const selectedStepIndex = selectedNode?.step ?? 0
  const selectedNodeIndex = draft.content.nodes.findIndex(
    (node) => node.id === effectiveSelectedNodeId,
  )

  const adminNodes = draft.content.nodes.map((node, index) => ({
    id: node.id,
    type: 'lessonNode',
    position: draft.layout.positions[node.id] ?? { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      title: node.title,
      summary: node.summary,
      previewPoints: node.points?.slice(0, 3) ?? [],
      tag: String(index + 1).padStart(2, '0'),
      tone: node.tone,
      isActiveStep: node.id === effectiveSelectedNodeId,
      isSelected: node.id === effectiveSelectedNodeId,
    },
  }))

  const adminEdges = draft.content.nodes.slice(1).map((node, index) => {
    const previousNode = draft.content.nodes[index]
    const isCurrentTarget = node.id === effectiveSelectedNodeId
    const edgeColor = toneEdgeColors[node.tone] ?? '#3a7bd5'

    return {
      id: `admin-sequence-${previousNode.id}-${node.id}`,
      source: previousNode.id,
      target: node.id,
      animated: isCurrentTarget,
      type: 'smoothstep',
      pathOptions: {
        borderRadius: 24,
        offset: 28,
      },
      style: {
        stroke: isCurrentTarget ? '#d96f2d' : edgeColor,
        strokeWidth: isCurrentTarget ? 4.5 : 3,
        opacity: isCurrentTarget ? 1 : 0.58,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: isCurrentTarget ? '#d96f2d' : edgeColor,
      },
    }
  })

  const contentExport = useMemo(
    () => serializeModuleExport('mordomiaContent', draft.content),
    [draft.content],
  )
  const layoutExport = useMemo(
    () => serializeModuleExport('mordomiaLayout', draft.layout),
    [draft.layout],
  )

  const updateDraft = (updater) => {
    onDraftChange(updater(draft))
  }

  const updateMeta = (field, value) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      content: {
        ...currentDraft.content,
        meta: {
          ...currentDraft.content.meta,
          [field]: value,
        },
      },
    }))
  }

  const updateStep = (stepIndex, field, value) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      content: {
        ...currentDraft.content,
        steps: currentDraft.content.steps.map((step, index) =>
          index === stepIndex ? { ...step, [field]: value } : step,
        ),
      },
    }))
  }

  const handleCreateStep = () => {
    const referenceStepIndex = selectedNode?.step ?? draft.content.steps.length - 1
    const insertIndex = Math.max(referenceStepIndex + 1, 0)
    const newStep = {
      id: buildUniqueStepId(draft.content.steps),
      title: 'Nova etapa',
      summary: 'Resumo da nova etapa.',
      focus: 'Foco da nova etapa.',
    }

    updateDraft((currentDraft) => {
      const nextSteps = [...currentDraft.content.steps]
      nextSteps.splice(insertIndex, 0, newStep)

      const nextNodes = currentDraft.content.nodes.map((node) =>
        node.step >= insertIndex ? { ...node, step: node.step + 1 } : node,
      )

      return {
        content: {
          ...currentDraft.content,
          steps: nextSteps,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setStatusMessage('Nova etapa criada.')
  }

  const handleDuplicateStep = () => {
    if (!selectedStep) {
      return
    }

    const sourceStepIndex = selectedNode?.step ?? 0
    const insertIndex = sourceStepIndex + 1
    const duplicatedStep = {
      ...selectedStep,
      id: buildUniqueStepId(draft.content.steps),
      title: `${selectedStep.title} (Copia)`,
    }

    updateDraft((currentDraft) => {
      const nextSteps = [...currentDraft.content.steps]
      nextSteps.splice(insertIndex, 0, duplicatedStep)

      const stepNodes = currentDraft.content.nodes.filter(
        (node) => node.step === sourceStepIndex,
      )
      const lastStepNodeIndex = currentDraft.content.nodes.reduce(
        (lastIndex, node, index) => (node.step === sourceStepIndex ? index : lastIndex),
        -1,
      )

      const shiftedNodes = currentDraft.content.nodes.map((node) =>
        node.step > sourceStepIndex ? { ...node, step: node.step + 1 } : node,
      )

      const duplicatedNodes = stepNodes.map((node, index) => {
        const duplicateId = buildUniqueNodeId(
          [...shiftedNodes, ...stepNodes.slice(0, index)],
          `${node.title} copia`,
        )
        const originalPosition = currentDraft.layout.positions[node.id] ?? {
          x: 120,
          y: 520,
        }

        return {
          ...node,
          id: duplicateId,
          step: insertIndex,
          title: `${node.title} (Copia)`,
          points: [...node.points],
          scriptures: [...node.scriptures],
          _duplicatePosition: {
            x: originalPosition.x + 260,
            y: originalPosition.y + 180,
          },
        }
      })

      const nextNodes = [...shiftedNodes]
      nextNodes.splice(lastStepNodeIndex + 1, 0, ...duplicatedNodes)

      const nextLayout = syncLayoutWithNodes(nextNodes, {
        ...currentDraft.layout,
        positions: duplicatedNodes.reduce(
          (positions, node) => ({
            ...positions,
            [node.id]: node._duplicatePosition,
          }),
          { ...currentDraft.layout.positions },
        ),
      })

      return {
        content: {
          ...currentDraft.content,
          steps: nextSteps,
          nodes: nextNodes.map((node) => {
            const cleanNode = { ...node }
            delete cleanNode._duplicatePosition
            return cleanNode
          }),
        },
        layout: nextLayout,
      }
    })

    setStatusMessage('Etapa duplicada com seus cards.')
  }

  const handleDeleteStep = () => {
    if (!selectedStep || draft.content.steps.length === 1) {
      setStatusMessage('A aula precisa manter pelo menos uma etapa.')
      return
    }

    const stepIndexToDelete = selectedNode?.step ?? 0
    const fallbackStepIndex = stepIndexToDelete > 0 ? stepIndexToDelete - 1 : 0

    if (!window.confirm(`Excluir a etapa "${selectedStep.title}"?`)) {
      return
    }

    updateDraft((currentDraft) => {
      const nextSteps = currentDraft.content.steps.filter(
        (_, index) => index !== stepIndexToDelete,
      )

      const nextNodes = currentDraft.content.nodes.map((node) => {
        if (node.step === stepIndexToDelete) {
          return {
            ...node,
            step: fallbackStepIndex,
          }
        }

        if (node.step > stepIndexToDelete) {
          return {
            ...node,
            step: node.step - 1,
          }
        }

        return node
      })

      return {
        content: {
          ...currentDraft.content,
          steps: nextSteps,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    const fallbackNode =
      draft.content.nodes.find((node) => node.step === fallbackStepIndex) ??
      draft.content.nodes[0]

    setSelectedNodeId(fallbackNode?.id ?? null)
    setStatusMessage('Etapa excluida e cards redistribuidos.')
  }

  const handleMoveStep = (direction) => {
    if (!selectedStep) {
      return
    }

    const targetIndex = selectedStepIndex + direction

    if (targetIndex < 0 || targetIndex >= draft.content.steps.length) {
      return
    }

    updateDraft((currentDraft) => {
      const nextSteps = swapItems(
        currentDraft.content.steps,
        selectedStepIndex,
        targetIndex,
      )

      const nextNodes = currentDraft.content.nodes.map((node) => {
        if (node.step === selectedStepIndex) {
          return { ...node, step: targetIndex }
        }

        if (node.step === targetIndex) {
          return { ...node, step: selectedStepIndex }
        }

        return node
      })

      return {
        content: {
          ...currentDraft.content,
          steps: nextSteps,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setStatusMessage(
      direction < 0 ? 'Etapa movida para cima.' : 'Etapa movida para baixo.',
    )
  }

  const updateNode = (nodeId, field, value) => {
    updateDraft((currentDraft) => {
      const nextNodes = currentDraft.content.nodes.map((node) =>
        node.id === nodeId ? { ...node, [field]: value } : node,
      )

      return {
        ...currentDraft,
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })
  }

  const updateNodePosition = (nodeId, position) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      layout: {
        ...currentDraft.layout,
        positions: {
          ...currentDraft.layout.positions,
          [nodeId]: position,
        },
      },
    }))
  }

  const handleCreateNode = () => {
    const referenceNode =
      selectedNode ?? draft.content.nodes[draft.content.nodes.length - 1]
    const insertIndex = selectedNode
      ? draft.content.nodes.findIndex((node) => node.id === selectedNode.id) + 1
      : draft.content.nodes.length
    const newTitle = 'Novo card'
    const newNodeId = buildUniqueNodeId(draft.content.nodes, newTitle)
    const basePosition = referenceNode
      ? draft.layout.positions[referenceNode.id] ?? { x: 120, y: 520 }
      : { x: 120, y: 520 }
    const newNode = {
      id: newNodeId,
      step: referenceNode?.step ?? 0,
      title: newTitle,
      summary: 'Resumo do novo card.',
      points: ['Ponto principal 1', 'Ponto principal 2'],
      scriptures: [],
      tone: referenceNode?.tone ?? 'sun',
    }

    updateDraft((currentDraft) => {
      const nextNodes = [...currentDraft.content.nodes]
      nextNodes.splice(insertIndex, 0, newNode)

      return {
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, {
          ...currentDraft.layout,
          positions: {
            ...currentDraft.layout.positions,
            [newNodeId]: {
              x: basePosition.x + 420,
              y: basePosition.y + 120,
            },
          },
        }),
      }
    })

    setSelectedNodeId(newNodeId)
    setStatusMessage('Novo card criado.')
  }

  const handleDuplicateNode = () => {
    if (!selectedNode) {
      return
    }

    const insertIndex =
      draft.content.nodes.findIndex((node) => node.id === selectedNode.id) + 1
    const duplicatedNodeId = buildUniqueNodeId(
      draft.content.nodes,
      `${selectedNode.title} copia`,
    )
    const sourcePosition = draft.layout.positions[selectedNode.id] ?? {
      x: 120,
      y: 520,
    }
    const duplicatedNode = {
      ...selectedNode,
      id: duplicatedNodeId,
      title: `${selectedNode.title} (Cópia)`,
      points: [...selectedNode.points],
      scriptures: [...selectedNode.scriptures],
    }

    updateDraft((currentDraft) => {
      const nextNodes = [...currentDraft.content.nodes]
      nextNodes.splice(insertIndex, 0, duplicatedNode)

      return {
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, {
          ...currentDraft.layout,
          positions: {
            ...currentDraft.layout.positions,
            [duplicatedNodeId]: {
              x: sourcePosition.x + 420,
              y: sourcePosition.y,
            },
          },
        }),
      }
    })

    setSelectedNodeId(duplicatedNodeId)
    setStatusMessage('Card duplicado.')
  }

  const handleDeleteNode = () => {
    if (!selectedNode || draft.content.nodes.length === 1) {
      setStatusMessage('A aula precisa manter pelo menos um card.')
      return
    }

    if (!window.confirm(`Excluir o card "${selectedNode.title}"?`)) {
      return
    }

    const selectedIndex = draft.content.nodes.findIndex(
      (node) => node.id === selectedNode.id,
    )
    const fallbackNode =
      draft.content.nodes[selectedIndex + 1] ??
      draft.content.nodes[selectedIndex - 1] ??
      draft.content.nodes[0]

    updateDraft((currentDraft) => {
      const nextNodes = currentDraft.content.nodes.filter(
        (node) => node.id !== selectedNode.id,
      )

      return {
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setSelectedNodeId(fallbackNode?.id ?? null)
    setStatusMessage('Card excluído.')
  }

  const handleMoveNode = (direction) => {
    if (selectedNodeIndex === -1) {
      return
    }

    const targetIndex = selectedNodeIndex + direction

    if (targetIndex < 0 || targetIndex >= draft.content.nodes.length) {
      return
    }

    updateDraft((currentDraft) => {
      const nextNodes = swapItems(
        currentDraft.content.nodes,
        selectedNodeIndex,
        targetIndex,
      )

      return {
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setStatusMessage(
      direction < 0 ? 'Card movido para cima.' : 'Card movido para baixo.',
    )
  }

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatusMessage(`${label} copiado para a área de transferência.`)
    } catch {
      setStatusMessage(`Não consegui copiar ${label.toLowerCase()} automaticamente.`)
    }
  }

  const handleDownload = (filename, text) => {
    const blob = new Blob([text], { type: 'text/javascript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage(`${filename} baixado.`)
  }

  const handleSaveDraft = () => {
    onSaveDraft(draft)
    setStatusMessage('Rascunho salvo neste navegador.')
  }

  const handleRestoreSavedDraft = () => {
    const restored = onRestoreSavedDraft()
    setStatusMessage(
      restored
        ? 'Último rascunho salvo restaurado.'
        : 'Não existe rascunho salvo para esta aula.',
    )
  }

  const handleResetDraft = () => {
    onResetDraft()
    setStatusMessage('Editor restaurado para a versão original da aula.')
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__copy">
          <button type="button" className="back-link" onClick={onBack}>
            Voltar para o catálogo
          </button>
          <span className="eyebrow">Editor visual da aula</span>
          <h1>{draft.content.meta.title}</h1>
          <p>
            Ajuste texto, etapas e posições do mapa visualmente. O modo
            apresentação continua separado e você pode abrir a prévia a qualquer
            momento.
          </p>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleSaveDraft}
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={handleRestoreSavedDraft}
          >
            Restaurar último salvo
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={handleResetDraft}
          >
            Voltar ao original
          </button>
          <button type="button" className="toolbar-button" onClick={onPreview}>
            Visualizar aula
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => handleCopy(contentExport, 'Conteúdo')}
          >
            Copiar conteúdo
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => handleCopy(layoutExport, 'Layout')}
          >
            Copiar layout
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => handleDownload('mordomiaContent.js', contentExport)}
          >
            Baixar conteúdo
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => handleDownload('mordomiaLayout.js', layoutExport)}
          >
            Baixar layout
          </button>
        </div>
      </header>

      {statusMessage ? <p className="admin-status">{statusMessage}</p> : null}

      <section className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="admin-card">
            <div className="admin-card__header">
              <strong>Aula</strong>
              <span>{lessonEntry.category}</span>
            </div>

            <label className="admin-field">
              <span>Título</span>
              <input
                value={draft.content.meta.title}
                onChange={(event) => updateMeta('title', event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Descrição</span>
              <textarea
                rows={4}
                value={draft.content.meta.description}
                onChange={(event) => updateMeta('description', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <strong>Etapas</strong>
              <span>{draft.content.steps.length}</span>
            </div>

            <div className="admin-card__actions">
              <button
                type="button"
                className="toolbar-button"
                onClick={() => handleMoveStep(-1)}
                disabled={selectedStepIndex <= 0}
              >
                Subir etapa
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={() => handleMoveStep(1)}
                disabled={selectedStepIndex >= draft.content.steps.length - 1}
              >
                Descer etapa
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={handleCreateStep}
              >
                Nova etapa
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={handleDuplicateStep}
                disabled={!selectedStep}
              >
                Duplicar etapa
              </button>
              <button
                type="button"
                className="ghost-button admin-danger-button"
                onClick={handleDeleteStep}
                disabled={!selectedStep}
              >
                Excluir etapa
              </button>
            </div>

            <div className="admin-step-list">
              {draft.content.steps.map((step, index) => {
                const isCurrent = index === selectedNode?.step

                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`admin-step-item ${isCurrent ? 'admin-step-item--active' : ''}`}
                    onClick={() => {
                      const firstNodeInStep = draft.content.nodes.find(
                        (node) => node.step === index,
                      )

                      if (firstNodeInStep) {
                        setSelectedNodeId(firstNodeInStep.id)
                      }
                    }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{step.title}</strong>
                    <small>{step.summary}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <strong>Cards</strong>
              <span>{draft.content.nodes.length}</span>
            </div>

            <div className="admin-card__actions">
              <button
                type="button"
                className="toolbar-button"
                onClick={handleCreateNode}
              >
                Novo card
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={handleDuplicateNode}
                disabled={!selectedNode}
              >
                Duplicar
              </button>
            </div>

            <div className="admin-node-list">
              {draft.content.nodes.map((node, index) => (
                <button
                  key={node.id}
                  type="button"
                  className={`admin-node-item ${node.id === effectiveSelectedNodeId ? 'admin-node-item--active' : ''}`}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <span className={`admin-node-item__tone admin-node-item__tone--${node.tone}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <strong>{node.title}</strong>
                    <small>{draft.content.steps[node.step]?.title}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="admin-canvas-panel">
          <div className="canvas-frame admin-canvas-frame">
            <ReactFlowProvider>
              <AdminCanvas
                nodes={adminNodes}
                edges={adminEdges}
                selectedNodeId={effectiveSelectedNodeId}
                onNodeSelect={setSelectedNodeId}
                onNodePositionChange={updateNodePosition}
              />
            </ReactFlowProvider>
          </div>
        </section>

        <aside className="admin-inspector">
          {selectedNode && selectedStep ? (
            <>
              <div className="admin-card">
                <div className="admin-card__header">
                  <strong>Etapa do card</strong>
                  <span>{selectedStep.id}</span>
                </div>

                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => handleMoveStep(-1)}
                    disabled={selectedStepIndex <= 0}
                  >
                    Subir etapa
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => handleMoveStep(1)}
                    disabled={selectedStepIndex >= draft.content.steps.length - 1}
                  >
                    Descer etapa
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleCreateStep}
                  >
                    Nova etapa apos esta
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleDuplicateStep}
                  >
                    Duplicar etapa
                  </button>
                  <button
                    type="button"
                    className="ghost-button admin-danger-button"
                    onClick={handleDeleteStep}
                  >
                    Excluir etapa
                  </button>
                </div>

                <label className="admin-field">
                  <span>Título da etapa</span>
                  <input
                    value={selectedStep.title}
                    onChange={(event) =>
                      updateStep(selectedNode.step, 'title', event.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Resumo da etapa</span>
                  <textarea
                    rows={3}
                    value={selectedStep.summary}
                    onChange={(event) =>
                      updateStep(selectedNode.step, 'summary', event.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Foco da etapa</span>
                  <textarea
                    rows={3}
                    value={selectedStep.focus}
                    onChange={(event) =>
                      updateStep(selectedNode.step, 'focus', event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="admin-card">
                <div className="admin-card__header">
                  <strong>Card selecionado</strong>
                  <span>{selectedNode.id}</span>
                </div>

                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => handleMoveNode(-1)}
                    disabled={selectedNodeIndex <= 0}
                  >
                    Subir card
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => handleMoveNode(1)}
                    disabled={selectedNodeIndex >= draft.content.nodes.length - 1}
                  >
                    Descer card
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleCreateNode}
                  >
                    Novo após este
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleDuplicateNode}
                  >
                    Duplicar card
                  </button>
                  <button
                    type="button"
                    className="ghost-button admin-danger-button"
                    onClick={handleDeleteNode}
                  >
                    Excluir card
                  </button>
                </div>

                <label className="admin-field">
                  <span>Título</span>
                  <input
                    value={selectedNode.title}
                    onChange={(event) =>
                      updateNode(selectedNode.id, 'title', event.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Resumo</span>
                  <textarea
                    rows={4}
                    value={selectedNode.summary}
                    onChange={(event) =>
                      updateNode(selectedNode.id, 'summary', event.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Etapa</span>
                  <select
                    value={selectedNode.step}
                    onChange={(event) =>
                      updateNode(selectedNode.id, 'step', Number(event.target.value))
                    }
                  >
                    {draft.content.steps.map((step, index) => (
                      <option key={step.id} value={index}>
                        {String(index + 1).padStart(2, '0')} - {step.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>Tonalidade</span>
                  <select
                    value={selectedNode.tone}
                    onChange={(event) =>
                      updateNode(selectedNode.id, 'tone', event.target.value)
                    }
                  >
                    <option value="sun">Sun</option>
                    <option value="sky">Sky</option>
                    <option value="mint">Mint</option>
                    <option value="rose">Rose</option>
                  </select>
                </label>

                <div className="admin-grid">
                  <label className="admin-field">
                    <span>Posição X</span>
                    <input
                      type="number"
                      value={draft.layout.positions[selectedNode.id]?.x ?? 0}
                      onChange={(event) =>
                        updateNodePosition(selectedNode.id, {
                          x: Number(event.target.value),
                          y: draft.layout.positions[selectedNode.id]?.y ?? 0,
                        })
                      }
                    />
                  </label>

                  <label className="admin-field">
                    <span>Posição Y</span>
                    <input
                      type="number"
                      value={draft.layout.positions[selectedNode.id]?.y ?? 0}
                      onChange={(event) =>
                        updateNodePosition(selectedNode.id, {
                          x: draft.layout.positions[selectedNode.id]?.x ?? 0,
                          y: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Pontos principais</span>
                  <textarea
                    rows={6}
                    value={selectedNode.points.join('\n')}
                    onChange={(event) =>
                      updateNode(
                        selectedNode.id,
                        'points',
                        splitTextareaList(event.target.value),
                      )
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Versículos</span>
                  <textarea
                    rows={8}
                    value={selectedNode.scriptures.join('\n')}
                    onChange={(event) =>
                      updateNode(
                        selectedNode.id,
                        'scriptures',
                        splitTextareaList(event.target.value),
                      )
                    }
                  />
                </label>
              </div>

              <div className="admin-card">
                <div className="admin-card__header">
                  <strong>Exportação</strong>
                  <span>Arquivos prontos</span>
                </div>

                <label className="admin-field">
                  <span>mordomiaContent.js</span>
                  <textarea rows={8} readOnly value={contentExport} />
                </label>

                <label className="admin-field">
                  <span>mordomiaLayout.js</span>
                  <textarea rows={8} readOnly value={layoutExport} />
                </label>
              </div>
            </>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
