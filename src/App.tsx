/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Public access for logging
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default content for the portfolio
const DEFAULT_CONTENT = {
  hero: {
    tag: "E-commerce MD",
    title1: "PORTFOLIO",
    title2: "",
    desc: "안녕하세요 5년차 온라인MD 손예찬입니다. 데이터 속에서 고객의 니즈를 발견하고, 긴밀한 소통으로 최적의 상품을 제안해 매출을 극대화하겠습니다."
  },
  project: {
    tag: "EXPERIENCE",
    title: " 언제나 영업팀 매출 1위를 놓치지 않았던 이유",
    subtitle: "",
    highlights: [
      { label: "매출 성장", value: "3,000만 → 1억 달성" },
      { label: "채널 확장", value: "GS SHOP 등 6개 채널" },
      { label: "운영 효율", value: "3,500개 SKU 데이터 관리" },
      { label: "성과 인정", value: "기대 매출의 200% 달성" }
    ],
    strategy: [
      { asIs: "소통 부재: 채널 MD와의 접점 부족", toBe: "관계 강화: 밀착 커뮤니케이션을 통한 메인 구좌 확보" },
      { asIs: "단순 등록: 상품 등록 후 방치 및 관리 부실", toBe: "전시 최적화: 브랜드관/상시 딜 활용 및 UI/UX 개선" },
      { asIs: "비효율: 모든 채널에 동일한 행사 제안", toBe: "효율성 확보: 채널별 특성에 맞춘 이벤트 기획 및 운영" }
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
          "프로모션 기획 및 행사상품 취합",
          "입점 업체 관리 및 커뮤니케이션",
          "신규 브랜드 소싱 및 상품 큐레이션",
          "데이터 분석 및 리포트 작성"
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
          "상품 발주와 납품 관련 SCM 및 거래처 커뮤니케이션"
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
    tag: "sabangnet",
    title: "사방넷 사용 상급",
    skills: [
      { title: "상품 관리", items: ["상품 대량 등록 및 수정", "품번/옵션 매핑 최적화", "쇼핑몰별 세트 등록"] },
      { title: "주문/재고", items: ["실시간 주문 수집 및 매칭", "물류 창고별 재고 연동", "품절 관리 및 송장 전송"] },
      { title: "클레임 처리", items: ["취소/반품/교환 프로세스", "고객 문의 통합 관리", "클레임 데이터 분석"] },
      { title: "초기 세팅", items: ["신규 쇼핑몰 API 연동", "기본 정보 및 관리 매핑", "시스템 최적화 환경 구축"] }
    ]
  },
  channels: {
    tag: "Handling Channels",
    title: "담당 유통채널",
    items: [
      { type: "종합몰", desc: "GS SHOP, CJ온스타일, 현대몰, 홈앤쇼핑 등" },
      { type: "폐쇄/복지몰", desc: "현대이지웰, 삼성카드, 복지포인트몰 등" },
      { type: "전문몰/오픈마켓", desc: "하프클럽, 마켓컬리, 홀라인, 쿠팡 등" }
    ],
    image: "https://raw.githubusercontent.com/sonye2618-debug/SONYECHAN/a7bd636531a5072f593dcc3a70b08934687784d7/%EC%87%BC%ED%95%91%EB%AA%B0%EB%A1%9C%EA%B3%A0.png"
  },
  data: {
    tag: "Exel Dashboard",
    title: "모든 답은 데이터가 지니고 있다 ",
    subtitle: "Raw 데이터를 다양한 함수와 수식으로 자동화하여 분석하고 데이터를 시각화 하여 업무효율을 높였습니다",
    cardTitle: "데이터 분석 및 전략",
    desc: "사입을 위해 소싱 아이템의 적정 판매 가격대, 브랜드, 수요를 예측하고 소싱의 '정확도'를 높이기 위한 데이터 대시보드 입니다 .",
    pointsTitle: "핵심 분석 포인트",
    points: [
      { 
        label: "적정 판매가 설정", 
        desc: "아이템별 평균 판매가(ASP) 분석을 바탕으로 적정 마진 도출" 
      },
      { 
        label: "메인 브랜드군 파악", 
        desc: "매출 점유율 분석을 통해 사입 비중 최적화 및 신규 소싱 브랜드 선정" 
      },
      { 
        label: "시즌별 소싱 전략", 
        desc: "시즌별 주력 상품의 오픈 시기 및 프로모션 계획" 
      },
      { 
        label: "수요 및 물량 예측", 
        desc: "수요 예측을 통해 사입 재고 리스크 다운" 
      }
    ],
    image: "https://raw.githubusercontent.com/sonye2618-debug/SONYECHAN/a7bd636531a5072f593dcc3a70b08934687784d7/%EC%97%91%EC%85%80%EB%8C%80%EC%89%AC%EB%B3%B4%EB%93%9C.png"
  },
  improvement: {
    tag: "Success Case",
    title: "상품 등록 프로세스 간소화 (사입팀)",
    subtitle: "더 나은 방식을 찾고 구조를 바꾸는 실행력",
    caseTitle: "01. 상품 등록 운영 내재화",
    desc: "고비용으로 외주에 의존하는 구조를 바꾸고 직접 시뮬레이션하여 실현 가능성을 검증하고, 아르바이트 채용 및 자체 운영 체계를 구축하여 성과를 창출했습니다.",
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
      desc: "등록 단가 250원(95% 절감) 달성 및 업무 시간 89% 단축" 
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
    tag: "CRM Marketing",
    title: "데이터로 정조준한 타겟 마케팅",
    subtitle: "한정된 예산으로 최대 효율을 뽑아내는 타겟 분리 및 CRM 최적화 전략",
    problemInsight: {
      title: "무엇이 문제였을까요?",
      items: [
        { label: "관성적인 프로모션", desc: "차별성 없는 단순 할인 반복으로 구매 반응률 하락 및 마케팅 비용 낭비" },
        { label: "모호한 타겟팅", desc: "전체 고객 대상의 무차별적인 광고 집행으로 실구매 핵심 고객층 파악 불가" }
      ]
    },
    actions: [
      { 
        title: "구매 주체 재정의", 
        desc: "데이터 분석을 통해 '실구매자'와 '대리 구매자'를 구분하여 소구 포인트 전면 수정 및 최적화" 
      },
      { 
        title: "골든타임 도출", 
        desc: "CRM 매체별 클릭률과 구매 전환이 가장 집중되는 피크 타임 분석 및 자동화 발송 전략 수립" 
      },
      { 
        title: "이탈 방지 설계", 
        desc: "장바구니 및 연관 구매 데이터를 분석하여 이탈 구간을 차단하는 맞춤형 상품 큐레이션 구축" 
      },
      { 
        title: "퍼포먼스 최적화", 
        desc: "메시지 문구와 랜딩 페이지 A/B 테스팅을 통해 성과를 데이터로 증명하고 운영 효율 극대화" 
      }
    ],
    result: {
      title: "Success Result",
      items: [
        "프로모션 매출 전월 대비 20% 신장",
        "불필요한 광고비 30% 절감 및 효율 개선"
      ]
    }
  },
  tricycleProject: {
    title: "하프클럽 아웃도어/골프 카테관 운영",
    subtitle: "카테고리 활성화를 위한 전략적 구좌 운영 및 브랜드 큐레이션",
    items: [
      {
        title: "전략적 상품 큐레이션 및 특가 DEAL 운영",
        desc: "카테고리 내 베스트셀러와 트렌드 아이템을 조합한 큐레이션으로 클릭률(CTR) 상승",
        image: "https://raw.githubusercontent.com/sonye2618-debug/SONYECHAN/a275a3397e5ec0662cbab103febff6c914f774f9/%ED%95%AB%EB%94%9C.jpg"
      },
      {
        title: "시즈널 이슈를 반영한 기획전 운영",
        desc: "신규 브랜드 홍보, 휴가 시즌, 명절, 계절 변화 등에 맞춘 테마 기획전 총괄.",
        image: "https://raw.githubusercontent.com/sonye2618-debug/SONYECHAN/a275a3397e5ec0662cbab103febff6c914f774f9/%EC%B9%B4%ED%85%8C%EA%B4%80.png"
      }
    ]
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
    mainVision: "데이터로 검증하고 성과로 보여드리겠습니다.",
    mainVisionDesc: "단순한 상품 운영을 넘어, 데이터 분석을 통한 정교한 타겟팅과 유기적인 협업으로 브랜드의 시장 점유율을 극대화하겠습니다. 단기적으로는 채널별 운영 효율화를, 장기적으로는 고객의 구매 습관을 설계하는 독보적인 MD로 성장하는 것이 목표입니다.",
    strategies: [
      { 
        label: "PRODUCT", 
        title: "상품 관리", 
        desc: "판매 데이터의 다각도 분석을 통해 잠재적 니즈를 발굴하고, 트렌드 변화에 기민하게 대응하는 상품 기획을 추진하겠습니다." 
      },
      { 
        label: "PROMOTION", 
        title: "프로모션", 
        desc: "상품의 특성과 시즌별 고객 접점을 분석하여 적시적소에 맞는 프로모션을 기획, 일회성 구매가 아닌 브랜드 로열티로 이어지는 캠페인을 운영하겠습니다." 
      },
      { 
        label: "PRICE", 
        title: "프라이싱", 
        desc: "단순한 저가 경쟁에서 벗어나, 고객의 구매 패턴과 카테고리별 선호 가격대를 정밀 분석하여 구매 전환율이 가장 높은 최적 가격 체계를 구축하겠습니다." 
      },
      { 
        label: "PLACE", 
        title: "유통 및 서비스", 
        desc: "행동 데이터 기반의 최적 구매 여정 제안 및 유관 부서와의 긴밀한 협업으로 최상의 경험을 서비스하겠습니다." 
      }
    ],
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visitorCompany, setVisitorCompany] = useState('');
  const [inputCompany, setInputCompany] = useState('');

  // Check for existing authorization
  useEffect(() => {
    const saved = sessionStorage.getItem('portfolio_auth');
    if (saved) {
      setIsAuthorized(true);
      setVisitorCompany(saved);
    }
  }, []);

  const handleEnter = async (e: FormEvent) => {
    e.preventDefault();
    if (inputCompany.trim()) {
      const company = inputCompany.trim();
      
      try {
        await addDoc(collection(db, 'visitors'), {
          companyName: company,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'visitors');
      }

      sessionStorage.setItem('portfolio_auth', company);
      setVisitorCompany(company);
      setIsAuthorized(true);
    }
  };

  // Set up reveal animation logic
  useEffect(() => {
    if (!isAuthorized) return;
    
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

    // Call reveal immediately on load
    setTimeout(reveal, 100);

    window.addEventListener("scroll", reveal);
    window.addEventListener("load", reveal);

    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("load", reveal);
    };
  }, [isAuthorized]);

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
    <div className="bg-brand-cream min-h-screen text-brand-primary">
      {!isAuthorized ? (
        <div className="fixed inset-0 z-[100] bg-brand-cream flex items-center justify-center p-8 overflow-y-auto">
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl w-full relative z-10"
          >
            <div className="text-center mb-12">
               <div className="pill-badge mb-6 inline-block bg-brand-yellow/50 border-black/5">Entry Gate</div>
               <h1 className="font-serif italic text-6xl md:text-7xl text-black leading-none mb-4">Welcome.</h1>
               <p className="text-brand-primary/60 font-serif italic text-lg">포트폴리오 열람을 위해 회사명을 입력해주세요.</p>
            </div>

            <form onSubmit={handleEnter} className="window-frame bg-white p-8 md:p-12">
               <div className="window-header mb-8">
                  <div className="dot-red"></div>
                  <div className="dot-yellow"></div>
                  <div className="dot-green"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-30">authorization_required.key</span>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest block mb-3 text-brand-rust">Company Name</label>
                    <input 
                      type="text" 
                      value={inputCompany}
                      onChange={(e) => setInputCompany(e.target.value)}
                      placeholder="회사명을 입력하세요"
                      className="w-full bg-brand-cream/50 border border-black p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage transition-all font-sans font-medium"
                      required
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand-sage border border-black rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-[0.98]"
                  >
                    Enter Portfolio
                  </button>
               </div>
            </form>
            
            <div className="mt-12 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">© 2026 SONYECHAN DESIGNER</p>
            </div>
          </motion.div>

          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sage/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
      ) : (
        <>
          {/* Welcome Toast (Optional) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-8 right-8 z-[60] bg-white border border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4"
          >
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[11px] font-black uppercase tracking-widest">
               Access Granted: <span className="text-brand-rust">{visitorCompany}</span>
             </p>
          </motion.div>

          {/* Editorial Header / Nav */}
      <header className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center pointer-events-none">
        <div className="bg-white p-3 border border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto cursor-pointer">
          <div className="w-6 h-0.5 bg-black mb-1.5"></div>
          <div className="w-6 h-0.5 bg-black"></div>
        </div>
      </header>

      {/* Section 1: Editorial Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-brand-yellow/30">
        <div className="absolute inset-0 grid-pattern opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col items-center">
            <div className="pill-badge mb-8 bg-brand-sage/40 border-brand-primary/20">
              <EditableText path="hero.tag" />
            </div>
            
            <div className="relative text-center mb-12">
              <div className="relative inline-block">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-[0.03] pointer-events-none">
                   <div className="w-full h-full relative">
                      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-brand-rust rounded-tl-full border-r border-b border-brand-cream"></div>
                      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-rust rounded-tr-full border-l border-b border-brand-cream"></div>
                      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-rust rounded-bl-full border-r border-t border-brand-cream"></div>
                      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-brand-rust rounded-br-full border-l border-t border-brand-cream"></div>
                   </div>
                </div>
                <h1 className="font-serif italic text-[12vw] md:text-[8vw] leading-[0.8] tracking-tighter text-black select-none pointer-events-none relative z-10">
                  <motion.span 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="block"
                  >
                    <EditableText path="hero.title1" />
                  </motion.span>
                </h1>
              </div>
              
              <div className="mt-12 max-w-xl mx-auto backdrop-blur-sm bg-white/30 p-8 rounded-3xl border border-white/50 text-center reveal">
                <p className="text-xl md:text-2xl font-serif italic text-brand-primary/80 mb-8 leading-relaxed">
                  <EditableText path="hero.desc" />
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-brand-sage border border-black rounded-full font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Explore Work
                  </button>
                  <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-white border border-black rounded-full font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Let's Talk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 -right-10 w-40 h-40 bg-brand-sage/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-10 w-60 h-60 bg-brand-yellow/30 rounded-full blur-3xl"></div>
      </section>

      {/* Marquee Ticker */}
      <div className="marquee-container">
        <div className="marquee-content py-1">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em]">
              <span>New Clients</span>
              <span className="text-brand-rust">●</span>
              <span>Available Now</span>
              <span className="text-brand-rust">●</span>
              <span>Strategic Operations</span>
              <span className="text-brand-rust">●</span>
              <span>Growth Hacking</span>
              <span className="text-brand-rust">●</span>
            </div>
          ))}
        </div>
      </div>


      {/* Section: Work Experience Editorial */}
      <section id="work" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-20 text-center reveal">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-primary opacity-40">
              Work History
            </h2>
          </div>

          <div className="grid gap-16">
            {Array.isArray(content.experience.items) && content.experience.items.map((item, idx) => (
              <div key={idx} className="group reveal border-t border-black pt-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
                  <div className="lg:w-1/4">
                    <span className="font-serif italic text-5xl text-brand-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500">0{idx + 1}</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 opacity-50">
                      <EditableText path={`experience.items.${idx}.period`} />
                    </p>
                  </div>
                  <div className="lg:w-2/4">
                    <h3 className="font-serif italic text-3xl md:text-4xl text-black mb-4">
                      <EditableText path={`experience.items.${idx}.company`} />
                    </h3>
                    <p className="text-brand-rust font-bold uppercase tracking-widest text-xs mb-6">
                      <EditableText path={`experience.items.${idx}.role`} />
                    </p>
                    <div className="space-y-4">
                      {Array.isArray(item.details) && item.details.map((detail, dIdx) => (
                        <p key={dIdx} className="text-brand-primary/70 font-medium leading-relaxed">
                          <EditableText path={`experience.items.${idx}.details.${dIdx}`} />
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-1/4 flex lg:justify-end">
                    <button className="w-16 h-16 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all group-hover:rotate-45">
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Project Sections Overview Header */}
      <section className="pt-32 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="section-tag mb-4 inline-block">PORTFOLIO HIGHLIGHTS</span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">주요 프로젝트 성과</h2>
          <p className="text-slate-400 mt-6 font-medium text-lg">성장 데이터와 전략적 실행력으로 증명한 커리어 하이라이트</p>
        </div>
      </section>

      {/* COMPANY SECTION 1: TRICYCLE (2023 - 2025) */}
      <div className="bg-white py-12 border-y border-black">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="pill-badge bg-brand-rust/20 border-brand-rust/50 text-brand-rust shrink-0">
              Phase 02
            </div>
            <h2 className="font-serif italic text-3xl md:text-4xl text-black tracking-tight leading-none">
              (주)트라이씨클 <span className="text-brand-rust font-sans not-italic text-sm tracking-[0.2em] uppercase font-black ml-4 hidden md:inline">| 하프클럽 사업부</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">2023 — 2025</span>
          </div>
        </div>
      </div>


      {/* Tricycle Project Block Editorial */}
      <section id="tricycle-project" className="py-40 bg-brand-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 overflow-hidden">
          <div className="mb-32 reveal flex flex-col md:flex-row items-end gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-brand-primary/20"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/40">
                  Key Highlights
                </span>
              </div>
              <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-tight mb-4">
                <EditableText path="tricycleProject.title" />
              </h3>
            </div>
            <p className="max-w-sm text-lg italic text-brand-primary/60 font-serif">
              <EditableText path="tricycleProject.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {Array.isArray((content as any).tricycleProject?.items) && (content as any).tricycleProject.items.map((item: any, idx: number) => (
              <div key={idx} className="reveal relative group">
                <div className="window-frame bg-white">
                   <div className="window-header">
                    <div className="dot-red"></div>
                    <div className="dot-yellow"></div>
                    <div className="dot-green"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-30">project_view_0{idx + 1}.jpg</span>
                  </div>
                  <div className="overflow-hidden bg-brand-sage/10">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-auto hover:scale-105 transition-transform duration-1000 grayscale hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 border-t border-black">
                     <h4 className="font-serif italic text-3xl text-black mb-4">
                      <EditableText path={`tricycleProject.items.${idx}.title`} />
                    </h4>
                    <p className="text-brand-primary/70 font-medium leading-relaxed">
                      <EditableText path={`tricycleProject.items.${idx}.desc`} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee 2 */}
      <div className="marquee-container bg-brand-sage">
        <div className="marquee-content py-1">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
              <span>Data-Driven Strategy</span>
              <span className="text-brand-rust">●</span>
              <span>Revenue Growth</span>
              <span className="text-brand-rust">●</span>
              <span>Efficiency First</span>
              <span className="text-brand-rust">●</span>
            </div>
          ))}
        </div>
      </div>


      {/* Section 4: Data Analysis Dashboard (Tricycle) Editorial */}
      <section id="data" className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-brand-sage/10 -skew-x-12 transform origin-top translate-x-32"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="reveal">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-brand-yellow"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/40">
                  <EditableText path="data.tag" />
                </span>
              </div>
              <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-[0.9] mb-8">
                <EditableText path="data.title" />
              </h3>
              <p className="text-xl text-brand-primary/60 italic font-serif mb-12">
                <EditableText path="data.subtitle" />
              </p>

              <div className="space-y-8">
                {Array.isArray(content.data.points) && content.data.points.map((point, idx) => (
                  <div key={idx} className="flex gap-6 group">
                     <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center shrink-0 group-hover:bg-brand-rust group-hover:text-white transition-colors font-black text-xs">
                        {idx + 1}
                     </div>
                     <div>
                        <h4 className="font-bold text-lg text-black mb-1">
                           <EditableText path={`data.points.${idx}.label`} />
                        </h4>
                        <p className="text-brand-primary/60 text-sm leading-relaxed">
                           <EditableText path={`data.points.${idx}.desc`} />
                        </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal">
              <div className="window-frame bg-white sticky top-40">
                <div className="window-header">
                  <div className="dot-red"></div>
                  <div className="dot-yellow"></div>
                  <div className="dot-green"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-30">dashboard_analytics.xlsx</span>
                </div>
                <div className="p-4 bg-slate-50">
                   <img 
                      src={(content.data as any).image} 
                      alt="Data Analysis Dashboard" 
                      className="w-full h-auto shadow-sm border border-black/5"
                      referrerPolicy="no-referrer"
                    />
                </div>
                <div className="p-8 border-t border-black bg-brand-yellow/10">
                   <h4 className="font-serif italic text-2xl mb-2">
                    <EditableText path="data.cardTitle" />
                   </h4>
                   <p className="text-brand-primary/70 text-sm leading-relaxed">
                    <EditableText path="data.desc" />
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Case Editorial */}
      <section id="success" className="py-40 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-rust/40 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-32 reveal">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="w-12 h-px bg-white/20"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                <EditableText path="improvement.tag" />
              </span>
              <span className="w-12 h-px bg-white/20"></span>
            </div>
            <h3 className="font-serif italic text-4xl md:text-5xl text-white leading-none">
              <EditableText path="improvement.title" />
            </h3>
            <p className="text-xl text-white/50 mt-8 italic font-serif">
              <EditableText path="improvement.subtitle" />
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-12 reveal">
               <div className="window-frame bg-neutral-900 !border-white/20 !shadow-none">
                  <div className="window-header !bg-neutral-800 !border-white/20">
                    <div className="dot-red"></div>
                    <div className="dot-yellow"></div>
                    <div className="dot-green"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest ml-4 text-white/30">case_results.json</span>
                  </div>
                  <div className="p-12 grid md:grid-cols-2 gap-20">
                     <div>
                        <h4 className="font-serif italic text-4xl mb-8 text-brand-rust">
                          <EditableText path="improvement.caseTitle" />
                        </h4>
                        <p className="text-lg text-white/60 leading-relaxed mb-12">
                          <EditableText path="improvement.desc" />
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                           {Array.isArray(content.improvement.stats) && content.improvement.stats.map((stat, idx) => (
                              <div key={idx} className="border-l border-white/20 pl-6">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                                  <EditableText path={`improvement.stats.${idx}.label`} />
                                 </p>
                                 <p className="text-5xl font-serif italic text-white flex items-end">
                                    <EditableText path={`improvement.stats.${idx}.value`} />
                                 </p>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-12">
                        <div className="p-8 border border-white/10 rounded-2xl bg-white/5">
                           <h5 className="font-black text-xs uppercase tracking-widest text-white/50 mb-4 flex items-center gap-3">
                              <span className="w-12 h-[1px] bg-white/20"></span>
                              <EditableText path="improvement.problem.title" />
                           </h5>
                           <p className="text-white/80 leading-relaxed">
                              <EditableText path="improvement.problem.desc" />
                           </p>
                        </div>
                        <div className="p-8 border border-white/10 rounded-2xl bg-brand-rust/10">
                           <h5 className="font-black text-xs uppercase tracking-widest text-brand-rust mb-4 flex items-center gap-3">
                              <span className="w-12 h-[1px] bg-brand-rust/30"></span>
                              <EditableText path="improvement.result.title" />
                           </h5>
                           <p className="text-white leading-relaxed font-medium">
                              <EditableText path="improvement.result.desc" />
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="p-12 border-t border-white/20 bg-white/5">
                     <h5 className="font-black text-xs uppercase tracking-widest text-white/50 mb-8">
                      <EditableText path="improvement.solution.title" />
                     </h5>
                     <div className="grid md:grid-cols-3 gap-8">
                        {Array.isArray(content.improvement.solution?.items) && content.improvement.solution?.items.map((item: any, idx: number) => (
                           <div key={idx} className="group">
                              <span className="text-neutral-700 font-serif italic text-4xl block mb-2 group-hover:text-brand-rust transition-colors">0{idx + 1}</span>
                              <p className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">
                                 <strong className="text-white block mb-1">
                                    <EditableText path={`improvement.solution.items.${idx}.label`} />
                                 </strong>
                                 <EditableText path={`improvement.solution.items.${idx}.desc`} />
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>


      {/* COMPANY SECTION 2: HOWON PLANET (2021 - 2022) Editorial */}
      <div className="bg-white py-12 border-y border-black">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="pill-badge bg-brand-primary/10 border-brand-primary shrink-0">
              Phase 01
            </div>
            <h2 className="font-serif italic text-3xl md:text-4xl text-black tracking-tight leading-none">
              호원플래닛 <span className="text-brand-primary font-sans not-italic text-sm tracking-[0.2em] uppercase font-black ml-4 hidden md:inline">| 벤더사 영업 및 소싱</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">2021 — 2022</span>
          </div>
        </div>
      </div>

      {/* Featured Project Section (Howon Planet) Editorial */}
      <section id="featured-project" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 mb-32 reveal">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-black/10"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                  <EditableText path="project.tag" />
                </span>
              </div>
              <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-tight">
                <EditableText path="project.title" />
              </h3>
            </div>
            <div className="flex items-end">
               <p className="text-xl text-brand-primary/60 italic font-serif">
                <EditableText path="project.subtitle" />
               </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 reveal">
            {Array.isArray(content.project.highlights) && content.project.highlights.map((item: any, idx: number) => (
              <div key={idx} className="p-8 bg-brand-sage border border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative group overflow-hidden transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-3 font-serif italic text-3xl text-black/5">0{idx + 1}</div>
                <p className="text-[10px] uppercase font-black text-brand-primary mb-3 tracking-[0.2em]">
                  <EditableText path={`project.highlights.${idx}.label`} />
                </p>
                <p className="text-2xl font-serif italic text-black leading-tight">
                  <EditableText path={`project.highlights.${idx}.value`} />
                </p>
              </div>
            ))}
          </div>

          {/* Strategy & Actions Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-start reveal">
            <div className="lg:col-span-12">
               <div className="window-frame !shadow-none mb-12">
                  <div className="window-header !bg-brand-sage">
                    <div className="dot-red"></div>
                    <div className="dot-yellow"></div>
                    <div className="dot-green"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest ml-4">strategy_mapping.vsd</span>
                  </div>
                  <div className="p-12 space-y-12">
                    {Array.isArray(content.project.strategy) && content.project.strategy.map((item: any, idx: number) => (
                      <div key={idx} className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                           <span className="text-[10px] font-black uppercase text-brand-primary/40 block mb-2">AS-IS (Problem)</span>
                           <p className="text-lg text-brand-primary/60 border-l-2 border-black/10 pl-6 italic font-serif">
                            <EditableText path={`project.strategy.${idx}.asIs`} />
                           </p>
                        </div>
                        <div className="relative">
                           <span className="text-[10px] font-black uppercase text-brand-rust block mb-2">TO-BE (Strategy)</span>
                           <p className="text-xl text-black font-serif italic pl-6 border-l-2 border-brand-rust">
                            <EditableText path={`project.strategy.${idx}.toBe`} />
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-12">
               <div className="grid md:grid-cols-3 gap-8">
                  {Array.isArray(content.project.actions) && content.project.actions.map((action: any, idx: number) => (
                    <div key={idx} className="p-10 border border-black/10 bg-brand-cream/50 rounded-2xl group hover:bg-brand-yellow transition-colors">
                      <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-serif italic text-2xl mb-6 group-hover:bg-black group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-black mb-4">
                        <EditableText path={`project.actions.${idx}.title`} />
                      </h4>
                      <p className="text-brand-primary/60 text-sm leading-relaxed">
                        <EditableText path={`project.actions.${idx}.desc`} />
                      </p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    <div className="bg-brand-yellow pt-40 pb-20 text-center border-y border-black">
       <span className="pill-badge mb-6 inline-block bg-white/80 border-black/5">General Competency</span>
       <h2 className="font-serif italic text-4xl md:text-5xl text-black leading-none">운영 시스템 및 채널 역량</h2>
    </div>

    {/* Section: Sabangnet Mastery Editorial */}
    <section id="sabangnet" className="py-40 bg-brand-cream overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-end mb-32 reveal">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-brand-sage"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/40">
                <EditableText path="sabangnet.tag" />
              </span>
            </div>
            <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-[0.9]">
              <EditableText path="sabangnet.title" />
            </h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
          {Array.isArray(content.sabangnet.skills) && content.sabangnet.skills.map((skill, idx) => (
            <div key={idx} className="window-frame bg-white group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="window-header bg-brand-yellow/30">
                <div className="dot-red"></div>
                <div className="dot-yellow"></div>
                <div className="dot-green"></div>
              </div>
              <div className="p-8">
                <h4 className="font-serif italic text-3xl mb-4 text-black group-hover:text-brand-rust transition-colors">
                  <EditableText path={`sabangnet.skills.${idx}.title`} />
                </h4>
                <ul className="space-y-3">
                  {Array.isArray(skill.items) && skill.items.map((item, iIdx) => (
                    <li key={iIdx} className="text-sm text-brand-primary/60 flex items-start gap-2">
                      <span className="text-brand-rust font-black">/</span>
                      <EditableText path={`sabangnet.skills.${idx}.items.${iIdx}`} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Section: Channels Editorial */}
    <section id="channels" className="py-40 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 mb-24 reveal items-center">
          <div>
            <div className="pill-badge mb-6 inline-block bg-brand-yellow">
              <EditableText path="channels.tag" />
            </div>
            <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-[0.9]">
              <EditableText path="channels.title" />
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(content.channels.items) && content.channels.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 group border-b border-black/5 pb-4">
                <span className="font-serif italic text-4xl text-brand-rust opacity-20">0{idx + 1}</span>
                <div>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-brand-primary/40 mb-1">
                    <EditableText path={`channels.items.${idx}.type`} />
                  </h4>
                  <p className="text-black font-bold text-lg">
                    <EditableText path={`channels.items.${idx}.desc`} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal max-w-4xl mx-auto">
          <div className="window-frame bg-white">
            <div className="window-header">
              <div className="dot-red"></div>
              <div className="dot-yellow"></div>
              <div className="dot-green"></div>
              <span className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-30">channel_distribution.png</span>
            </div>
            <div className="p-8 md:p-16 flex items-center justify-center">
              <img 
                src={(content.channels as any).image} 
                alt="주요 담당 채널 로고 모음" 
                className="w-full h-auto mix-blend-multiply opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Target Segmentation & Promotion Project Editorial */}
    <section id="promotion-project" className="py-40 bg-brand-yellow relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 mb-32 reveal">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-black/10"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                <EditableText path="promotionProject.tag" />
              </span>
            </div>
            <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-[0.9]">
              <EditableText path="promotionProject.title" />
            </h3>
          </div>
          <div className="flex items-end">
             <p className="text-xl text-brand-primary/60 italic font-serif">
              <EditableText path="promotionProject.subtitle" />
             </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 reveal">
          {Array.isArray(content.promotionProject.actions) && content.promotionProject.actions.map((action, idx) => (
            <div key={idx} className="window-frame bg-white p-8 hover:-translate-y-2 transition-transform">
              <span className="text-5xl font-serif italic text-brand-rust block mb-6">0{idx + 1}</span>
              <h4 className="font-black text-xs uppercase tracking-widest mb-4">
                <EditableText path={`promotionProject.actions.${idx}.title`} />
              </h4>
              <p className="text-sm text-brand-primary/70 leading-relaxed font-medium">
                <EditableText path={`promotionProject.actions.${idx}.desc`} />
              </p>
            </div>
          ))}
        </div>
        
        <div className="reveal">
           <div className="window-frame bg-black text-white p-12">
              <h4 className="font-serif italic text-4xl mb-12 text-center text-brand-rust">
                <EditableText path="promotionProject.result.title" />
              </h4>
              <div className="flex flex-col md:flex-row justify-center gap-12 items-center">
                 {Array.isArray(content.promotionProject.result.items) && content.promotionProject.result.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-full border border-brand-rust flex items-center justify-center font-black">
                          {idx + 1}
                       </div>
                       <p className="text-xl font-serif italic max-w-sm">
                          {item}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </section>

    {/* Final Vision Section Editorial */}
    <section id="vision" className="py-40 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-32 reveal">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-black/10"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
              <EditableText path="vision.tag" />
            </span>
          </div>
          <h3 className="font-serif italic text-4xl md:text-[5vw] text-black leading-none mb-12">
            <EditableText path="vision.title" />
          </h3>
          
          <div className="window-frame bg-brand-sage/10 p-12 md:p-20 relative">
             <div className="relative z-10">
                <h4 className="font-serif italic text-3xl md:text-5xl text-black mb-8 leading-tight max-w-4xl">
                  "<EditableText path="vision.mainVision" />"
                </h4>
                <p className="text-xl text-brand-primary/60 font-serif italic max-w-2xl leading-relaxed">
                  <EditableText path="vision.mainVisionDesc" />
                </p>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>

        {/* 4P Strategy Grid with Central Diagram */}
        <div className="relative mb-32 reveal">
          <div className="grid md:grid-cols-2 gap-px bg-black/10 border border-black/10">
             {Array.isArray(content.vision.strategies) && content.vision.strategies.map((strategy, idx) => (
               <div key={idx} className={`bg-white p-12 group hover:bg-brand-yellow transition-colors ${idx % 2 === 0 ? 'md:text-right md:pr-40' : 'md:text-left md:pl-40'} py-20`}>
                  <span className="text-sm font-black uppercase tracking-[0.4em] text-brand-rust mb-4 block">
                    <EditableText path={`vision.strategies.${idx}.label`} />
                  </span>
                  <h5 className="font-serif italic text-4xl text-black mb-6">
                    <EditableText path={`vision.strategies.${idx}.title`} />
                  </h5>
                  <p className="text-lg text-brand-primary/60 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                     <EditableText path={`vision.strategies.${idx}.desc`} />
                  </p>
               </div>
             ))}
          </div>

          {/* Central 4P Circular Diagram (CSS/SVG Version to match image) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-64 h-64 z-20 pointer-events-none">
             <div className="relative w-full h-full p-2 bg-white rounded-full shadow-2xl border-4 border-brand-cream">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-full relative">
                      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#f15a24] rounded-tl-full border-r-[1.5px] border-b-[1.5px] border-white flex items-center justify-center">
                         <span className="text-[9px] font-black text-white">PRODUCT</span>
                      </div>
                      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#f15a24] rounded-tr-full border-l-[1.5px] border-b-[1.5px] border-white flex items-center justify-center">
                         <span className="text-[9px] font-black text-white">PROMOTION</span>
                      </div>
                      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#f15a24] rounded-bl-full border-r-[1.5px] border-t-[1.5px] border-white flex items-center justify-center">
                         <span className="text-[9px] font-black text-white">PRICE</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#f15a24] rounded-br-full border-l-[1.5px] border-t-[1.5px] border-white flex items-center justify-center">
                         <span className="text-[9px] font-black text-white text-center px-1">PLACE</span>
                      </div>
                   </div>
                </div>
                {/* Interaction Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center border-4 border-[#f15a24] shadow-inner z-30">
                   <span className="text-3xl font-black text-[#f15a24] leading-none mb-1">4P</span>
                   <div className="w-8 h-0.5 bg-[#f15a24]/20"></div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 reveal border-t-2 border-black pt-20">
          {Array.isArray(content.vision.items) && content.vision.items.map((item, idx) => (
            <div key={idx} className="group">
               <span className="text-brand-rust font-black text-xs uppercase tracking-widest mb-4 block">
                <EditableText path={`vision.items.${idx}.step`} /> ● <EditableText path={`vision.items.${idx}.label`} />
               </span>
               <h4 className="font-serif italic text-3xl text-black mb-6 group-hover:text-brand-rust transition-colors">
                <EditableText path={`vision.items.${idx}.title`} />
               </h4>
               <p className="text-brand-primary/60 font-medium text-sm leading-relaxed">
                <EditableText path={`vision.items.${idx}.desc`} />
               </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Contact Section Editorial */}
    <footer id="contact" className="py-40 bg-brand-sage relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-black/10"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                <EditableText path="contact.tag" />
              </span>
            </div>
            <h3 className="font-serif italic text-3xl md:text-4xl text-black leading-none mb-12">
              <EditableText path="contact.title" />
            </h3>
            <p className="text-2xl text-brand-primary/70 font-serif italic max-w-md leading-relaxed mb-12">
              <EditableText path="contact.desc" />
            </p>
          </div>
          
          <div className="flex flex-col justify-end space-y-8">
            <div className="p-12 bg-white border border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
               <div className="space-y-8">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-rust block mb-2">Phone</span>
                    <p className="text-xl md:text-2xl font-sans font-black text-black">
                      010-5038-4033
                    </p>
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-rust block mb-2">Email</span>
                    <p className="text-xl md:text-2xl font-sans font-black text-black">
                      <EditableText path="contact.email" />
                    </p>
                 </div>
               </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-12">
               <span>© 2026 SONYECHAN DESIGNER</span>
               <span>ALL RIGHTS RESERVED</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
    )}
  </div>
);
}
