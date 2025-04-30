

## GoogleGenAI file , cache 를 이용한 Q&A.


- 업로드된 file 과 생성된 cache 정보는 zustand 를 사용하여 Browser local storage 에 저장된다.

- cache 는 TTL 이 짧으며 최신 데이터를 cache 로 제공한다는 개념에 충실한 것이 좋다.

- 그러므로 여러모로 인해 KV 같은 Persistant Layer 를 마련하는 것이 좋다.

- cache 생성은 LLM 상황에 따라 언제 해소될지 모르는 Job 이다. Trigger.dev 혹은 Superbase Function 을 생각해볼 수 있다

- Cache 이중화도 고려해볼만 하다 


## CS Studio Setup

- .env.local.example file 을 .env.local 파일로 copy

- GOOGLE_GENERATIVE_AI_API_KEY 는 AI SDK 에서 사용하는 key 값이고 GEMINI_API_KEY 는 google genai 에서 사용되는 key 값으로 두개의 값은 동일합니다.


