/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

// Default content for the portfolio
const DEFAULT_CONTENT = {
  hero: {
    tag: "Results-Driven E-commerce MD",
    title1: "목표 그 이상의 가치를",
    title2: "만드는 준비된 MD",
    desc: "상품 소싱부터 채널 전략 수립, 데이터 기반의 효율화까지.\n실무 중심의 노하우로 비즈니스의 확실한 매출 신장을 만드는 5년 차 MD 손예찬입니다."
  },
  project: {
    tag: "Featured Project Case Study",
    title: "멀티 채널 운영 최적화 및 매출 230% 성장 달성",
    subtitle: "3,500개 SKU 관리의 전문성과 채널 MD 협상력을 통한 매출 퀀텀 점프",
    highlights: [
      { label: "매출 성장", value: "3,000만 → 1억 달성" },
      { label: "채널 확장", value: "GS SHOP 등 6개 채널" },
      { label: "운영 효율", value: "3,500개 SKU 데이터 관리" },
      { label: "성과 인정", value: "기대 매출의 200% 달성" }
    ],
    strategy: [
      { asIs: "소통 부재: 채널 MD와의 접점 부족", toBe: "관계 강화: 밀착 커뮤니케이션을 통한 메인 구좌 확보" },
      { asIs: "단순 등록: 상품 등록 후 방치 및 관리 부실", toBe: "전시 최적화: 브랜드관/상시 딜 활용 및 UI/UX 개선" },
      { asIs: "단일 품목: 단품 위주의 판매 구조", toBe: "매출 극대화: 연관 상품 묶음 구성을 통한 크로스 셀링" }
    ],
    actions: [
      { title: "전사 프로모션 전략 수립", desc: "베스트셀러 구성 + 혜택 설계(포인트/가격/사은품)를 통해 몰 메인 노출권 확보" },
      { title: "고객 구매 여정 최적화", desc: "크로스셀링 유도 및 묶음 코드 생성으로 이탈률 방지" },
      { title: "철저한 브랜드/가격 관리", desc: "수천 개 SKU 실시간 모니터링으로 브랜드 이미지 보호 및 가격 무너짐 방지" }
    ],
    chartData: [
      { name: "도입기", sales: 3000, growth: 0 },
      { name: "과도기", sales: 6500, growth: 116 },
      { name: "성숙기", sales: 10000, growth: 233 }
    ]
  },
  experience: {
    tag: "WORK EXPERIENCE",
    title: "경력 사항",
    total: "Total 5Y 4M",
    items: [
      {
        period: "2023.03 - 2025.09",
        company: "(주)트라이씨클",
        position: "하프클럽 사업부 ",
        role: "아웃도어MD / 골프MD/ 사입소싱팀",
        details: [
          "대규모 거래액 관리 및 상품 운영 효율 최적화",
          "사입 상품 등록 내재화를 통한 운영 비용 혁신적 절감",
          "브랜드사 프로모션 기획 및 매출 분석 기반 영업 전략 수립"
        ]
      },
      {
        period: "2021.01 - 2022.09",
        company: "호원플래닛",
        position: "아웃도어 벤더사",
        role: "캠핑/아웃도어 온라인 영업",
        details: [
          "입점 채널 운영 관리 및 프로모션 기획/운영",
          "매출 데이터 분석 및 분기별 영업 계획 수립",
          "신규 경쟁력 있는 상품 기획 및 협력사 소싱"
        ]
      },
      {
        period: "2019.03 - 2020.02",
        company: "롯데하이마트",
        position: "온라인영업팀 AMD",
        role: "PC 카테고리 AMD 업무",
        details: [
          "상품 등록 및 행사 운영 지원",
          "채널별 가격 비교 및 재고 현황 관리",
          "정산 및 파트너사 커뮤니케이션 지원"
        ]
      }
    ]
  },
  sabangnet: {
    tag: "Technical Skill",
    title: "사방넷 상급 마스터 역량",
    skills: [
      { title: "상품 관리", items: ["상품 대량 등록 및 수정", "품번/옵션 매핑 최적화", "쇼핑몰별 세트 등록"] },
      { title: "주문/재고", items: ["실시간 주문 수집 및 매칭", "물류 창고별 재고 연동", "품절 관리 및 송장 전송"] },
      { title: "클레임 처리", items: ["취소/반품/교환 프로세스", "고객 문의 통합 관리", "클레임 데이터 분석"] },
      { title: "초기 세팅", items: ["신규 쇼핑몰 API 연동", "기본 정보 및 관리 매핑", "시스템 최적화 환경 구축"] }
    ]
  },
  channels: {
    tag: "Handling Channels",
    title: "운영 유통 채널",
    items: [
      { type: "종합몰", desc: "GS SHOP, CJ온스타일, 현대몰, 홈앤쇼핑 등" },
      { type: "폐쇄/복지몰", desc: "현대이지웰, 삼성카드, 복지포인트몰 등" },
      { type: "전문몰/오픈마켓", desc: "하프클럽, 마켓컬리, 홀라인, 쿠팡 등" }
    ],
    image: "https://keep.naver.com/viewer2/all/69d7ca88a5010b50e9b78750/all"
  },
  data: {
    tag: "Analysis Dashboard",
    title: "데이터 기반의 의사결정 프로세스",
    subtitle: "실무 판매 데이터 기반 시각화 및 인사이트 도출",
    cardTitle: "데이터 분석 및 전략",
    desc: "시즌별 판매 데이터를 정밀 분석하여 카테고리별 매출 추이와 효율을 시각화했습니다. 이를 통해 시장 흐름을 파악하고 최적의 영업 전략을 수립합니다.",
    pointsTitle: "핵심 분석 포인트",
    points: [
      { label: "시즌 매출 현황:", desc: "성수기 진입 전 정밀 물량 계획 및 신장률 분석" },
      { label: "아이템 효율 분석:", desc: "ASP 분석을 통한 적정 가격대 도출 및 마진 개선" },
      { label: "운영 성과 트래킹:", desc: "채널별 노출 구좌 대비 효율성 및 구매 전환 모니터링" }
    ],
    image: "https://keep.naver.com/viewer2/all/69d7cac0a5010b50e9b78757/all"
  },
  improvement: {
    tag: "Success Case",
    title: "상품 등록 프로세스 간소화 (사입팀)",
    subtitle: "프로세스 내재화를 통한 운영 효율화 및 비용 구조 혁신",
    caseTitle: "01. 상품 등록 운영 내재화",
    desc: "고비용 외주 의존 구조를 탈피하기 위해 직접 등록 시뮬레이션으로 실현 가능성을 검증하고, 아르바이트 채용 및 자체 운영 체계를 구축하여 성과를 창출했습니다.",
    stats: [
      { label: "Cost Reduction", value: "-95%" },
      { label: "Time Saving", value: "89%" }
    ],
    problem: { 
      title: "문제점 (Problem)", 
      desc: "건당 5,000원의 높은 외주 비용과 일일 100개로 제한된 생산성으로 인한 운영 유연성 결여" 
    },
    result: { 
      title: "결과 (Result)", 
      desc: "등록 단가 250원(95% 절감) 달성 및 업무 시간 89% 단축을 통한 등록 수량 제한 완전 해소" 
    },
    solution: {
      title: "해결방안 및 진행과정 (Solution & Process)",
      items: [
        { label: "데이터 기반 검증:", desc: "직접 등록 시뮬레이션을 수행하여 1건당 소요 시간 정밀 측정" },
        { label: "실현 가능성 확인:", desc: "시간당 40개 등록이 가능하다는 데이터 확보 및 운영 내재화 전략 수립" },
        { label: "실행:", desc: "아르바이트 채용을 통한 자체 운영 체계 구축 건의 및 도입" }
      ]
    }
  },
  promotionProject: {
    tag: "Target Segmentation Case Study",
    title: "데이터 기반의 타겟 마케팅",
    subtitle: "관행적인 기존 방식에서 벗어나 데이터 기반 마케팅으로 행사 매출 20% 신장",
    problemInsight: {
      title: "Problem & Insight",
      items: [
        { label: "기존 방식의 한계:", desc: "협력사 제안 기반의 단순 할인, 무료 배송 등 관행적인 프로모션 반복으로 인한 마케팅 성과 정체" },
        { label: "데이터 기반 기회 발견:", desc: "광고를 할 수 있는 비용과 고객 수는 한정적이므로, 효율을 높이기 위해 고객 데이터 분석을 실행함" }
      ]
    },
    actions: [
      { 
        title: "마케팅 소구포인트 및 타겟 재정의", 
        desc: "고객 데이터 기반으로 대리 구매와 실구매 주체를 재발견하여 타겟 전격 교체 및 최적화된 메시지 설계" 
      },
      { 
        title: "CRM 광고 효율 및 시간대 분석", 
        desc: "광고 매체별 효율 분석을 통해 클릭률과 전환이 가장 활발한 피크타임 도출" 
      },
      { 
        title: "고객의 구매 여정 분석", 
        desc: "연령대, 연관 구매, 중복 구매, 장바구니 품목 등 다각도 분석으로 이탈을 방지하는 효율적 프로모션 라인업 구축" 
      },
      { 
        title: "전략적 협업 및 실행", 
        desc: "분석 데이터를 바탕으로 유관 부서와의 긴밀한 협업을 주도하여 정밀 타겟팅 앱푸시 및 프로모션 성과 창출" 
      }
    ],
    result: {
      title: "Result",
      items: [
        "전월 대비 프로모션 매출 20% 신장 ",
        "시간과 비용이 한정적이기에 고객 데이터 분석을 통해 관심도 낮은 고객에게는 광고를 하지 않고, 관심 고객에게 광고를 하여 효율을 높일 수 있음"
      ]
    }
  },
  contact: {
    tag: "Get in Touch",
    title: "Contact Me",
    desc: "저의 경험과 역량이 궁금하시다면 언제든 연락 부탁드립니다. 함께 성장할 기회를 기다리겠습니다.",
    phone: "010-5038-4033",
    email: "syc3208@naver.com"
  },
  vision: {
    tag: "Future Vision",
    title: "입사 후 포부",
    items: [
      { 
        step: "STEP 1", 
        label: "적응력", 
        title: "'일주일' 안에 실전 투입 완료", 
        desc: "업무 프로세스 조기 숙달 및 실무 즉시 적응으로 팀의 생산성 극대화" 
      },
      { 
        step: "STEP 2", 
        label: "목표의식", 
        title: "목표를 넘어선 '120%' 달성", 
        desc: "한계를 두지 않는 끈기와 실행력으로 목표 대비 120% 초과 성과 지향" 
      },
      { 
        step: "STEP 3", 
        label: "균형감", 
        title: "매출·이익·브랜드 가치의 동반 성장", 
        desc: "매출, 이익률, 브랜드 가치의 균형 성장을 리드하는 전략적 MD" 
      }
    ]
  }
};

