

## GoogleGenAI file , cache 를 이용한 Q&A.


- 업로드된 file 과 생성된 cache 정보는 zustand 를 사용하여 Browser local storage 에 저장된다.

- cache 는 TTL 이 짧으며 최신 데이터를 cache 로 제공한다는 개념에 충실한 것이 좋다.

- 그러므로 여러모로 인해 KV 같은 Persistant Layer 를 마련하는 것이 좋다.


