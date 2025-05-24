import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-fbe8ed4280db4195b676a762a61e4731",
})

function getIntensityPrompt(intensity: number): string {
  if (intensity <= 3) {
    return "贴吧老哥温和风格，用理性和事实反驳，但保持贴吧特有的幽默感"
  } else if (intensity <= 6) {
    return "贴吧老哥正常风格，带有调侃和反讽，使用网络流行语和梗"
  } else {
    return "贴吧老哥火力全开风格，使用强烈的网络语言和贴吧经典句式，但不涉及人身攻击"
  }
}

function getFallbackResponses(intensity: number): string[] {
  if (intensity <= 3) {
    return [
      '兄弟，这话说得有点问题啊，咱们理性讨论一下。',
      '老哥，你这个观点我觉得需要再想想。',
      '哥们，事实可能不是你想的那样。'
    ]
  } else if (intensity <= 6) {
    return [
      '兄弟你这话说得，我都不好意思反驳了。',
      '老哥，你这逻辑我是真的服了。',
      '哥们，醒醒吧，现在都什么年代了。'
    ]
  } else {
    return [
      '兄弟你这话说得我人都麻了，这逻辑漏洞大得我都不知道从哪吐槽！',
      '老哥，你这是认真的吗？我愿称你为逻辑鬼才！',
      '哥们，你这想法绝了，我甘拜下风，真的服了！'
    ]
  }
}

export async function POST(request: NextRequest) {
  let intensity = 5 // 默认强度
  
  try {
    const { input, intensity: requestIntensity } = await request.json()
    intensity = requestIntensity || 5

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: '输入不能为空' }, { status: 400 })
    }

    const intensityPrompt = getIntensityPrompt(intensity)

    const systemPrompt = `你是一个资深贴吧老哥，专门负责在网上和人辩论。你的特点：
1. 语气风格：${intensityPrompt}
2. 用词特色：经常使用"兄弟"、"老哥"、"哥们"等称呼
3. 表达方式：善用网络流行语、贴吧经典句式、适当的调侃和反讽
4. 逻辑清晰：虽然语气轻松，但论证有理有据
5. 底线：不使用脏话，不进行人身攻击，保持基本素质

请生成3个不同角度的反驳回复，每个回复要：
- 体现贴吧老哥的特色语言风格
- 简洁有力，不超过80字
- 逻辑清晰，有理有据
- 从不同角度反驳

请直接返回3个回复，每行一个，不需要编号。`

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: `对方说："${input}"\n\n请给出3个贴吧老哥风格的反驳回复：`
              }
            ],
            temperature: 0.9,
            max_tokens: 500,
            stream: true
          })

          let fullContent = ''
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              // 发送流式数据
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`))
            }
          }

          // 处理完整回复
          const responses = fullContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !line.match(/^\d+[.、]/))
            .slice(0, 3)

          // 补充默认回复
          while (responses.length < 3) {
            const fallbacks = getFallbackResponses(intensity)
            responses.push(fallbacks[responses.length % fallbacks.length])
          }

          // 发送最终结果
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ responses, type: 'complete', intensity, timestamp: Date.now() })}\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('Stream Error:', error)
          
          const fallbackResponses = getFallbackResponses(intensity)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
            responses: fallbackResponses, 
            type: 'complete', 
            intensity, 
            timestamp: Date.now(),
            fallback: true,
            error: '服务暂时不可用，正在使用备用回复'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('API Error:', error)
    
    const fallbackResponses = getFallbackResponses(intensity)
    return NextResponse.json({
      responses: fallbackResponses,
      intensity: intensity,
      timestamp: Date.now(),
      fallback: true,
      error: '服务暂时不可用，正在使用备用回复'
    })
  }
} 