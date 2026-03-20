export const defaultHighlightTerms = [
  'Deus',
  'Senhor',
  'Cristo',
  'Jesus',
  'mordomo',
  'mordomia',
  'd\u00EDzimo',
  'contribui\u00E7\u00E3o',
  'oferta',
  'ofertas',
  'Lei',
  'Novo Testamento',
  'igreja primitiva',
  'cora\u00E7\u00E3o',
  'generosidade',
  'fidelidade',
  'justi\u00E7a',
  'miseric\u00F3rdia',
  'f\u00E9',
  'levitas',
  'levita',
  'sacerdotes',
  'templo',
  'tabern\u00E1culo',
  'resumo',
]

export const toneEdgeColors = {
  sun: '#d18817',
  sky: '#3a7bd5',
  mint: '#149f6a',
  rose: '#c45c47',
}

export function buildHighlightTerms(customTerms = []) {
  const normalizedTerms = [...defaultHighlightTerms, ...customTerms]
    .map((term) => String(term ?? '').trim())
    .filter(Boolean)

  return [...new Set(normalizedTerms)]
}

function buildHighlightPattern(highlightTerms) {
  if (!highlightTerms.length) {
    return null
  }

  return new RegExp(
    `(${highlightTerms
      .sort((a, b) => b.length - a.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})`,
    'gi',
  )
}

export function renderHighlightedText(text, customTerms = []) {
  const scriptureMatch = text.match(/^(.+?\d+:\d+(?:-\d+)?)\s+[\u2014-]\s+(.+)$/)
  const highlightTerms = buildHighlightTerms(customTerms)
  const highlightPattern = buildHighlightPattern(highlightTerms)

  if (scriptureMatch) {
    return (
      <>
        <strong>{scriptureMatch[1]}</strong>
        {' \u2014 '}
        {renderHighlightedText(scriptureMatch[2], customTerms)}
      </>
    )
  }

  if (!highlightPattern) {
    return text
  }

  const parts = text.split(highlightPattern)

  return parts.map((part, index) => {
    if (!part) {
      return null
    }

    const isHighlight = highlightTerms.some(
      (term) => term.toLowerCase() === part.toLowerCase(),
    )

    return isHighlight ? <strong key={`${part}-${index}`}>{part}</strong> : part
  })
}
