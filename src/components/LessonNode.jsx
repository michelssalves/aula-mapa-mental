import { Handle, Position } from '@xyflow/react'
import { renderHighlightedText } from '../utils/lessonUtils'

export function LessonNode({ data }) {
  return (
    <article
      className={`lesson-node lesson-node--${data.tone} ${data.isActiveStep ? 'lesson-node--active-step' : ''} ${data.isSelected ? 'lesson-node--selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="lesson-node__handle" />
      <div className="lesson-node__topline">
        <span className="lesson-node__tag">{data.tag}</span>
        {data.isActiveStep ? (
          <span className="lesson-node__focus-badge">Em foco</span>
        ) : null}
      </div>
      <h3>{data.title}</h3>
      {data.summary ? (
        <p className="lesson-node__summary">{renderHighlightedText(data.summary)}</p>
      ) : null}

      {data.previewPoints?.length ? (
        <ul className="lesson-node__list">
          {data.previewPoints.map((point) => (
            <li key={point}>{renderHighlightedText(point)}</li>
          ))}
        </ul>
      ) : null}
      <Handle type="source" position={Position.Right} className="lesson-node__handle" />
    </article>
  )
}
