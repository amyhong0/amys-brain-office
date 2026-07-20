import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const numResults = parseInt(searchParams.get('num') || '5')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    // Using a free search API (DuckDuckGo Instant Answer API)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`
    )
    const data = await response.json()

    // Format results
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

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
