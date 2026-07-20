// Web search tool for the agent
export async function webSearch(query: string, numResults: number = 5) {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`
    )
    const data = await response.json()

    const results = []
    
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '',
        snippet: data.AbstractText,
        source: 'DuckDuckGo'
      })
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic.Text && topic.FirstURL && results.length < numResults) {
          results.push({
            title: topic.Text,
            url: topic.FirstURL,
            snippet: topic.Text,
            source: 'DuckDuckGo'
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('Search failed')
  }
}
