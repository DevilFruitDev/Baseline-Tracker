import { useState, useRef, useEffect } from 'react';
import { Session } from '../types';
import { TEST_DEFINITIONS } from '../data/tests';
import { formatResultValue } from '../utils/scoring';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachProps {
  sessions: Session[];
}

export const AICoach: React.FC<AICoachProps> = ({ sessions }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI fitness coach. I can analyze your training data and provide personalized insights. To get started, please add your API key in the settings below. Ask me anything about your progress!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'anthropic'>('openai');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider') as 'openai' | 'anthropic' || 'openai';
    if (savedKey) {
      setApiKey(savedKey);
      setApiProvider(savedProvider);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_provider', apiProvider);
    setShowSettings(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Great! I'm now connected using ${apiProvider === 'openai' ? 'OpenAI (ChatGPT)' : 'Anthropic (Claude)'}. How can I help you with your fitness journey?`,
      timestamp: new Date()
    }]);
  };

  const getContextData = () => {
    if (sessions.length === 0) {
      return "The user has no training sessions yet.";
    }

    const latestSession = sessions[0];
    const sessionCount = sessions.length;

    let context = `The user has completed ${sessionCount} training session${sessionCount > 1 ? 's' : ''}.

Latest session (${new Date(latestSession.dateISO).toLocaleDateString()}):
Bodyweight: ${latestSession.bodyweightLbs} lbs
${latestSession.notes ? `Notes: ${latestSession.notes}` : ''}

Test results:
`;

    latestSession.results.forEach(result => {
      const test = TEST_DEFINITIONS.find(t => t.id === result.testId);
      if (test) {
        context += `- ${test.name}: ${formatResultValue(test, result)} (Score: ${result.score || 'N/A'})\n`;
      }
    });

    if (sessions.length > 1) {
      const previousSession = sessions[1];
      context += `\nPrevious session (${new Date(previousSession.dateISO).toLocaleDateString()}):\n`;
      previousSession.results.forEach(result => {
        const test = TEST_DEFINITIONS.find(t => t.id === result.testId);
        if (test) {
          context += `- ${test.name}: ${formatResultValue(test, result)}\n`;
        }
      });
    }

    return context;
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) {
      if (!apiKey) {
        alert('Please add your API key in settings first!');
        setShowSettings(true);
      }
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextData = getContextData();
      const systemPrompt = `You are a knowledgeable fitness coach analyzing a user's baseline fitness test results. You have access to their training data and should provide personalized, actionable advice.

User's Data:
${contextData}

Provide specific, encouraging feedback based on their actual performance. Reference specific tests and scores. Be concise but helpful.`;

      let response;

      if (apiProvider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: input }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });
      } else {
        // Anthropic Claude API
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: input }
            ]
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      let assistantMessage = '';
      if (apiProvider === 'openai') {
        assistantMessage = data.choices[0].message.content;
      } else {
        assistantMessage = data.content[0].text;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again. Make sure your API key is valid and has sufficient credits.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Fitness Coach</h2>
              <p className="text-blue-100 text-sm">
                {apiKey ? `Powered by ${apiProvider === 'openai' ? 'ChatGPT' : 'Claude'}` : 'Configure API key to start'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 text-sm font-semibold"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 bg-white rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                AI Provider
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setApiProvider('openai')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    apiProvider === 'openai'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  OpenAI (ChatGPT)
                </button>
                <button
                  onClick={() => setApiProvider('anthropic')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    apiProvider === 'anthropic'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Anthropic (Claude)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${apiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key from:{' '}
                <a
                  href={apiProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://console.anthropic.com/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {apiProvider === 'openai' ? 'OpenAI Platform' : 'Anthropic Console'}
                </a>
              </p>
            </div>

            <button
              onClick={saveSettings}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your training..."
            disabled={!apiKey}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!apiKey || !input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
