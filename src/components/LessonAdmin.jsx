import {
  applyNodeChanges,
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'
import { toneEdgeColors } from '../utils/lessonUtils'
import { createDraft, loadPublishMeta, savePublishMeta } from '../utils/editorUtils'
import { LessonNode } from './LessonNode'

const nodeTypes = {
  lessonNode: LessonNode,
}

function Icon({ children }) {
  return (
    <span className="icon-button__glyph" aria-hidden="true">
      {children}
    </span>
  )
}

function IconButton({
  label,
  children,
  className = '',
  title,
  variant = 'default',
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      className={`icon-button icon-button--${variant} ${className}`.trim()}
      {...props}
    >
      <Icon>{children}</Icon>
    </button>
  )
}

function ActionGroup({ label, children, className = '' }) {
  return (
    <div className={`admin-action-group ${className}`.trim()}>
      <span className="admin-action-group__label">{label}</span>
      <div className="admin-action-group__buttons">{children}</div>
    </div>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 18V6" strokeLinecap="round" />
      <path d="m7 11 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 6v12" strokeLinecap="round" />
      <path d="m17 13-5 5-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      <path d="M6 7l1 11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4Z" strokeLinejoin="round" />
      <path d="M8 4v5h8V6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20v-6h8v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M20 11a8 8 0 1 0 2 5.5" strokeLinecap="round" />
      <path d="M20 5v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 4v11" strokeLinecap="round" />
      <path d="m7 11 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" strokeLinecap="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5" strokeLinejoin="round" />
      <path d="M5 4.5v17" strokeLinecap="round" />
      <path d="M9 6h6" strokeLinecap="round" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="m12 4 8 4-8 4-8-4 8-4Z" strokeLinejoin="round" />
      <path d="m4 12 8 4 8-4" strokeLinejoin="round" />
      <path d="m4 16 8 4 8-4" strokeLinejoin="round" />
    </svg>
  )
}

function CardStackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="5" y="7" width="14" height="10" rx="2" />
      <path d="M8 4h8a2 2 0 0 1 2 2" strokeLinecap="round" />
      <path d="M8 20h8a2 2 0 0 0 2-2" strokeLinecap="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" strokeLinejoin="round" />
      <path d="m13.5 6.5 3.5 3.5" strokeLinecap="round" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="m8 7 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" />
    </svg>
  )
}

function SectionTitle({ icon, children, tone = 'default' }) {
  return (
    <span className={`admin-section-title admin-section-title--${tone}`}>
      <span className="admin-section-title__icon" aria-hidden="true">
        {icon}
      </span>
      <strong>{children}</strong>
    </span>
  )
}