export default function App() {
  const content = DEFAULT_CONTENT;
  const [activeTab, setActiveTab] = useState<'tricycle' | 'howon'>('tricycle');

  // Set up reveal animation logic
  useEffect(() => {
    function reveal() {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 50) {
          reveals[i].classList.add("active");
        }
      }
    }

    // Call reveal immediately when tab changes or initial load
    setTimeout(reveal, 100);

    window.addEventListener("scroll", reveal);
    window.addEventListener("load", reveal);

    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("load", reveal);
    };
  }, [activeTab]);

  const EditableText = ({ path, className, element: Element = 'span', style = {} }: any) => {
    const keys = path.split('.');
    let value = content;
    for (const key of keys) {
      value = (value as any)[key];
    }

    return (
      <Element className={className} style={style}>
        {String(value)}
      </Element>
    );
  };

  return (
    <div className="text-slate-800 font-pretendard">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden hero-gradient">
        <div className="container relative z-10 px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 shadow-sm mb-12 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
              </span>
              <EditableText 
                path="hero.tag" 
                className="text-[11px] font-black tracking-[0.2em] text-white/70 uppercase" 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-8xl lg:text-[100px] font-black text-white mb-10 leading-[1.1] tracking-tight">
                <EditableText path="hero.title1" element="span" /><br />
                <span className="text-gradient">
                  <EditableText path="hero.title2" element="span" />
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-slate-400 text-lg md:text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed whitespace-pre-line"
            >
              <EditableText path="hero.desc" element="span" />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center gap-6"
            >
              <button 
                onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-brand-primary text-white rounded-full font-bold shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                경력 사항 보기
              </button>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white text-brand-primary border border-brand-primary/10 rounded-full font-bold shadow-lg hover:bg-brand-accent/10 transition-all text-sm uppercase tracking-widest"
              >
                연락하기
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2"
          onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-brand-primary/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Experience */}
      <section id="experience" className="py-32 max-w-7xl mx-auto px-8">
        <div className="mb-20 reveal border-l-4 border-brand-primary pl-8">
          <EditableText path="experience.tag" className="section-tag" />
          <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-2 text-slate-900">
            <EditableText path="experience.title" element="span" /> 
            <span className="text-2xl font-bold text-brand-primary ml-4"><EditableText path="experience.total" element="span" /></span>
          </h3>
        </div>

        <div className="grid gap-8">
          {Array.isArray(content.experience.items) && content.experience.items.map((item, idx) => (
            <div key={idx} className="modern-card p-10 flex flex-col md:flex-row gap-12 items-start reveal">
              <div className="md:w-1/4">
                <EditableText path={`experience.items.${idx}.period`} className="text-slate-400 font-bold text-sm mb-4 block" />
                <h4 className="text-3xl font-black mb-2 text-slate-900"><EditableText path={`experience.items.${idx}.company`} element="span" /></h4>
                <p className="text-brand-primary font-bold"><EditableText path={`experience.items.${idx}.position`} element="span" /></p>
              </div>
              <div className="md:w-3/4 space-y-4">
                <p className="text-slate-900 font-bold mb-4 text-xl"><EditableText path={`experience.items.${idx}.role`} element="span" /></p>
                {Array.isArray(item.details) && item.details.map((detail, dIdx) => (
                  <p key={dIdx} className="flex gap-4 items-start text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2.5 shrink-0"></span>
                    <EditableText path={`experience.items.${idx}.details.${dIdx}`} element="span" />
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career Selection Tabs */}
      <section className="sticky top-0 z-[100] bg-bg-light/80 backdrop-blur-xl border-y border-brand-primary/5 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex bg-brand-primary/5 p-1.5 rounded-full gap-2">
            <button 
              onClick={() => setActiveTab('tricycle')}
              className={`flex-1 py-4 px-8 rounded-full font-bold text-sm tracking-widest transition-all duration-500 uppercase flex items-center justify-center gap-3 ${
                activeTab === 'tricycle' 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                : 'text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/10'
              }`}
            >
              <i className="fas fa-building text-xs"></i>
              트라이씨클
            </button>
            <button 
              onClick={() => setActiveTab('howon')}
              className={`flex-1 py-4 px-8 rounded-full font-bold text-sm tracking-widest transition-all duration-500 uppercase flex items-center justify-center gap-3 ${
                activeTab === 'howon' 
                ? 'bg-brand-secondary text-white shadow-xl shadow-brand-secondary/20' 
                : 'text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/10'
              }`}
            >
              <i className="fas fa-rocket text-xs"></i>
              호원플래닛
            </button>
          </div>
        </div>
      </section>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {activeTab === 'howon' ? (
          <>
            {/* Featured Project Section (Howon Planet) */}
            <section id="featured-project" className="py-32 bg-bg-light/40 border-y border-brand-primary/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 reveal text-center">
            <EditableText path="project.tag" className="section-tag" />
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-4 text-bg-dark leading-tight">
              <EditableText path="project.title" element="span" />
            </h3>
            <p className="text-brand-primary/60 mt-4 font-medium text-lg"><EditableText path="project.subtitle" element="span" /></p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Top: Stats & Strategy (Full Width) */}
            <div className="lg:col-span-12 space-y-10">
              {/* Highlights Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 reveal">
                {Array.isArray(content.project.highlights) && content.project.highlights.map((item: any, idx: number) => (
                  <div key={idx} className="p-8 rounded-[2rem] bg-white border border-brand-primary/5 text-center shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] uppercase font-bold text-brand-secondary mb-3 tracking-[0.2em]">
                      <EditableText path={`project.highlights.${idx}.label`} element="span" />
                    </p>
                    <p className="text-2xl font-black text-brand-primary leading-tight">
                      <EditableText path={`project.highlights.${idx}.value`} element="span" />
                    </p>
                  </div>
                ))}
              </div>

              {/* AS-IS vs TO-BE */}
              <div className="p-12 rounded-[3rem] bg-brand-primary text-white reveal shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] -mr-32 -mt-32"></div>
                <h4 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10">
                  <i className="fas fa-exchange-alt text-brand-accent"></i>
                  Problem & Strategy
                </h4>
                <div className="space-y-10 relative z-10">
                  {Array.isArray(content.project.strategy) && content.project.strategy.map((item: any, idx: number) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-8 relative">
                      <div className="p-8 rounded-[1.5rem] bg-white/5 border border-white/10 relative group">
                        <span className="absolute -top-3 left-8 px-4 py-1 bg-white/10 text-[10px] font-bold rounded-full uppercase tracking-widest backdrop-blur-md">Current State</span>
                        <p className="text-white/60 text-base leading-relaxed">
                          <EditableText path={`project.strategy.${idx}.asIs`} element="span" />
                        </p>
                      </div>
                      <div className="p-8 rounded-[1.5rem] bg-brand-secondary/20 border border-brand-secondary/30 relative group shadow-lg">
                        <span className="absolute -top-3 left-8 px-4 py-1 bg-brand-secondary text-[10px] font-bold rounded-full uppercase tracking-widest">Proposed Strategy</span>
                        <p className="text-white text-base font-medium leading-relaxed">
                          <EditableText path={`project.strategy.${idx}.toBe`} element="span" />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Left: Key Actions (7 Columns) */}
            <div className="lg:col-span-7 space-y-6 reveal">
              <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <i className="fas fa-bolt text-brand-secondary"></i>
                Key Actions
              </h4>
              <div className="grid gap-4">
                {Array.isArray(content.project.actions) && content.project.actions.map((action: any, idx: number) => (
                  <div key={idx} className="flex gap-6 p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-xl transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-brand-primary font-black text-xl">
                      0{idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 mb-2 text-lg">
                        <EditableText path={`project.actions.${idx}.title`} element="span" />
                      </h5>
                      <p className="text-slate-500 leading-relaxed">
                        <EditableText path={`project.actions.${idx}.desc`} element="span" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Right: Chart & Growth (5 Columns) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl reveal">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">매출 성장 추이</h4>
                    <p className="text-slate-400 text-sm">월 평균 3,000만 → 최대 1억 달성</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-brand-primary">+233%</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Rate</p>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={content.project.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <defs>
                        <marker
                          id="arrow"
                          viewBox="0 0 10 10"
                          refX="9"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
                        </marker>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="sales" radius={[10, 10, 0, 0]} barSize={50}>
                        {Array.isArray(content.project.chartData) && content.project.chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#e2e8f0'} />
                        ))}
                        <LabelList dataKey="sales" position="top" formatter={(val: number) => `${val.toLocaleString()}만`} style={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                      </Bar>
                      <Line 
                        type="monotone" 
                        dataKey="growth" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        markerEnd="url(#arrow)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0 text-white">
                    <i className="fas fa-comment-dots"></i>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong className="text-brand-primary block mb-1">핵심 성장 동력</strong>
                    메인 프로모션 선정 및 상시 딜 최적화를 통해 3,000만 원 지점에서 1억 원으로 급등하는 퀀텀 점프 달성
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Sabangnet Mastery */}
      <section id="sabangnet" className="py-32 bg-bg-dark text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="mb-20 reveal text-center">
            <EditableText path="sabangnet.tag" className="section-tag !text-white !bg-white/10" />
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-4"><EditableText path="sabangnet.title" element="span" /></h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            {Array.isArray(content.sabangnet.skills) && content.sabangnet.skills.map((skill, idx) => (
              <div key={idx} className={`p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary/50 transition-all group`}>
                <div className="skill-icon-box !bg-white/5 group-hover:!bg-brand-primary group-hover:!text-white transition-all">
                  <i className={`fas ${idx === 0 ? 'fa-layer-group' : idx === 1 ? 'fa-sync' : idx === 2 ? 'fa-exclamation-triangle' : 'fa-cogs'} text-xl text-white`}></i>
                </div>
                <h4 className="text-xl font-bold mb-4 text-white"><EditableText path={`sabangnet.skills.${idx}.title`} element="span" /></h4>
                <ul className="text-sm text-slate-400 space-y-3">
                  {Array.isArray(skill.items) && skill.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2">
                      <span className="text-brand-secondary">•</span>
                      <EditableText path={`sabangnet.skills.${idx}.items.${iIdx}`} element="span" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Channels */}
      <section id="channels" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-16 reveal">
            <EditableText path="channels.tag" className="section-tag" />
            <h3 className="text-4xl font-black mt-2 text-slate-900"><EditableText path="channels.title" element="span" /></h3>
          </div>

          <div className="reveal">
            <div className="dashboard-frame mb-12 relative group">
              <div className="bg-white rounded-2xl p-8 flex items-center justify-center border border-slate-100 overflow-hidden">
                <img 
                  src={(content.channels as any).image} 
                  alt="주요 담당 채널 로고 모음" 
                  className="max-w-full h-auto drop-shadow-sm rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Array.isArray(content.channels.items) && content.channels.items.map((item, idx) => (
                <div key={idx} className="modern-card p-8 text-center hover:scale-105 transition-transform group">
                  <h4 className="font-bold text-xs mb-4 uppercase tracking-widest text-slate-400">
                    <EditableText path={`channels.items.${idx}.type`} element="span" />
                  </h4>
                  <p className="text-slate-900 font-bold text-lg"><EditableText path={`channels.items.${idx}.desc`} element="span" /></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  ) : (
    <>
      {/* Section 4: Data Analysis Dashboard (Tricycle) */}
      <section id="data" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 reveal">
            <EditableText path="data.tag" className="section-tag" />
            <h3 className="text-4xl font-black mt-2"><EditableText path="data.title" element="span" /></h3>
            <p className="text-slate-400 mt-4 font-medium"><EditableText path="data.subtitle" element="span" /></p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-center reveal">
            <div className="lg:w-1/2 w-full">
              <div className="dashboard-frame relative group">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                  <img 
                    src={(content.data as any).image} 
                    alt="Data Analysis Dashboard" 
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="p-10 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-brand-primary">
                    <i className="fas fa-chart-line text-xl"></i>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900"><EditableText path="data.cardTitle" element="span" /></h4>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium mb-10 text-lg">
                  <EditableText path="data.desc" element="span" />
                </p>

                <div className="space-y-6">
                  <h5 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4"><EditableText path="data.pointsTitle" element="span" /></h5>
                  <ul className="space-y-6">
                    {Array.isArray(content.data.points) && content.data.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <i className="fas fa-check text-[10px] text-brand-primary"></i>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-900"><EditableText path={`data.points.${idx}.label`} element="span" /></strong> <EditableText path={`data.points.${idx}.desc`} element="span" />
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Case */}
      <section id="improvement" className="py-32 bg-[#0a0b10] text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-20 reveal text-center">
            <EditableText path="improvement.tag" className="section-tag !text-brand-primary !bg-brand-primary/10 border border-brand-primary/20" />
            <h3 className="text-5xl font-black tracking-tight mt-4"><EditableText path="improvement.title" element="span" /></h3>
            <p className="text-slate-400 mt-4 font-medium"><EditableText path="improvement.subtitle" element="span" /></p>
          </div>

          <div className="max-w-4xl mx-auto reveal space-y-8">
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-brand-primary"><EditableText path="improvement.caseTitle" element="span" /></span>
                </h4>
                <p className="text-slate-400 leading-relaxed mb-8">
                  <EditableText path="improvement.desc" element="span" />
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(content.improvement.stats) && content.improvement.stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <p className="text-xs uppercase font-bold text-slate-500 mb-1"><EditableText path={`improvement.stats.${idx}.label`} element="span" /></p>
                      <p className="text-3xl font-black"><EditableText path={`improvement.stats.${idx}.value`} element="span" /></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                  <i className="fas fa-search-minus text-brand-secondary text-xl mb-4"></i>
                  <h5 className="font-bold mb-2 text-white"><EditableText path="improvement.problem.title" element="span" /></h5>
                  <p className="text-sm text-slate-400 leading-relaxed"><EditableText path="improvement.problem.desc" element="span" /></p>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                  <i className="fas fa-rocket text-[#22c55e] text-xl mb-4"></i>
                  <h5 className="font-bold mb-2 text-white"><EditableText path="improvement.result.title" element="span" /></h5>
                  <p className="text-sm text-slate-400 leading-relaxed"><EditableText path="improvement.result.desc" element="span" /></p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <h5 className="text-slate-200 font-bold mb-6 flex items-center gap-3">
                  <i className="fas fa-tools text-brand-primary"></i>
                  <EditableText path="improvement.solution.title" element="span" />
                </h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Array.isArray(content.improvement.solution?.items) && content.improvement.solution?.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0"></div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        <strong className="text-slate-200"><EditableText path={`improvement.solution.items.${idx}.label`} element="span" /></strong> <EditableText path={`improvement.solution.items.${idx}.desc`} element="span" />
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Segmentation & Promotion Project */}
      <section id="promotion-project" className="py-32 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-20 reveal text-center">
            <EditableText path="promotionProject.tag" className="section-tag !text-brand-accent !bg-brand-accent/10 border border-brand-accent/20" />
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-4 text-slate-900">
              <EditableText path="promotionProject.title" element="span" />
            </h3>
            <p className="text-slate-500 mt-4 font-medium text-lg leading-relaxed max-w-3xl mx-auto">
              <EditableText path="promotionProject.subtitle" element="span" />
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 mb-20 reveal">
            <div className="p-12 rounded-[2rem] bg-slate-50 border border-slate-100 relative group">
              <h4 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                <i className="fas fa-search text-brand-secondary"></i>
                <EditableText path="promotionProject.problemInsight.title" element="span" />
              </h4>
              <div className="space-y-6">
                {Array.isArray(content.promotionProject.problemInsight.items) && content.promotionProject.problemInsight.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-2.5 shrink-0"></div>
                    <div>
                      <h5 className="font-bold text-slate-800 mb-1">
                        <EditableText path={`promotionProject.problemInsight.items.${idx}.label`} element="span" />
                      </h5>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        <EditableText path={`promotionProject.problemInsight.items.${idx}.desc`} element="span" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-12 rounded-[2rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 bg-brand-accent w-48 h-48 rounded-full -mr-24 -mt-24"></div>
              <h4 className="text-2xl font-black mb-8 flex items-center gap-3 border-b border-white/20 pb-6 relative z-10">
                <i className="fas fa-chart-line text-brand-accent"></i>
                <EditableText path="promotionProject.result.title" element="span" />
              </h4>
              <ul className="space-y-6 relative z-10">
                {Array.isArray(content.promotionProject.result.items) && content.promotionProject.result.items.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-brand-accent">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <p className="text-lg font-bold pt-1">
                      <EditableText path={`promotionProject.result.items.${idx}`} element="span" />
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-12 bg-white/10 p-6 rounded-xl border border-white/10 relative z-10">
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  * 정밀한 타겟팅와 유입 채널별 최적화를 통해 단순 가격 경쟁을 탈피하고 브랜드 수익률을 함께 개선하는 성과 도출
                </p>
              </div>
            </div>
          </div>

          <div className="reveal">
            <h4 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3 px-4">
              <i className="fas fa-tasks text-brand-secondary"></i>
              Execution Strategy
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(content.promotionProject.actions) && content.promotionProject.actions.map((action: any, idx: number) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-brand-secondary/30 hover:shadow-xl transition-all group relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-brand-secondary group-hover:text-white transition-all">
                    <i className={`fas ${idx === 0 ? 'fa-users' : idx === 1 ? 'fa-clock' : idx === 2 ? 'fa-shoe-prints' : 'fa-handshake'} text-xl text-brand-primary group-hover:text-white`}></i>
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2 text-lg">
                    <EditableText path={`promotionProject.actions.${idx}.title`} element="span" />
                  </h5>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    <EditableText path={`promotionProject.actions.${idx}.desc`} element="span" />
                  </p>
                  <div className="absolute top-6 right-8 text-[10px] font-black text-slate-100 group-hover:text-brand-secondary/10 transition-colors uppercase tracking-widest">
                    Step 0{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )}
</motion.div>

      {/* Vision Section (Aspiration) */}
      <section id="vision" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="mb-20 reveal border-l-4 border-brand-primary pl-8">
            <EditableText path="vision.tag" className="section-tag" />
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 text-slate-900">
              <EditableText path="vision.title" element="span" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 reveal">
            {Array.isArray((content as any).vision?.items) && (content as any).vision.items.map((item: any, idx: number) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-brand-primary/30 hover:shadow-2xl transition-all group">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black text-brand-primary tracking-[0.3em] uppercase">{item.step}</span>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                      <i className={`fas ${idx === 0 ? 'fa-running' : idx === 1 ? 'fa-chart-pie' : 'fa-balance-scale'} text-2xl`}></i>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold mb-4 inline-block">
                      <EditableText path={`vision.items.${idx}.label`} element="span" />
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">
                      <EditableText path={`vision.items.${idx}.title`} element="span" />
                    </h4>
                  </div>
                  <p className="text-slate-500 text-base leading-relaxed font-normal mt-auto">
                    <EditableText path={`vision.items.${idx}.desc`} element="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Me Section */}
      <section id="contact" className="py-32 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="modern-card p-16 text-center bg-[#0a0b10] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-primary to-brand-accent opacity-10 blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-secondary to-brand-accent opacity-10 blur-[100px] -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <EditableText path="contact.tag" className="section-tag !mb-6 !text-brand-primary !bg-brand-primary/10" />
              <h2 className="text-4xl md:text-5xl font-[900] mb-6 tracking-tight"><EditableText path="contact.title" element="span" /></h2>
              <p className="text-slate-400 text-lg mb-12 font-medium whitespace-pre-line">
                <EditableText path="contact.desc" element="span" />
              </p>

              <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                <div className="group cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-brand-primary transition-all">
                      <i className="fas fa-phone"></i>
                    </div>
                    <span className="text-xl font-bold"><EditableText path="contact.phone" element="span" /></span>
                  </div>
                </div>
                <div className="w-px h-16 bg-white/10 hidden md:block"></div>
                <div className="group cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-brand-secondary transition-all">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <span className="text-xl font-bold group-hover:text-brand-secondary transition-colors"><EditableText path="contact.email" element="span" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-bg-dark text-white text-center px-8">
        <h2 className="text-2xl font-black mb-4 tracking-[0.2em] uppercase opacity-20">Son Ye Chan</h2>
        <div className="w-12 h-1 bg-brand-primary mx-auto mb-6 opacity-20"></div>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">© 2026 MD SYC. STRATEGIC GROWTH PARTNER.</p>
      </footer>
    </div>
  );
}
