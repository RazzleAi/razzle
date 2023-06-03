import { Configuration, OpenAIApi } from 'openai'

interface EmbeddingResult {
  embedding: number[]
  sentence: string
}

export class EmbeddingService {
  openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_KEY,
    })
  )

  async getEmbeddings(sentences: string[]): Promise<EmbeddingResult[]> {
    const sendtenceAndEmbeddings = await Promise.all(
      sentences.map(async (sentence) => {
        const response = await this.openai.createEmbedding({
          model: 'text-search-babbage-query-001',
          input: sentence,
        })

        const embedding = response?.data?.data[0].embedding

        return {
          sentence,
          embedding: embedding ?? [],
        }
      })
    )

    return sendtenceAndEmbeddings
  }
}
