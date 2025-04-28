import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Headphones } from "lucide-react"

export const metadata: Metadata = {
  title: "CS Studio",
  description:
    "CS Studio는 AI 기반 고객 응대 솔루션입니다. LLM과 다양한 도구를 활용한 에이전트를 통해 CS 매니저의 업무를 지원하며, 고객 클레임 처리, 미디어 콘텐츠 제작, SSN 채널 공급, 그리고 상세한 어트리뷰션 통계를 제공합니다.",
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6 text-microsoft-blue" />
            <span className="font-bold text-xl text-microsoft-blue">CS Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-microsoft-blue">
              로그인
            </Link>
            <Button asChild className="bg-microsoft-blue hover:bg-microsoft-blue-dark">
              <Link href="/dashboard">무료 체험 시작</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-microsoft-blue-lighter to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-microsoft-blue mb-6">
              AI 기반 고객 응대 솔루션으로 CS 업무를 혁신하세요
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              CS Studio는 LLM과 다양한 도구를 활용한 에이전트를 통해 CS 매니저의 업무를 지원합니다. 고객 클레임 처리부터
              미디어 콘텐츠 제작, SSN 채널 공급까지 모든 과정을 효율적으로 관리하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-microsoft-blue hover:bg-microsoft-blue-dark">
                <Link href="/dashboard">
                  무료 체험 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-microsoft-blue text-microsoft-blue hover:bg-microsoft-blue-lighter"
              >
                <Link href="/dashboard">데모 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-microsoft-blue">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI 기반 고객 응대",
                description: "LLM을 활용한 지능형 에이전트가 고객 문의에 신속하고 정확하게 응답합니다.",
              },
              {
                title: "클레임 처리 자동화",
                description: "고객 클레임을 자동으로 분류하고 적절한 해결책을 제시하여 처리 시간을 단축합니다.",
              },
              {
                title: "미디어 콘텐츠 제작",
                description: "고객 응대에 필요한 다양한 미디어 콘텐츠를 AI가 자동으로 생성합니다.",
              },
              {
                title: "SSN 채널 공급",
                description: "다양한 소셜 미디어 채널에 최적화된 콘텐츠를 자동으로 공급합니다.",
              },
              {
                title: "상세 어트리뷰션 통계",
                description: "고객 응대 성과를 상세하게 분석하여 서비스 개선에 활용할 수 있습니다.",
              },
              {
                title: "맞춤형 워크플로우",
                description: "기업의 CS 프로세스에 맞게 커스터마이징 가능한 워크플로우를 제공합니다.",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-microsoft-blue" />
                  <h3 className="text-xl font-semibold text-microsoft-blue">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-microsoft-blue py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">CS Studio로 고객 서비스를 혁신하세요</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            지금 바로 무료 체험을 시작하고 AI 기반 고객 응대 솔루션의 효과를 경험해보세요.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white text-microsoft-blue hover:bg-gray-100 border-white"
          >
            <Link href="/dashboard">
              무료 체험 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Headphones className="h-6 w-6 text-microsoft-blue" />
              <span className="font-bold text-xl text-microsoft-blue">CS Studio</span>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-gray-600 hover:text-microsoft-blue">
                서비스 소개
              </Link>
              <Link href="#" className="text-gray-600 hover:text-microsoft-blue">
                요금제
              </Link>
              <Link href="#" className="text-gray-600 hover:text-microsoft-blue">
                고객 지원
              </Link>
              <Link href="#" className="text-gray-600 hover:text-microsoft-blue">
                문의하기
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CS Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
