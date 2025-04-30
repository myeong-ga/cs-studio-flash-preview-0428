// 다양한 시나리오에 대한 모의 Gemini 응답 데이터

export type MockGeminiResponse = {
    id: string
    scenario: string
    description: string
    response: string
  }
  
  export const mockGeminiResponses: MockGeminiResponse[] = [
    {
      id: "order-status",
      scenario: "주문 상태 문의",
      description: "고객이 주문 상태에 대해 문의하는 시나리오",
      response:
        "고객님의 주문 상태를 확인해 드리겠습니다. 주문번호를 알려주시면 더 자세히 확인해 드릴 수 있습니다. 최근 주문하신 ORD1001은 현재 배송 준비 중입니다.",
    },
    {
      id: "product-return",
      scenario: "제품 반품 요청",
      description: "고객이 제품 반품을 요청하는 시나리오",
      response:
        "제품 반품 요청을 도와드리겠습니다. 반품하시려는 제품과 주문번호를 알려주시면 반품 절차를 안내해 드리겠습니다. 반품 사유도 함께 알려주시면 더 빠른 처리가 가능합니다.",
    },
    {
      id: "refund-inquiry",
      scenario: "환불 문의",
      description: "고객이 환불에 대해 문의하는 시나리오",
      response:
        "환불 문의 주셔서 감사합니다. 환불을 원하시는 주문의 주문번호를 알려주시면 환불 상태를 확인해 드리겠습니다. 환불은 결제 수단에 따라 처리 시간이 다를 수 있습니다.",
    },
    {
      id: "product-complaint",
      scenario: "제품 불만 사항",
      description: "고객이 제품 품질에 대한 불만을 제기하는 시나리오",
      response:
        "제품에 불편을 드려 정말 죄송합니다. 어떤 제품에 문제가 있으신지, 그리고 어떤 부분이 불만족스러우신지 자세히 알려주시면 빠르게 조치해 드리겠습니다. 필요하다면 교환이나 환불 처리도 도와드릴 수 있습니다.",
    },
    {
      id: "delivery-delay",
      scenario: "배송 지연 문의",
      description: "고객이 배송 지연에 대해 문의하는 시나리오",
      response:
        "배송 지연으로 불편을 드려 죄송합니다. 현재 물류센터의 배송량이 증가하여 일부 지연이 발생하고 있습니다. 고객님의 주문번호를 알려주시면 정확한 배송 상태를 확인해 드리겠습니다.",
    },
    {
      id: "account-issue",
      scenario: "계정 문제",
      description: "고객이 계정 접근 또는 비밀번호 재설정에 대해 문의하는 시나리오",
      response:
        "계정 접근에 문제가 있으시군요. 고객님의 계정 보안을 위해 본인 확인 절차가 필요합니다. 가입 시 사용하신 이메일 주소와 전화번호 뒷자리를 알려주시면 비밀번호 재설정 링크를 보내드리겠습니다.",
    },
    {
      id: "product-availability",
      scenario: "제품 재고 문의",
      description: "고객이 특정 제품의 재고 여부를 문의하는 시나리오",
      response:
        "찾으시는 제품의 재고 여부를 확인해 드리겠습니다. 어떤 제품을 찾고 계신지 제품명이나 제품 코드를 알려주시면 재고 상태를 확인해 드리겠습니다.",
    },
    {
      id: "general-greeting",
      scenario: "일반 인사",
      description: "고객이 일반적인 인사를 하는 시나리오",
      response:
        "안녕하세요! CS 센터입니다. 오늘 어떤 도움이 필요하신가요? 주문 관련 문의, 제품 정보, 반품/교환, 계정 관리 등 어떤 내용이든 편하게 말씀해 주세요.",
    },
    {
      id: "tool-call-example",
      scenario: "도구 호출 예시",
      description: "도구 호출이 필요한 시나리오 (티켓 생성)",
      response:
        "고객님의 문의 사항을 기록하기 위해 티켓을 생성해 드리겠습니다. 이 문제는 담당 부서에서 추가 확인이 필요할 것 같습니다. 티켓 번호가 생성되면 알려드리겠습니다.",
    },
    {
      id: "complex-issue",
      scenario: "복잡한 문제",
      description: "여러 단계의 해결이 필요한 복잡한 문제 시나리오",
      response:
        "말씀해주신 문제는 여러 단계의 확인이 필요한 사항입니다. 먼저 고객님의 계정 정보와 주문 내역을 확인한 후, 기술 지원팀과 협력하여 해결책을 찾아보겠습니다. 이 과정에서 추가 정보를 요청드릴 수 있으니 양해 부탁드립니다.",
    },
  ]
  
  // 모의 응답을 ID로 가져오는 함수
  export function getMockResponseById(id: string): string | null {
    const mockResponse = mockGeminiResponses.find((response) => response.id === id)
    return mockResponse ? mockResponse.response : null
  }
  
  // 모의 응답을 랜덤하게 가져오는 함수
  export function getRandomMockResponse(): string {
    const randomIndex = Math.floor(Math.random() * mockGeminiResponses.length)
    return mockGeminiResponses[randomIndex].response
  }
  
  // 사용자 메시지에 기반한 모의 응답을 가져오는 함수
  export function getMockResponseByUserMessage(message: string): string {
    // 사용자 메시지에 특정 키워드가 포함되어 있는지 확인하여 적절한 응답 반환
    message = message.toLowerCase()
  
    if (message.includes("주문") && (message.includes("상태") || message.includes("확인"))) {
      return getMockResponseById("order-status") || getRandomMockResponse()
    }
  
    if (message.includes("반품") || message.includes("교환")) {
      return getMockResponseById("product-return") || getRandomMockResponse()
    }
  
    if (message.includes("환불")) {
      return getMockResponseById("refund-inquiry") || getRandomMockResponse()
    }
  
    if (message.includes("불량") || message.includes("문제") || message.includes("고장")) {
      return getMockResponseById("product-complaint") || getRandomMockResponse()
    }
  
    if (message.includes("배송") && (message.includes("지연") || message.includes("늦어"))) {
      return getMockResponseById("delivery-delay") || getRandomMockResponse()
    }
  
    if (message.includes("계정") || message.includes("비밀번호") || message.includes("로그인")) {
      return getMockResponseById("account-issue") || getRandomMockResponse()
    }
  
    if (message.includes("재고") || message.includes("품절") || message.includes("있나요")) {
      return getMockResponseById("product-availability") || getRandomMockResponse()
    }
  
    if (message.includes("안녕") || message.includes("반가") || message.length < 10) {
      return getMockResponseById("general-greeting") || getRandomMockResponse()
    }
  
    if (message.includes("티켓") || message.includes("접수") || message.includes("등록")) {
      return getMockResponseById("tool-call-example") || getRandomMockResponse()
    }
  
    // 기본 응답
    return getRandomMockResponse()
  }
  