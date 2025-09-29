import { useState } from 'react'
import './App.css'

interface Quote {
  text: string
  author: string
}

function App() {
  const [topic, setTopic] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuote = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError(null)
    setQuote(null)

    try {
      const response = await fetch('https://api.subscribe.dev/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUBSCRIBE_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a creative quote generator. Generate an inspiring, thought-provoking, or witty quote about the given topic. Format your response as JSON with "text" and "author" fields. The author can be real or fictional, but should match the style of the quote.'
            },
            {
              role: 'user',
              content: `Generate an epic quote about: ${topic}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const parsedQuote = JSON.parse(content)

      setQuote({
        text: parsedQuote.text || parsedQuote.quote || '',
        author: parsedQuote.author || 'Anonymous'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quote')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      generateQuote()
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Epic Quote Generator</h1>
        <p className="subtitle">Generate inspiring quotes using AI</p>

        <div className="input-group">
          <input
            type="text"
            className="topic-input"
            placeholder="Enter a topic (e.g., courage, innovation, life)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            aria-label="Quote topic"
          />
          <button
            className="generate-btn"
            onClick={generateQuote}
            disabled={loading}
            aria-label="Generate quote"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {quote && (
          <div className="quote-card">
            <div className="quote-mark">"</div>
            <p className="quote-text">{quote.text}</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        )}

        {!quote && !error && !loading && (
          <div className="placeholder">
            <p>Enter a topic and click Generate to create an epic quote</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
