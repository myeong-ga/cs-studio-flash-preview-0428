import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "CS Studio",
  description:
    "CS Studio는 AI 기반 고객 응대 솔루션입니다. LLM과 다양한 도구를 활용한 에이전트를 통해 CS 매니저의 업무를 지원하며, 고객 클레임 처리, 미디어 콘텐츠 제작, SSN 채널 공급, 그리고 상세한 어트리뷰션 통계를 제공합니다.",
}

export default function Home() {
  redirect("/landing")
}
