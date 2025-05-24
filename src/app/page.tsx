'use client'

import { useState, useEffect } from 'react'

interface FightResponse {
  responses: string[]
  timestamp: number
  input: string
  intensity: number
}

export default function Home() {
  const [input, setInput] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [responses, setResponses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<FightResponse[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [streamingText, setStreamingText] = useState<string>('')
  const [currentResponseIndex, setCurrentResponseIndex] = useState<number>(0)

  // 组件挂载时加载历史记录
  useEffect(() => {
    loadHistory()
  }, [])

  // 从localStorage加载历史记录
  const loadHistory = () => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('fight-history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }

  // 保存到localStorage
  const saveToHistory = (newResponse: FightResponse) => {
    if (typeof window !== 'undefined') {
      const updatedHistory = [newResponse, ...history].slice(0, 10) // 只保留最近10条
      setHistory(updatedHistory)
      localStorage.setItem('fight-history', JSON.stringify(updatedHistory))
    }
  }

  const handleFight = async () => {
    if (!input.trim()) {
      alert('请输入对方说的话！')
      return
    }

    setLoading(true)
    setResponses([])
    setErrorMessage('')
    setStreamingText('')
    setCurrentResponseIndex(0)

    try {
      const response = await fetch('/api/fight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input.trim(), intensity }),
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'chunk') {
                  setStreamingText(prev => prev + data.content)
                } else if (data.type === 'complete') {
                  setStreamingText('')
                  setResponses(data.responses)
                  
                  if (data.fallback && data.error) {
                    setErrorMessage(data.error)
                  }

                  // 保存到历史记录
                  const newResponse: FightResponse = {
                    responses: data.responses,
                    timestamp: data.timestamp,
                    input: input.trim(),
                    intensity,
                  }
                  saveToHistory(newResponse)
                }
              } catch (e) {
                console.error('解析流数据失败:', e)
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('生成回复失败，请稍后重试！')
      // 设置备用回复
      const fallbackResponses = intensity <= 3 
        ? ['兄弟，这话说得有点问题啊，咱们理性讨论一下。', '老哥，你这个观点我觉得需要再想想。', '哥们，事实可能不是你想的那样。']
        : intensity <= 6
        ? ['兄弟你这话说得，我都不好意思反驳了。', '老哥，你这逻辑我是真的服了。', '哥们，醒醒吧，现在都什么年代了。']
        : ['兄弟你这话说得我人都麻了，这逻辑漏洞大得我都不知道从哪吐槽！', '老哥，你这是认真的吗？我愿称你为逻辑鬼才！', '哥们，你这想法绝了，我甘拜下风，真的服了！']
      setResponses(fallbackResponses)
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！')
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-wechat-text-primary mb-2">
          🥊 贴吧对线神器
        </h1>
        <p className="text-wechat-text-secondary text-sm">
          老哥带你在网上永远不输！
        </p>
      </div>

      {/* 输入区域 */}
      <div className="bg-wechat-card rounded-lg p-4 mb-4 shadow-sm">
        <label className="block text-wechat-text-primary font-medium mb-2">
          对面说了啥？
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入对方的话..."
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-wechat-primary focus:border-transparent"
          rows={3}
        />
      </div>

      {/* 语气强烈程度 */}
      <div className="bg-wechat-card rounded-lg p-4 mb-4 shadow-sm">
        <label className="block text-wechat-text-primary font-medium mb-3">
          语气强烈程度: {intensity}
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-wechat-text-secondary mt-1">
            <span>温和</span>
            <span>一般</span>
            <span>激烈</span>
          </div>
        </div>
      </div>

      {/* 开始吵架按钮 */}
      <button
        onClick={handleFight}
        disabled={loading || !input.trim()}
        className="w-full bg-wechat-primary text-white py-3 px-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-wechat-secondary transition-colors mb-6"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            老哥正在想怎么怼你...
          </span>
        ) : (
          '🔥 开始对线'
        )}
      </button>

      {/* 流式显示区域 */}
      {streamingText && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-wechat-text-primary mb-3">
            💬 老哥正在回复中...
          </h3>
          <div className="bg-wechat-card rounded-lg p-4 shadow-sm border-l-4 border-wechat-primary">
            <div className="text-wechat-text-primary leading-relaxed whitespace-pre-wrap">
              {streamingText}
              <span className="inline-block w-2 h-5 bg-wechat-primary ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
      )}

      {/* 回复结果 */}
      {responses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-wechat-text-primary mb-3">
            🎯 老哥的神回复：
          </h3>
          {responses.map((response, index) => (
            <div
              key={index}
              className="bg-wechat-card rounded-lg p-4 shadow-sm border-l-4 border-wechat-primary"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-wechat-primary">
                  回复 {index + 1}
                </span>
                <button
                  onClick={() => copyResponse(response)}
                  className="text-wechat-text-secondary hover:text-wechat-primary text-sm"
                >
                  📋 复制
                </button>
              </div>
              <p className="text-wechat-text-primary leading-relaxed">
                {response}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-wechat-text-primary mb-3">
            📚 历史记录
          </h3>
          <div className="space-y-2">
            {history.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="bg-wechat-card rounded-lg p-3 shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setInput(item.input)
                  setIntensity(item.intensity)
                  setResponses(item.responses)
                }}
              >
                <p className="text-sm text-wechat-text-secondary truncate">
                  &quot;{item.input}&quot;
                </p>
                <p className="text-xs text-wechat-text-light mt-1">
                  {new Date(item.timestamp).toLocaleDateString()} | 强度: {item.intensity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-wechat-text-light">
          仅供娱乐，理性沟通更重要 😊
        </p>
      </div>

      {/* 错误信息 */}
      {errorMessage && (
        <div className="mt-8 text-center text-red-500">
          {errorMessage}
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #07C160;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #07C160;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
} 