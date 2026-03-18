export function buildLessonBlueprint(content, layout) {
  const nodes = content.nodes.map((node) => ({
    ...node,
    position: layout.positions[node.id],
  }))

  return {
    meta: content.meta,
    steps: content.steps,
    nodes,
    edges: layout.edges,
  }
}
