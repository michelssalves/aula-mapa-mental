import { buildLessonBlueprint } from './buildLessonBlueprint'
import { mordomiaContent } from './lessons/mordomiaContent'
import { mordomiaLayout } from './lessons/mordomiaLayout'

export const lessonBlueprint = buildLessonBlueprint(
  mordomiaContent,
  mordomiaLayout,
)
