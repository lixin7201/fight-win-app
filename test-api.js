// 测试API脚本
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/fight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: '你说得不对',
        intensity: 5
      })
    });

    console.log('状态码:', response.status);
    
    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log('收到数据:', chunk);
      }
    } else {
      const errorText = await response.text();
      console.log('错误响应:', errorText);
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testAPI(); 