function FoldSection({ title, children, defaultOpen = true }) {
  return (
    <details className="admin-fold" open={defaultOpen}>
      <summary className="admin-fold__summary">{title}</summary>
      <div className="admin-fold__body">{children}</div>
    </details>
  )
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

function moveItem(list, fromIndex, toIndex) {
  const nextList = [...list]
  const [item] = nextList.splice(fromIndex, 1)
  nextList.splice(toIndex, 0, item)
  return nextList
}

function splitTextareaList(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDateTime(value) {
  if (!value) {
    return 'Ainda nao registrado'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Ainda nao registrado'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function buildDraftSignature(draft) {
  return JSON.stringify({
    content: draft.content,
    layout: draft.layout,
  })
}

function serializeModuleExport(exportName, value) {
  return `export const ${exportName} = ${JSON.stringify(value, null, 2)}\n`
}

function findFirstNodeInStep(nodes, stepIndex) {
  return nodes.find((node) => node.step === stepIndex) ?? null
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
  onRestoreSavedDraft,
  onResetDraft,
  onSaveToRepo,
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(
    draft.content.nodes[0]?.id ?? null,
  )
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState('success')
  const [draggedStepIndex, setDraggedStepIndex] = useState(null)
  const [draggedNodeIndex, setDraggedNodeIndex] = useState(null)
  const [stepSearch, setStepSearch] = useState('')
  const [nodeSearch, setNodeSearch] = useState('')
  const [isSavingToRepo, setIsSavingToRepo] = useState(false)
  const [lastPublishedMeta, setLastPublishedMeta] = useState(() =>
    loadPublishMeta(lessonEntry.id),
  )
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
  const normalizedStepSearch = stepSearch.trim().toLowerCase()
  const normalizedNodeSearch = nodeSearch.trim().toLowerCase()
  const visibleSteps = draft.content.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => {
      if (!normalizedStepSearch) {
        return true
      }

      return `${step.title} ${step.summary} ${step.focus}`
        .toLowerCase()
        .includes(normalizedStepSearch)
    })
  const visibleNodes = draft.content.nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => {
      if (!normalizedNodeSearch) {
        return true
      }

      return [
        node.title,
        node.summary,
        draft.content.steps[node.step]?.title ?? '',
        ...(node.points ?? []),
        ...(node.scriptures ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedNodeSearch)
    })

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
  const currentDraftSignature = useMemo(() => buildDraftSignature(draft), [draft])
  const publishedSignature =
    lastPublishedMeta?.signature ?? buildDraftSignature(createDraft(lessonEntry.source))
  const hasPendingChanges = currentDraftSignature !== publishedSignature
  const previewHref = `${window.location.origin}${window.location.pathname}#/aula/${lessonEntry.id}`

  useEffect(() => {
    setLastPublishedMeta(loadPublishMeta(lessonEntry.id))
  }, [lessonEntry.id])

  const updateDraft = (updater) => {
    onDraftChange(updater(draft))
  }

  const focusStep = (stepIndex) => {
    const firstNodeInStep = findFirstNodeInStep(draft.content.nodes, stepIndex)

    if (firstNodeInStep) {
      setSelectedNodeId(firstNodeInStep.id)
    }
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

  const handleCreateStep = (referenceStepIndex = selectedNode?.step ?? draft.content.steps.length - 1) => {
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

  const handleDuplicateStep = (sourceStepIndex = selectedNode?.step ?? 0) => {
    const sourceStep = draft.content.steps[sourceStepIndex]

    if (!sourceStep) {
      return
    }
    const insertIndex = sourceStepIndex + 1
    const duplicatedStep = {
      ...sourceStep,
      id: buildUniqueStepId(draft.content.steps),
      title: `${sourceStep.title} (Copia)`,
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

  const handleMoveStepToIndex = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= draft.content.steps.length ||
      toIndex >= draft.content.steps.length
    ) {
      return
    }

    updateDraft((currentDraft) => {
      const originalIndexes = currentDraft.content.steps.map((_, index) => index)
      const reorderedIndexes = moveItem(originalIndexes, fromIndex, toIndex)
      const nextSteps = moveItem(currentDraft.content.steps, fromIndex, toIndex)
      const stepIndexMap = {}

      reorderedIndexes.forEach((oldIndex, newIndex) => {
        stepIndexMap[oldIndex] = newIndex
      })

      const nextNodes = currentDraft.content.nodes.map((node) => ({
        ...node,
        step: stepIndexMap[node.step] ?? node.step,
      }))

      return {
        content: {
          ...currentDraft.content,
          steps: nextSteps,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setStatusMessage('Etapa reposicionada na lista.')
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

  const handleCreateNode = (referenceNodeId = selectedNode?.id ?? null) => {
    const referenceNode = referenceNodeId
      ? draft.content.nodes.find((node) => node.id === referenceNodeId)
      : draft.content.nodes[draft.content.nodes.length - 1]
    const insertIndex = referenceNode
      ? draft.content.nodes.findIndex((node) => node.id === referenceNode.id) + 1
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

  const handleDuplicateNode = (sourceNodeId = selectedNode?.id ?? null) => {
    const sourceNode = sourceNodeId
      ? draft.content.nodes.find((node) => node.id === sourceNodeId)
      : null

    if (!sourceNode) {
      return
    }

    const insertIndex =
      draft.content.nodes.findIndex((node) => node.id === sourceNode.id) + 1
    const duplicatedNodeId = buildUniqueNodeId(
      draft.content.nodes,
            
`${sourceNode.title} copia`,
    )
    const sourcePosition = draft.layout.positions[sourceNode.id] ?? {
      x: 120,
      y: 520,
    }
    const duplicatedNode = {
      ...sourceNode,
      id: duplicatedNodeId,
      title: `${sourceNode.title} (Copia)`,
      points: [...sourceNode.points],
      scriptures: [...sourceNode.scriptures],
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
    setStatusMessage('Card excluÃ­do.')
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

  const handleMoveNodeToIndex = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= draft.content.nodes.length ||
      toIndex >= draft.content.nodes.length
    ) {
      return
    }

    updateDraft((currentDraft) => {
      const nextNodes = moveItem(currentDraft.content.nodes, fromIndex, toIndex)

      return {
        content: {
          ...currentDraft.content,
          nodes: nextNodes,
        },
        layout: syncLayoutWithNodes(nextNodes, currentDraft.layout),
      }
    })

    setStatusMessage('Card reposicionado na lista.')
  }

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatusTone('success')
      setStatusMessage(`${label} copiado para a Ã¡rea de transferÃªncia.`)
    } catch {
      setStatusTone('warning')
      setStatusMessage(`NÃ£o consegui copiar ${label.toLowerCase()} automaticamente.`)
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
    setStatusTone('success')
    setStatusMessage(`${filename} baixado.`)
  }

  const handleRestoreSavedDraft = () => {
    const restored = onRestoreSavedDraft()
    setStatusTone(restored ? 'success' : 'warning')
    setStatusMessage(
      restored
        ? 'Ultimo rascunho salvo restaurado.'
        : 'Nao existe rascunho salvo para esta aula.',
    )
  }

  const handleResetDraft = () => {
    onResetDraft()
    setStatusTone('warning')
    setStatusMessage('Editor restaurado para a versao original da aula.')
  }

  const handleSaveToRepo = async () => {
    if (!onSaveToRepo) {
      setStatusTone('warning')
      setStatusMessage('Publicacao remota nao configurada para esta aula.')
      return
    }

    try {
      setIsSavingToRepo(true)
      setStatusTone('info')
      setStatusMessage('Publicando alteracoes ao vivo...')
      const result = await onSaveToRepo(draft)
      const publishMeta = {
        savedAt: result?.savedAt ?? new Date().toISOString(),
        branch: result?.branch ?? 'master',
        commitSha: result?.commitSha ?? null,
        commitUrl: result?.commitUrl ?? null,
        source: result?.source ?? 'd1',
        signature: currentDraftSignature,
      }
      savePublishMeta(lessonEntry.id, publishMeta)
      setLastPublishedMeta(publishMeta)
      setStatusTone('success')
      setStatusMessage(result?.message ?? 'Alteracoes publicadas com sucesso.')
    } catch (error) {
      setStatusTone('danger')
      setStatusMessage(error.message)
    } finally {
      setIsSavingToRepo(false)
    }
  }

  const handleOpenPreviewInNewTab = () => {
    window.open(previewHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__copy">
          <div className="admin-header__eyebrows">
            <button type="button" className="back-link back-link--eyebrow" onClick={onBack}>
              <span className="eyebrow">Home</span>
            </button>
            <span className="eyebrow">Editor visual da aula</span>
          </div>
          <div className="admin-header__headline">
            <h1>{draft.content.meta.title}</h1>
            <div className="admin-header__meta-inline">
              <span className={`admin-meta-state ${hasPendingChanges ? 'admin-meta-state--warning' : 'admin-meta-state--success'}`}>
                {hasPendingChanges ? 'Alteracoes pendentes' : 'Publicado'}
              </span>
              <span className="admin-header__meta-chip admin-header__meta-chip--publish">
                {lastPublishedMeta?.savedAt
                  ? `Publicado ${formatDateTime(lastPublishedMeta.savedAt)}`
                  : 'Ainda nao publicado'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {statusMessage ? (
        <div className={`admin-status admin-status--${statusTone}`}>
          <strong>{statusTone === 'success' ? 'Tudo certo' : statusTone === 'danger' ? 'Algo bloqueou a publicacao' : statusTone === 'info' ? 'Publicando' : 'Atencao'}</strong>
          <span>{statusMessage}</span>
          {statusTone === 'success' && !hasPendingChanges ? (
            <div className="admin-status__actions">
              <button type="button" className="admin-status__button" onClick={() => window.location.reload()}>
                Atualizar agora
              </button>
              <button type="button" className="admin-status__button admin-status__button--ghost" onClick={handleOpenPreviewInNewTab}>
                Abrir apresentacao
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="admin-card">
            <div className="admin-card__header">
              <SectionTitle icon={<BookIcon />} tone="amber">Aula</SectionTitle>
              <span>{lessonEntry.category}</span>
            </div>

            <FoldSection title="Identidade da aula">
              <label className="admin-field">
                <span>Titulo</span>
                <input
                  value={draft.content.meta.title}
                  onChange={(event) => updateMeta('title', event.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Descricao</span>
                <textarea
                  rows={4}
                  value={draft.content.meta.description}
                  onChange={(event) => updateMeta('description', event.target.value)}
                />
              </label>
            </FoldSection>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <SectionTitle icon={<CardStackIcon />} tone="green">Cards</SectionTitle>
              <span>{draft.content.nodes.length}</span>
            </div>

            <div className="admin-card__actions">
              <IconButton label="Novo card" variant="success" onClick={handleCreateNode}>
                <PlusIcon />
              </IconButton>
              <IconButton
                label="Duplicar card"
                variant="accent"
                onClick={handleDuplicateNode}
                disabled={!selectedNode}
              >
                <CopyIcon />
              </IconButton>
            </div>

            <label className="admin-field admin-field--compact">
              <span>Buscar card</span>
              <input
                value={nodeSearch}
                onChange={(event) => setNodeSearch(event.target.value)}
                placeholder="Titulo, etapa, topicos ou versiculos"
              />
            </label>

            <div className="admin-node-list">
              {visibleNodes.map(({ node, index }) => (
                <div
                  key={node.id}
                  className={`admin-list-row ${node.id === effectiveSelectedNodeId ? 'admin-list-row--active' : ''} ${draggedNodeIndex === index ? 'admin-list-row--dragging' : ''}`}
                  draggable
                  onDragStart={() => setDraggedNodeIndex(index)}
                  onDragEnd={() => setDraggedNodeIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (draggedNodeIndex !== null) {
                      handleMoveNodeToIndex(draggedNodeIndex, index)
                    }
                    setDraggedNodeIndex(null)
                  }}
                >
                  <button
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

                  <div className="admin-list-row__actions">
                    <IconButton
                      label={`Novo apos ${node.title}`}
                      variant="success"
                      className="icon-button--mini"
                      onClick={() => handleCreateNode(node.id)}
                    >
                      <PlusIcon />
                    </IconButton>
                    <IconButton
                      label={`Duplicar ${node.title}`}
                      variant="accent"
                      className="icon-button--mini"
                      onClick={() => handleDuplicateNode(node.id)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <SectionTitle icon={<LayersIcon />} tone="blue">Etapas</SectionTitle>
              <span>{draft.content.steps.length}</span>
            </div>

            <div className="admin-card__actions">
              <IconButton
                label="Subir etapa"
                variant="info"
                onClick={() => handleMoveStep(-1)}
                disabled={selectedStepIndex <= 0}
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                label="Descer etapa"
                variant="info"
                onClick={() => handleMoveStep(1)}
                disabled={selectedStepIndex >= draft.content.steps.length - 1}
              >
                <ArrowDownIcon />
              </IconButton>
              <IconButton label="Nova etapa" variant="success" onClick={handleCreateStep}>
                <PlusIcon />
              </IconButton>
              <IconButton
                label="Duplicar etapa"
                variant="accent"
                onClick={handleDuplicateStep}
                disabled={!selectedStep}
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                label="Excluir etapa"
                variant="danger"
                onClick={handleDeleteStep}
                disabled={!selectedStep}
              >
                <TrashIcon />
              </IconButton>
            </div>

            <label className="admin-field admin-field--compact">
              <span>Buscar etapa</span>
              <input
                value={stepSearch}
                onChange={(event) => setStepSearch(event.target.value)}
                placeholder="Titulo, resumo ou foco"
              />
            </label>

            <div className="admin-step-list">
              {visibleSteps.map(({ step, index }) => {
                const isCurrent = index === selectedNode?.step

                return (
                  <div
                    key={step.id}
                    className={`admin-list-row ${isCurrent ? 'admin-list-row--active' : ''} ${draggedStepIndex === index ? 'admin-list-row--dragging' : ''}`}
                    draggable
                    onDragStart={() => setDraggedStepIndex(index)}
                    onDragEnd={() => setDraggedStepIndex(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      if (draggedStepIndex !== null) {
                        handleMoveStepToIndex(draggedStepIndex, index)
                      }
                      setDraggedStepIndex(null)
                    }}
                  >
                    <button
                      type="button"
                      className={`admin-step-item ${isCurrent ? 'admin-step-item--active' : ''}`}
                      onClick={() => focusStep(index)}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{step.title}</strong>
                      <small>{step.summary}</small>
                    </button>

                    <div className="admin-list-row__actions">
                      <IconButton
                        label={`Nova etapa apos ${step.title}`}
                        variant="success"
                        className="icon-button--mini"
                        onClick={() => handleCreateStep(index)}
                      >
                        <PlusIcon />
                      </IconButton>
                      <IconButton
                        label={`Duplicar ${step.title}`}
                        variant="accent"
                        className="icon-button--mini"
                        onClick={() => handleDuplicateStep(index)}
                      >
                        <CopyIcon />
                      </IconButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="admin-canvas-panel">
          <div className="admin-canvas-toolbar">
            <ActionGroup label="Publicacao">
              <IconButton
                label="Publicar no site"
                variant="accent"
                onClick={handleSaveToRepo}
                disabled={isSavingToRepo}
              >
                <SaveIcon />
              </IconButton>
              <IconButton label="Restaurar ultimo salvo" variant="info" onClick={handleRestoreSavedDraft}>
                <RefreshIcon />
              </IconButton>
              <IconButton label="Voltar ao original" variant="warning" onClick={handleResetDraft}>
                <ResetIcon />
              </IconButton>
              <IconButton label="Abrir apresentacao em nova guia" variant="info" onClick={handleOpenPreviewInNewTab}>
                <EyeIcon />
              </IconButton>
            </ActionGroup>

            <ActionGroup label="Exportacao">
              <IconButton
                label="Copiar conteudo"
                variant="info"
                onClick={() => handleCopy(contentExport, 'Conteudo')}
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                label="Copiar layout"
                variant="info"
                onClick={() => handleCopy(layoutExport, 'Layout')}
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                label="Baixar conteudo"
                variant="accent"
                onClick={() => handleDownload('mordomiaContent.js', contentExport)}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                label="Baixar layout"
                variant="accent"
                onClick={() => handleDownload('mordomiaLayout.js', layoutExport)}
              >
                <DownloadIcon />
              </IconButton>
            </ActionGroup>
          </div>

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
                  <SectionTitle icon={<EditIcon />} tone="green">Card selecionado</SectionTitle>
                  <span>{selectedNode.id}</span>
                </div>

                <div className="admin-card__actions">
                  <IconButton
                    label="Subir card"
                    variant="info"
                    onClick={() => handleMoveNode(-1)}
                    disabled={selectedNodeIndex <= 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    label="Descer card"
                    variant="info"
                    onClick={() => handleMoveNode(1)}
                    disabled={selectedNodeIndex >= draft.content.nodes.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton label="Novo apos este" variant="success" onClick={handleCreateNode}>
                    <PlusIcon />
                  </IconButton>
                  <IconButton label="Duplicar card" variant="accent" onClick={handleDuplicateNode}>
                    <CopyIcon />
                  </IconButton>
                  <IconButton
                    label="Excluir card"
                    variant="danger"
                    onClick={handleDeleteNode}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>

                <FoldSection title="Identidade do card">
                  <label className="admin-field">
                    <span>Titulo</span>
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
                </FoldSection>

                <FoldSection title="Conteudo detalhado" defaultOpen={false}>
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
                    <span>Versiculos</span>
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
                </FoldSection>
              </div>

              <div className="admin-card">
                <div className="admin-card__header">
                  <SectionTitle icon={<LayersIcon />} tone="blue">Etapa do card</SectionTitle>
                  <span>{selectedStep.id}</span>
                </div>

                <div className="admin-card__actions">
                  <IconButton
                    label="Subir etapa"
                    variant="info"
                    onClick={() => handleMoveStep(-1)}
                    disabled={selectedStepIndex <= 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    label="Descer etapa"
                    variant="info"
                    onClick={() => handleMoveStep(1)}
                    disabled={selectedStepIndex >= draft.content.steps.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton label="Nova etapa apos esta" variant="success" onClick={handleCreateStep}>
                    <PlusIcon />
                  </IconButton>
                  <IconButton label="Duplicar etapa" variant="accent" onClick={handleDuplicateStep}>
                    <CopyIcon />
                  </IconButton>
                  <IconButton
                    label="Excluir etapa"
                    variant="danger"
                    onClick={handleDeleteStep}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>

                <FoldSection title="Texto da etapa">
                  <label className="admin-field">
                    <span>Titulo da etapa</span>
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
                </FoldSection>

                <FoldSection title="Mapa e classificacao">
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
                      <span>Posicao X</span>
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
                      <span>Posicao Y</span>
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
                </FoldSection>
              </div>

              <div className="admin-card">
                <div className="admin-card__header">
                  <SectionTitle icon={<ExportIcon />} tone="amber">Exportacao</SectionTitle>
                  <span>Arquivos prontos</span>
                </div>

                <FoldSection title="Arquivos gerados" defaultOpen={false}>
                  <label className="admin-field">
                    <span>mordomiaContent.js</span>
                    <textarea rows={8} readOnly value={contentExport} />
                  </label>

                  <label className="admin-field">
                    <span>mordomiaLayout.js</span>
                    <textarea rows={8} readOnly value={layoutExport} />
                  </label>
                </FoldSection>
              </div>
            </>
          ) : null}
        </aside>
      </section>
    </main>
  )
}

