const APP_VERSION_INFO = {
  projectName: "Coffee Taste Archive - SCA 120종 스페셜",
  projectShortCode: "CTA",
  projectTitleKor: "커피 맛 아카이브",
  engineName: "Casper™ V1",
  version: "2.7.6",
  stage: "α3",
  schemaVersion: "v4",
  get displayLabel() {
    return `${this.projectShortCode} v${this.version}${this.stage ? ` (${this.stage})` : ""}`;
  },
  updatedAt: "2026-11-24",
  dbCount: 120,
  history: [
    {
      version: "2.7.6",
      stage: "α3",
      date: "2026-11-24",
      summary: "새틀라이트 시계 디자인을 t-v1.2 포렌식 Ōtsuka Lōtec No. 5 Kai 엔진으로 전면 교체(카타야마 스퀘어 지오메트릭 벡터 숫자·대형 4-패드 말테즈 위성 휠·3연결 대칭 스틸 와이어 스프링·연속 일체형 Y-브릿지·4:18 플레어드 피니언 용두·9시 이중 안티백래시 기어·5:30 보타이 선버스트 스몰 세컨드·내/외측 이중 분 트랙·CASPER™ · V1 ENGINE / NO.1 PRO 플러시 실버 명판 + 무필터 Retina 벡터 유지)"
    },
    {
      version: "2.7.5",
      stage: "α3",
      date: "2026-11-24",
      summary: "새틀라이트 시계 웹 해상도 저하(래스터화 블러) 완전 해소(SVG feDropShadow·CSS filter:drop-shadow·유휴 preserve-3d/backface-visibility 제거 → 순수 벡터 그림자·::before box-shadow·geometricPrecision) 및 각인/라벨 변경(CASPER™ · V1 ENGINE · NO.1 PRO · NO.1 PRO · ALGEBRA)"
    },
    {
      version: "2.7.4",
      stage: "α3",
      date: "2026-11-24",
      summary: "새틀라이트 아워 시계(satellite-clock.js) 1시 밸런스 휠·헤어스프링 정밀 재설계: 각진 사다리꼴 창 폐기 → 원형 챔퍼 오픈하트(r=22.2) · 3.5회전 아르키메데스 나선 헤어스프링 · 3스포크 황동 밸런스 휠 · 새틴 실버 밸런스 콕 · 파라쇼크 샤통/루비 주얼 및 9시 기어 톤 조화 적용"
    },
    {
      version: "2.7.3",
      stage: "α3",
      date: "2026-11-23",
      summary: "Casper™ V1 10,000종 검색 병목 해소(루프 호이스팅·origin WeakMap 캐시·ASCII fast-path·결합 정규화 → 색인 <1초·검색 <5ms·4축 휠 <0.1ms BENCHMARK_PASS), Ōtsuka Lōtec No. 5 Kai 새틀라이트 시계 실물 Raw CNC 실버 스틸 리디자인(4-Arm 크로스 패들·이중 레일 수평 블랙 분 숫자·챔퍼 Y자 3-Arm 브릿지·5:30 선버스트 스몰 세컨드 6시 레드 포인터·좌상/좌하 실버 아치 명판·얇은 316L 베젤/박스 사파이어 림), 미사용 weather-service.js 삭제 및 회귀 60/60 통과"
    },
    {
      version: "2.7.2",
      stage: "α3",
      date: "2026-11-23",
      summary: "하단 4키 시소 버튼 '산지'를 '원산지'로 변경하고, 푸터 '☕ 마셔본' 버튼의 이모티콘을 제거해 '마셔본 원두'로 통일(KR/EN/JP 및 튜토리얼 안내 동기화)"
    },
    {
      version: "2.7.1",
      stage: "α3",
      date: "2026-11-23",
      summary: "Ōtsuka Lōtec No. 5 Kai(5号 改) 새틀라이트 아워 시계(satellite-clock.js) 이식: 8계층 순수 SVG(316L 브러시드 스틸·4시 용두·건메탈 오픈워크·4Hz 황동 밸런스 휠·5:30 1.5mm 볼베어링 스몰 세컨드·8시 커스텀 롤러 90° 자전·3개 위성 시침·Y자 3-Arm CNC 브릿지·우측 120° 분 트랙·CASPER™ · CTA / NO.5 PRO 오마주 각인·사파이어 반사광), 설정 면 2열 타임피스 계기판(5270P 미닛 리피터 타종·600배속 시연·다국어 완역) 및 가시성 기반 rAF 자동 일시정지 적용"
    },
    {
      version: "2.7.0",
      stage: "α3",
      schemaVersion: "v4",
      date: "2026-11-23",
      summary: "CTA Pro UI 최종 정제 & Schema v4 10,000종 확장 아키텍처 구축: 하단 4키 시소 버튼 이모티콘 제거 및 설정 면 Today's Pick·날씨/위치 UI·weather-service.js 로드 제거(2단 균형 타임피스 계기판), Schema v4 국내 로스터리 상품 표준(docs/schema_v4_spec.md) · 2-Tier 하이브리드 로더(data-loader.js) · CSV 분할 빌드 파이프라인(scripts/build-db.py) · 30장 무한 스크롤 가상화 · Casper™ V1 사전 색인(초성/로스터리/125버킷) · 150ms 디바운스 · 10,000종 벤치마크(tests/casper-benchmark-10k.js) 완료"
    },
    {
      version: "2.6.4",
      stage: "α3",
      schemaVersion: "v3.4",
      date: "2026-11-23",
      summary: "CTA Pro 검색 면 밀도 밸런스 & 곡률 통일 패치: #drumFaceSearch를 4단 컴팩트 구성(상단 검색 헤더+120종 아카이브 배지 · 46px 검색창 · 빠른 검색 키워드 칩 8종 · 6px 박스형 입문자 10초 요약)으로 재구성하고, 데크 외곽(10px)·상/하단(9px)·내부 요소(6px/5px) 동심원 곡률 통일 및 미사용 .core-categories-* 스타일 정리"
    },
    {
      version: "2.6.3",
      stage: "α3",
      schemaVersion: "v3.4",
      date: "2026-11-23",
      summary: "CTA Pro 검색 면 경량화 & 룰렛 버튼명 변경: #drumFaceSearch에서 MAIN TASTE CATEGORY(#coreCategoriesSection) 제거 및 검색창+입문자 10초 요약 세로 중앙 정렬, 하단 4키 '🎰 룰렛' 버튼을 '🎰 맞춤 원두 조합'(EN: Taste Match / JA: 好み診断)으로 변경하고 모바일 390px 줄바꿈·겹침 방지 그리드 비율 조정, 6단계 튜토리얼 Step 1 다국어 안내 동기화"
    },
    {
      version: "2.6.2",
      stage: "α3",
      schemaVersion: "v3.4",
      date: "2026-11-23",
      summary: "CTA Pro 하단 슬릿 LED 절제 리터칭: 메인 4키(.piano-key 22px)·상세 모달 시소 탭(.modal-tab-btn 24px) 슬릿 인디케이터를 짧은 중앙 고정 폭으로 통일하고, 과한 네온·powerLightWarmup 키프레임 제거 후 차분한 테라코타 레드(#C24525) 즉시 점등(opacity 0.1s)으로 정제"
    },
    {
      version: "2.6.1",
      stage: "α3",
      schemaVersion: "v3.4",
      date: "2026-11-23",
      summary: "CTA Pro 마감 폴리싱: 모바일 핀치 줌 허용(viewport user-scalable=no 제거), NO.22 온두라스 마르칼라 유기농 명칭 정정(혼두라스 별칭 유지), 심리스 빈티지 종이 드럼 데크·미세 음각 곡면·톱니 및 로스트 우드 푸터(#362820) 조화, 메인 4키·상세 모달 시소 탭 아날로그 전원불 슬릿 LED(0.32s powerLightWarmup) 적용"
    },
    {
      version: "2.6.0",
      stage: "α3",
      schemaVersion: "v3.4",
      date: "2026-11-23",
      summary: "CTA Pro 구축: v2.5.1 오리지널 빈티지 디자인(웜 페이퍼 팔레트·자간·4축 썸휠·소형 고스트 '?' 버튼·시소 탭 비례) 유지 위에 4면 수직 드럼 데크(0px 고정 높이·18px 곡면 장식·6px 톱니·3D rotateX), 균형 4연동 빈티지 시소 바(하단 2.5px 얇은 선), 인스크린 원산지 도감, 설정 타임피스·날씨/시간 Today's Pick 및 v2.5.1 택타일 3열 컨트롤, 다크 에스프레소 통합 푸터 바(전체 원두·마셔본·6단계 가이드), 우측 플로팅 ↑ FAB(2종 비교 트레이 자동 오프셋), 상세 도감 간략히/자세히 개편(영수증 제거·Schema v3.4 다이얼링 노트 연동) 완료"
    },
    {
      version: "2.5.1",
      stage: "α3",
      date: "2026-11-19",
      summary: "Phase 2-1 긴급 패치: boot.js를 #disclaimerOverlay 직후로 이동해 0프레임 FOUC 차단 복원, Dispenser v2 잔존 문구 Casper™ V1 통일, GEMINI.md 단계 동기화 및 Git 저장소·v2.5.1-alpha3 태그 초기화"
    },
    {
      version: "2.5.0",
      stage: "α3",
      schemaVersion: "v3.2",
      date: "2026-11-19",
      summary: "Phase 2-1 (Alpha3 코어) 완료: Casper™ V1 검색 엔진 분리 및 승격, 인라인 핸들러 0건 & XSS 방어, 공백 복합어·외래어 오타·다중필드 초성·생산자 검색 고도화, 실시간 자동완성·검색기록 연동, jsc 회귀 50/50 통과, Gate 2-1 브라우저 검증 완료"
    },
    {
      version: "2.4.0",
      stage: "α2",
      schemaVersion: "v3.1",
      date: "2026-11-19",
      summary: "Phase 1 (Alpha2) 완료: 49종 생산자 3그룹 검증·재분류(실명 42·지역등급 53·검증대기 9·가짜출처 0), EN/JP 한국어 혼입 제거, WCR 품종 정규화, 간단(3축)/자세히(5축+단맛) SVG 레이더 차트, 추출온도·방식 안내, 4대 카테고리 재분류, 시음날짜 영구보존 및 모바일/증기/검색 버그 9건 수정, html2canvas SRI 적용"
    },
    {
      version: "2.3.0",
      stage: "α1",
      schemaVersion: "v3",
      date: "2026-11-18",
      summary: "Schema v3 업그레이드, 한·영·일(KR/EN/JP) 다국어 전환 스위치, 120종 생산자·농장·공식 출처(Traceability) 및 실제 유통 원두 검색(Google/Naver) 연동, 스키마 버전 자동 관리 체계 구축"
    },
    {
      version: "2.1.9",
      stage: "α1",
      date: "2026-11-18",
      summary: "카카오톡 인앱 브라우저 티켓 이미지 저장 미리보기 모달 지원, 검색창 카테고리 겹침 해소, 전체 120종 버튼 이모티콘 삭제·효과음 수정 및 상단 소리/원산지 버튼 택타일 디자인 통일"
    },
    {
      version: "2.1.8",
      stage: "α1",
      date: "2026-11-18",
      summary: "상단 타이틀 밸런스 재배치, 음성 검색 제거, 모바일 스크롤 터치 사운드 오작동 차단, 크래프트 박스 초기 노출 순서 및 화면 덜컹거림 개선"
    },
    {
      version: "2.1.7",
      stage: "α1",
      date: "2026-11-18",
      summary: "버전 기록 링크(CTA v2.1.7 (α1))를 powered by DispenserV2 ™ 하단에 적용 및 자동 버전 동기화 오류 수정"
    },
    {
      version: "2.1.6",
      stage: "α1",
      date: "2026-11-18",
      summary: "Coffee Taste Archive - SCA 120종 스페셜 브랜드 정립, powered by DispenserV2 ™ 엔진 시그니처 적용 및 자동 버전 기록 시스템 구축"
    },
    {
      version: "2.1.5",
      stage: "α1",
      date: "2026-11-18",
      summary: "상세 도감 탭 스위처에 빈티지 종이 톤 시소(Rocker) 물리 메커니즘 및 로우프로파일 택타일 버튼 시스템 적용"
    },
    {
      version: "2.1.4",
      stage: "α1",
      date: "2026-11-18",
      summary: "도감 요약 카드 4단 다이어트 및 상세 모달 스토리 카드 통합·여백 1.5배 확대"
    },
    {
      version: "2.1.3",
      stage: "α1",
      date: "2026-11-17",
      summary: "원두 이름 3초 자동 해독 칩, 입문자 10초 기초 개념 요약, 마셔본 원두(TASTED) 모아보기 필터 추가"
    },
    {
      version: "2.1.2",
      stage: "α1",
      date: "2026-11-17",
      summary: "상단 커피 이야기 서랍 제거 및 상세 도감 전용 3개 반투명 고스트 '?' 마이크로 가이드 적용"
    },
    {
      version: "2.1.1",
      stage: "α1",
      date: "2026-11-17",
      summary: "SCA CVA & WCR 국제 표준 기반 120종 스페셜티 마스터 DB(Schema v2) 확장 및 DispenserV2 최소 6장 스마트 큐레이션 엔진 탑재"
    }
  ]
};
