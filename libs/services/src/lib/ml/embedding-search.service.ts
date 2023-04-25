import { Configuration, OpenAIApi } from 'openai'

export interface EmbeddingSentencePair {
  embedding: number[]
  sentence: string
  appId: string
  razzleAppId: string
  appName: string
  actionName: string
  actionDescription?: string
  parameters: { name: string; type: string }[]
}

export interface SentenceSimilariyPair {
  similarity: number
  sentence: string
  actionName: string
  actionDescription?: string
  appId: string
  razzleAppId: string
  appName: string
  parameters: { name: string; type: string }[]
}

export class EmbeddingSearchService {
  openai = new OpenAIApi(
    new Configuration({
      apiKey: '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', // TODO: Move to env
    })
  )

  async search(
    searchSpace: EmbeddingSentencePair[],
    searchQuery: string
  ): Promise<SentenceSimilariyPair[]> {
    const searchQueryEmbeddingResponse = await this.openai.createEmbedding({
      model: 'text-search-babbage-query-001',
      input: searchQuery,
    })

    const searchQueryEmbedding =
      searchQueryEmbeddingResponse.data.data[0].embedding

    const results = searchSpace.map((pair) => {
      const similarity = cosSimilarity(searchQueryEmbedding, pair.embedding)

      return {
        similarity,
        sentence: pair.sentence,
        actionName: pair.actionName,
        actionDescription: pair.actionDescription,
        appId: pair.appId,
        razzleAppId: pair.razzleAppId,
        appName: pair.appName,
        parameters: pair.parameters,
      }
    })

    return results
      .filter((a) => a.similarity >= 0.8)
      .sort((a, b) => b.similarity - a.similarity)
  }
}

function cosSimilarity(vectorA: number[] = [], vectorB: number[] = []) {
  const dimensionality = Math.min(vectorA.length, vectorB.length)
  let dotAB = 0
  let dotA = 0
  let dotB = 0
  let dimension = 0
  while (dimension < dimensionality) {
    const componentA = vectorA[dimension]
    const componentB = vectorB[dimension]
    dotAB += componentA * componentB
    dotA += componentA * componentA
    dotB += componentB * componentB
    dimension += 1
  }

  const magnitude = Math.sqrt(dotA * dotB)
  return magnitude === 0 ? 0 : dotAB / magnitude
}
