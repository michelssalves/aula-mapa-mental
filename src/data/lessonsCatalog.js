import { lessonBlueprint as mordomiaLesson } from './lessonBlueprint'
import { mordomiaContent } from './lessons/mordomiaContent'
import { mordomiaLayout } from './lessons/mordomiaLayout'

export const lessonsCatalog = [
  {
    id: 'mordomia-dizimo-contribuicao',
    accent: 'amber',
    category: 'Estudo bíblico',
    audience: 'Adultos e liderança',
    duration: '12 blocos',
    blueprint: mordomiaLesson,
    source: {
      content: mordomiaContent,
      layout: mordomiaLayout,
    },
  },
]
