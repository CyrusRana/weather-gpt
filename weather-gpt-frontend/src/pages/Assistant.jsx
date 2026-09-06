import { useEffect, useRef, useState } from 'react'
import {
  Mic,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { askWeatherQuestion } from '../lib/api'


// ==========================================================
// SUPPORTED LANGUAGES
// ==========================================================

const languages = [
  {
    name: 'English',
    code: 'en-IN',
    aiName: 'English',
  },
  {
    name: 'हिंदी',
    code: 'hi-IN',
    aiName: 'Hindi',
  },
  {
    name: 'বাংলা',
    code: 'bn-IN',
    aiName: 'Bengali',
  },
  {
    name: 'தமிழ்',
    code: 'ta-IN',
    aiName: 'Tamil',
  },
  {
    name: 'తెలుగు',
    code: 'te-IN',
    aiName: 'Telugu',
  },
  {
    name: 'मराठी',
    code: 'mr-IN',
    aiName: 'Marathi',
  },
  {
    name: 'ಕನ್ನಡ',
    code: 'kn-IN',
    aiName: 'Kannada',
  },
  {
    name: 'ગુજરાતી',
    code: 'gu-IN',
    aiName: 'Gujarati',
  },
  {
    name: 'ਪੰਜਾਬੀ',
    code: 'pa-IN',
    aiName: 'Punjabi',
  },
  {
    name: 'മലയാളം',
    code: 'ml-IN',
    aiName: 'Malayalam',
  },
  {
    name: 'ଓଡ଼ିଆ',
    code: 'or-IN',
    aiName: 'Odia',
  },
]


// ==========================================================
// SUGGESTED QUESTIONS
// ==========================================================

const questions = [
  'Will it rain tomorrow?',
  'Can I travel this evening?',
  'What should I wear today?',
  'Is it safe to go outside?',
  'What is the best time for a picnic?',
  'Should I irrigate today?',
]


export default function Assistant({ location }) {

  // ========================================================
  // STATE
  // ========================================================

  const [question, setQuestion] = useState('')

  const [messages, setMessages] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const [language, setLanguage] = useState(languages[0])

  const [listening, setListening] = useState(false)

  const [speaking, setSpeaking] = useState(false)


  // ========================================================
  // SPEECH RECOGNITION REF
  // ========================================================

  const recognitionRef = useRef(null)


  // ========================================================
  // CURRENT CITY
  // ========================================================

  const city = location?.city || 'Bengaluru'


  // ========================================================
  // CHECK BROWSER SPEECH SUPPORT
  // ========================================================

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition


  // ========================================================
  // START VOICE RECOGNITION
  // ========================================================

  const startListening = () => {

    if (!SpeechRecognition) {

      setError(
        'Voice recognition is not supported in this browser. Please use Chrome or Edge.'
      )

      return

    }


    setError('')


    // Stop existing recognition

    if (recognitionRef.current) {

      recognitionRef.current.stop()

    }


    const recognition = new SpeechRecognition()


    recognition.lang = language.code

    recognition.continuous = false

    recognition.interimResults = false

    recognition.maxAlternatives = 1


    // ======================================================
    // WHEN RECOGNITION STARTS
    // ======================================================

    recognition.onstart = () => {

      setListening(true)

    }


    // ======================================================
    // WHEN SPEECH IS RECEIVED
    // ======================================================

   recognition.onresult = (event) => {

  const transcript =
    event.results[0][0].transcript

  setQuestion(transcript)

  if (transcript.trim()) {
    ask(transcript, language)
  }

}

    // ======================================================
    // RECOGNITION ENDS
    // ======================================================

    recognition.onend = () => {

      setListening(false)

    }


    // ======================================================
    // RECOGNITION ERROR
    // ======================================================

    recognition.onerror = (event) => {

      console.error(
        'Speech recognition error:',
        event.error
      )

      setListening(false)


      if (event.error === 'not-allowed') {

        setError(
          'Microphone permission was denied. Please allow microphone access.'
        )

      } else if (event.error === 'no-speech') {

        setError(
          'No speech detected. Please try speaking again.'
        )

      } else {

        setError(
          'Voice recognition failed. Please try again.'
        )

      }

    }


    recognitionRef.current = recognition

    recognition.start()

  }


  // ========================================================
  // STOP VOICE RECOGNITION
  // ========================================================

  const stopListening = () => {

    if (recognitionRef.current) {

      recognitionRef.current.stop()

    }

    setListening(false)

  }


  // ========================================================
  // MICROPHONE BUTTON
  // ========================================================

  const handleVoice = () => {

    if (listening) {

      stopListening()

    } else {

      startListening()

    }

  }


  // ========================================================
  // ASK WEATHER GPT
  // ========================================================

  const ask = async (q, selectedLanguage = language) => {

    const userQuestion = q.trim()


    if (!userQuestion || loading) {

      return

    }


    setQuestion('')

    setError('')

    setLoading(true)


    // ======================================================
    // ADD USER MESSAGE
    // ======================================================

    setMessages((previousMessages) => [

      ...previousMessages,

      {
        type: 'user',
        text: userQuestion,
      },

    ])


    try {

      // ====================================================
      // SEND TO BACKEND
      // ====================================================

      const data = await askWeatherQuestion(
        city,
        userQuestion,
        selectedLanguage.aiName
      )


      // ====================================================
      // ADD AI RESPONSE
      // ====================================================

      setMessages((previousMessages) => [

        ...previousMessages,

        {
          type: 'assistant',
          text: data.answer,
          languageCode: selectedLanguage.code,
        },

      ])


    } catch (err) {

      console.error(
        'Weather GPT request failed:',
        err
      )


      setError(
        'Unable to get a weather answer right now. Please try again.'
      )


    } finally {

      setLoading(false)

    }

  }


  // ========================================================
  // SEND BUTTON
  // ========================================================

  const handleSend = () => {

    ask(question)

  }


  // ========================================================
  // ENTER KEY
  // ========================================================

  const handleKeyDown = (event) => {

    if (event.key === 'Enter') {

      event.preventDefault()

      ask(question)

    }

  }


  // ========================================================
  // SUGGESTION
  // ========================================================

  const handleSuggestion = (q) => {

    ask(q)

  }


 

    // ========================================================
  // TEXT TO SPEECH
  // ========================================================

  const speakText = (text, selectedLanguageCode) => {

    if (!('speechSynthesis' in window)) {

      setError(
        'Text-to-speech is not supported in this browser.'
      )

      return
    }


    // Stop current speech
    window.speechSynthesis.cancel()


    // Use the language of the answer
    const speechLanguage =
      selectedLanguageCode || language.code


    // Clean AI response
    const cleanText = text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---/g, '')
      .trim()


    // Split answer line by line
    const lines = cleanText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)


    if (lines.length === 0) {
      return
    }


    


    // Speak one line at a time
    let currentLine = 0


    const speakNextLine = () => {

      if (currentLine >= lines.length) {

        setSpeaking(false)

        return
      }


      const utterance =
        new SpeechSynthesisUtterance(
          lines[currentLine]
        )


      // Use selected language
      utterance.lang = speechLanguage


      utterance.rate = 0.95

      utterance.pitch = 1

      utterance.volume = 1


      utterance.onstart = () => {

        setSpeaking(true)

      }


      // When this line finishes,
      // speak the next line
      utterance.onend = () => {

        currentLine += 1


        setTimeout(() => {

          speakNextLine()

        }, 150)

      }


      utterance.onerror = (event) => {

        console.error(
          'Text-to-speech error:',
          event
        )

        setSpeaking(false)

      }


      window.speechSynthesis.speak(
        utterance
      )

    }


    // Start speaking
    speakNextLine()

  }


  // ========================================================
  // STOP TEXT TO SPEECH
  // ========================================================

  const stopSpeaking = () => {

    if ('speechSynthesis' in window) {

      window.speechSynthesis.cancel()

    }

    setSpeaking(false)

  }


  // ========================================================
  // STOP SPEECH WHEN PAGE IS LEFT
  // ========================================================

  useEffect(() => {

    return () => {

      if (recognitionRef.current) {

        recognitionRef.current.stop()

      }


      if ('speechSynthesis' in window) {

        window.speechSynthesis.cancel()

      }

    }

  }, [])


  // ========================================================
  // UI
  // ========================================================

  return (

    <div className="page assistant-shell">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="page-heading"
        style={{
          maxWidth: 1040,
          margin: '0 auto 22px',
        }}
      >

        <div>

          <div className="eyebrow">
            DECISION ASSISTANT
          </div>

          <h1>
            Weather GPT
          </h1>

          <p className="subtitle">
            Ask about weather. Get decisions, not just data.
          </p>

        </div>

      </div>


      {/* ==================================================
          ASSISTANT CARD
      ================================================== */}

      <section className="assistant-card">


        {/* =================================================
            LANGUAGE SELECTOR
        ================================================= */}

        <div className="assistant-language-bar">

          <div className="assistant-language-info">

            <div className="assistant-language-title">

              <span className="assistant-language-icon">
                🌐
              </span>

              <div>

                <strong>
                  Voice & Language
                </strong>

                <span>
                  Speak and receive answers in your language
                </span>

              </div>

            </div>

          </div>


          <div className="assistant-language-control">

            <span>
              Language
            </span>

            <select
              value={language.code}
              onChange={(event) => {

                const selected =
                  languages.find(
                    (item) =>
                      item.code === event.target.value
                  )

                if (selected) {

                  setLanguage(selected)

                }

                setError('')

              }}
              disabled={loading || listening}
            >

              {languages.map((item) => (

                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.name}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* =================================================
            SUGGESTED QUESTIONS
        ================================================= */}

        <div className="suggestions assistant-suggestions">

          <div className="assistant-section-heading">

            <div>

              <strong>
                Suggested questions
              </strong>

              <span>
                Start with a question or ask anything about the weather
              </span>

            </div>

          </div>


          <div className="suggestion-list">

            {questions.map((q) => (

              <button
                className="suggestion"
                key={q}
                onClick={() =>
                  handleSuggestion(q)
                }
                disabled={loading}
              >
                {q}
              </button>

            ))}

          </div>

        </div>


        {/* =================================================
            CHAT BODY
        ================================================= */}

        <div className="chat-body">


          {/* =================================================
              INITIAL STATE
          ================================================= */}

          {messages.length === 0 &&
            !loading && (

              <>

                <div className="chat-row user">

                  <div className="bubble">

                    Can I go for a bike ride this evening?

                  </div>

                </div>


                <div className="chat-row">

                  <div className="avatar">

                    <Sparkles size={17} />

                  </div>


                  <div className="bubble">

                    Ask me anything about the weather in{' '}

                    <strong>
                      {city}
                    </strong>

                    .

                  </div>

                </div>

              </>

            )}


          {/* =================================================
              MESSAGES
          ================================================= */}

          {messages.map(
            (message, index) => (

              <div
                className={
                  message.type === 'user'
                    ? 'chat-row user'
                    : 'chat-row'
                }
                key={index}
              >


                {message.type === 'assistant' && (

                  <div className="avatar">

                    <Sparkles size={17} />

                  </div>

                )}


                <div
                  className="bubble"
                  style={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.7,
                  }}
                >

                  {message.text}

                </div>


                {/* AI SPEAKER */}

                {message.type === 'assistant' && (

                  <button
                    className="icon-btn"
                    onClick={() => {

                      if (speaking) {

                        stopSpeaking()

                      } else {

                        speakText(
                          message.text,
                          message.languageCode
                        )

                      }

                    }}
                    title={
                      speaking
                        ? 'Stop speaking'
                        : 'Read answer aloud'
                    }
                    style={{
                      alignSelf: 'flex-end',
                    }}
                  >

                    {speaking ? (

                      <VolumeX size={17} />

                    ) : (

                      <Volume2 size={17} />

                    )}

                  </button>

                )}

              </div>

            )
          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="chat-row">

              <div className="avatar">

                <Sparkles size={17} />

              </div>


              <div className="bubble">

                <Loader2
                  size={16}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: 8,
                  }}
                />

                Checking the latest weather...

              </div>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              style={{
                marginLeft: 46,
                marginTop: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#9a3412',
                fontSize: 13,
              }}
            >

              <AlertCircle
                size={15}
                style={{
                  verticalAlign: 'middle',
                  marginRight: 7,
                }}
              />

              {error}

            </div>

          )}


          {/* =================================================
              DECISION INFORMATION
          ================================================= */}

          {messages.length > 0 &&
            messages[
              messages.length - 1
            ].type === 'assistant' && (

              <div className="decision-box">

                <div className="better">

                  <CheckCircle2
                    size={15}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 6,
                    }}
                  />

                  Decision based on live weather data

                </div>


                <div className="why-row">

                  <span className="signal">

                    Location:{' '}

                    <strong>
                      {city}
                    </strong>

                  </span>


                  <span className="signal">

                    Language:{' '}

                    <strong>
                      {language.name}
                    </strong>

                  </span>


                  <span className="signal">

                    Weather GPT:{' '}

                    <strong>
                      Active
                    </strong>

                  </span>

                </div>

              </div>

            )}

        </div>


        {/* =================================================
            COMPOSER
        ================================================= */}

        <div className="composer">


          {/* =================================================
              MICROPHONE
          ================================================= */}

          <button
            className="icon-btn"
            aria-label={
              listening
                ? 'Stop listening'
                : 'Start voice input'
            }
            onClick={handleVoice}
            disabled={loading}
            title={
              listening
                ? 'Stop listening'
                : 'Speak your question'
            }
          >

            {listening ? (

              <VolumeX size={19} />

            ) : (

              <Mic size={19} />

            )}

          </button>


          {/* =================================================
              INPUT
          ================================================= */}

          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder={
              listening
                ? 'Listening...'
                : 'Ask about weather, travel, activities...'
            }
            disabled={loading}
          />


          {/* =================================================
              SEND
          ================================================= */}

          <button
            className="icon-btn send-btn"
            aria-label="Send question"
            onClick={handleSend}
            disabled={
              loading ||
              !question.trim()
            }
          >

            <Send size={18} />

          </button>

        </div>


        {/* =================================================
            VOICE INFORMATION
        ================================================= */}

        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 11,
            color: '#94a3b8',
          }}
        >

          🎤 Voice input and 🔊 spoken answers available in
          supported Indian languages and English.

        </div>


      </section>

    </div>

  )
}