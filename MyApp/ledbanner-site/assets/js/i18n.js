/* ==========================================================================
   手持弹幕 官网 - i18n.js
   四语言本地化（简体中文 / English / 日本語 / 한국어）

   用法：给需要翻译的节点加标记
     data-i18n="key"                       → 替换 textContent
     data-i18n-html="key"                  → 替换 innerHTML（仅用于含 <br> 等行内标记的文案）
     data-i18n-attr="aria-label:key,alt:k" → 替换指定属性
     data-i18n-led="key"                   → 替换 LED 弹幕屏文字（会同步给 LedBanner 实例）

   语言选择写入 localStorage（键：ledbanner-language），刷新后保持。
   新增一种语言：在 DICT 每个词条里补一个字段，并加进 LANGS 即可。
   ========================================================================== */
(function (window, document) {
  "use strict";

  var STORE_KEY = "ledbanner-language";
  var LANGS = ["zh", "en", "ja", "ko"];
  var HTML_LANG = { zh: "zh-CN", en: "en", ja: "ja", ko: "ko" };
  var DEFAULT = "zh";

  /* ------------------------------------------------------------------
     字典：键 → { zh, en, ja, ko }
     按页面区块分组，方便对照 HTML 查找
     ------------------------------------------------------------------ */
  var DICT = {
    /* ---- 站点级：title / meta / 品牌 ---- */
    "meta.title": {
      zh: "手持弹幕 - 好玩有趣的打 CALL 神器 | LED 弹幕灯牌 App",
      en: "LED Banner - Turn your phone into a scrolling LED sign",
      ja: "LEDバナー - スマホが光るLED看板になる手持ち弾幕アプリ",
      ko: "LED 배너 - 휴대폰이 흐르는 LED 전광판이 되는 앱"
    },
    "meta.desc": {
      zh: "手持弹幕是一款把手机变成 LED 显示屏的应用。输入文字即可生成滚动弹幕，支持多种字体、颜色、动效，演唱会应援、生日祝福、摆摊促销、接机接站都用得上，完全免费。",
      en: "LED Banner turns your phone into an LED display. Type text and get a scrolling banner with multiple fonts, colors and effects - perfect for concerts, birthdays, street stalls and airport pickups. Free to use.",
      ja: "LEDバナーはスマホをLEDディスプレイに変えるアプリです。文字を入力するだけでスクロール弾幕を作成でき、豊富なフォント・カラー・エフェクトに対応。コンサート応援、誕生日、屋台プロモーション、空港のお迎えなどに使えます。完全無料。",
      ko: "LED 배너는 휴대폰을 LED 디스플레이로 바꾸는 앱입니다. 글자만 입력하면 흐르는 배너가 만들어지고, 다양한 글꼴·색상·효과를 지원합니다. 콘서트 응원, 생일 축하, 노점 홍보, 공항 마중까지 모두 무료로 사용하세요."
    },
    "meta.keywords": {
      zh: "手持弹幕,LED显示屏,LED弹幕,应援灯牌,滚动字幕,打call神器,手机灯牌,手持灯牌,弹幕制作",
      en: "LED banner,LED sign,scrolling text,fan light board,concert sign,scroll message,phone LED display",
      ja: "LEDバナー,LED看板,スクロール文字,応援うちわ,コンサート看板,手持ち弾幕,弾幕作成",
      ko: "LED 배너,LED 전광판,흐르는 글자,응원 팻말,콘서트 팻말,스크롤 메시지,휴대폰 LED"
    },
    "og.title": {
      zh: "手持弹幕 - 好玩有趣的打 CALL 神器",
      en: "LED Banner - Turn your phone into a scrolling LED sign",
      ja: "LEDバナー - スマホが光るLED看板に",
      ko: "LED 배너 - 휴대폰이 흐르는 LED 전광판으로"
    },
    "og.desc": {
      zh: "输入文字，手机秒变 LED 显示屏。多种字体样式和颜色供你选择，可随意切换弹幕速度和显示方向。",
      en: "Type your text and your phone becomes an LED display. Choose from many fonts and colors, and switch the scroll speed and direction anytime.",
      ja: "文字を入力するだけでスマホがLEDディスプレイに。豊富なフォントとカラーから選べ、スクロール速度や表示方向も自由に切り替えられます。",
      ko: "글자를 입력하면 휴대폰이 LED 디스플레이로. 다양한 글꼴과 색상을 고르고 스크롤 속도와 방향도 자유롭게 바꿀 수 있습니다."
    },
    "brand.name": {
      zh: "手持弹幕",
      en: "LED Banner",
      ja: "LEDバナー",
      ko: "LED 배너"
    },
    "brand.logoAlt": {
      zh: "手持弹幕 Logo",
      en: "LED Banner logo",
      ja: "LEDバナーのロゴ",
      ko: "LED 배너 로고"
    },
    "brand.homeAria": {
      zh: "手持弹幕 首页",
      en: "LED Banner home",
      ja: "LEDバナー ホーム",
      ko: "LED 배너 홈"
    },

    /* ---- 导航 ---- */
    "nav.aria": { zh: "主导航", en: "Main navigation", ja: "メインナビゲーション", ko: "주요 메뉴" },
    "nav.home": { zh: "首页", en: "Home", ja: "ホーム", ko: "홈" },
    "nav.features": { zh: "功能特性", en: "Features", ja: "機能", ko: "기능" },
    "nav.how": { zh: "怎么用", en: "How it works", ja: "使い方", ko: "사용 방법" },
    "nav.about": { zh: "关于我们", en: "About", ja: "私たちについて", ko: "소개" },
    "nav.cta": { zh: "立即下载", en: "Download", ja: "ダウンロード", ko: "다운로드" },
    "nav.toggleAria": { zh: "打开导航菜单", en: "Open menu", ja: "メニューを開く", ko: "메뉴 열기" },
    "skip.main": {
      zh: "跳到主要内容",
      en: "Skip to main content",
      ja: "メインコンテンツへスキップ",
      ko: "주요 내용으로 건너뛰기"
    },
    "lang.aria": { zh: "切换语言", en: "Switch language", ja: "言語切り替え", ko: "언어 전환" },

    /* 语言切换按钮：短标签用「当前界面语言」书写，保证四个按钮宽度稳定；
       完整名称放在 title / aria-label 上，鼠标悬停可见 */
    "lang.zh": { zh: "中", en: "CN", ja: "中", ko: "중" },
    "lang.en": { zh: "英", en: "EN", ja: "英", ko: "영" },
    "lang.ja": { zh: "日", en: "JP", ja: "日", ko: "일" },
    "lang.ko": { zh: "韩", en: "KR", ja: "韓", ko: "한" },
    "lang.zh.name": {
      zh: "简体中文",
      en: "Chinese (Simplified)",
      ja: "中国語（簡体字）",
      ko: "중국어(간체)"
    },
    "lang.en.name": { zh: "英语", en: "English", ja: "英語", ko: "영어" },
    "lang.ja.name": { zh: "日语", en: "Japanese", ja: "日本語", ko: "일본어" },
    "lang.ko.name": { zh: "韩语", en: "Korean", ja: "韓国語", ko: "한국어" },

    /* ---- Hero ---- */
    "hero.eyebrow": {
      zh: "演唱会应援 · 生日祝福 · 摆摊促销 · 接机接站",
      en: "Concerts · Birthdays · Street stalls · Airport pickups",
      ja: "コンサート応援 · 誕生日 · 屋台プロモーション · 空港のお迎え",
      ko: "콘서트 응원 · 생일 축하 · 노점 홍보 · 공항 마중"
    },
    "hero.subtitle": {
      zh: "好玩有趣的打 CALL 神器",
      en: "A fun LED banner for every moment",
      ja: "楽しく使えるLEDバナー",
      ko: "재미있는 LED 배너"
    },
    "hero.download": {
      zh: "App Store 下载",
      en: "Download on the App Store",
      ja: "App Store でダウンロード",
      ko: "App Store에서 다운로드"
    },
    "hero.note": {
      zh: "完全免费 · 无需注册 · 核心功能可离线使用",
      en: "Free · No sign-up · Core features work offline",
      ja: "完全無料 · 登録不要 · 主要機能はオフラインで利用可能",
      ko: "완전 무료 · 가입 불필요 · 핵심 기능은 오프라인에서도"
    },

    /* ---- 使用场景标签条 ---- */
    "scenes.aria": { zh: "使用场景", en: "Use cases", ja: "使用シーン", ko: "사용 사례" },
    "scene.concert": { zh: "演唱会应援", en: "Concert support", ja: "コンサート応援", ko: "콘서트 응원" },
    "scene.birthday": { zh: "生日祝福", en: "Birthday wishes", ja: "誕生日のお祝い", ko: "생일 축하" },
    "scene.stall": { zh: "摆摊促销", en: "Street promotions", ja: "屋台プロモーション", ko: "노점 홍보" },
    "scene.pickup": { zh: "接机接站", en: "Airport pickup", ja: "空港のお迎え", ko: "공항 마중" },
    "scene.propose": { zh: "求婚表白", en: "Proposals", ja: "プロポーズ", ko: "프러포즈" },
    "scene.campus": { zh: "校园活动", en: "Campus events", ja: "学校イベント", ko: "학교 행사" },
    "scene.store": { zh: "门店引流", en: "Store traffic", ja: "店舗集客", ko: "매장 유입" },
    "scene.photo": { zh: "拍照道具", en: "Photo props", ja: "撮影小道具", ko: "사진 소품" },

    /* ---- 痛点共鸣 ---- */
    "pain.aria": { zh: "使用场景痛点", en: "Common pain points", ja: "よくある悩み", ko: "흔한 불편함" },
    "pain.title": {
      zh: "这些场面，是不是有点尴尬？",
      en: "Sound familiar? These moments get awkward",
      ja: "こんな場面、少し気まずくありませんか？",
      ko: "이런 순간, 조금 어색하지 않나요?"
    },
    "pain.desc": {
      zh: "想被看见，却总觉得差了点什么——手持弹幕把这几件小事变得很简单。",
      en: "You want to be seen, but something always falls short. LED Banner makes these little moments easy.",
      ja: "見てもらいたいのに、いつも何かが足りない——LEDバナーはそんな小さな場面を簡単にします。",
      ko: "눈에 띄고 싶지만 항상 뭔가 부족하죠. LED 배너는 이런 작은 순간을 쉽게 만듭니다."
    },
    "pain.c1t": {
      zh: "接机接站，纸牌举到手酸",
      en: "Airport pickup: arm aching from a paper sign",
      ja: "空港のお迎え、紙の看板で手が疲れる",
      ko: "공항 마중, 종이 팻말 들다 팔이 아픔"
    },
    "pain.c1d": {
      zh: "A4 纸画了半天，名字还写在角落里。人潮涌出来时举得手都酸了，对方照样找不到你。",
      en: "You spent ages drawing an A4 sign, with the name squeezed into a corner. Your arm aches holding it up - and they still can't spot you.",
      ja: "A4用紙に一生懸命書いたのに、名前は隅っこ。人波が押し寄せても手が疲れるだけで、相手は見つけてくれない。",
      ko: "A4 용지에 한참 그렸는데 이름은 구석에. 인파가 쏟아질 때 팔은 아픈데 상대는 여전히 못 찾죠."
    },
    "pain.c2t": {
      zh: "喊破嗓子，台上也看不见",
      en: "Shouting yourself hoarse - the stage still can't see you",
      ja: "声を枯らしても、ステージからは見えない",
      ko: "목이 터져라 외쳐도 무대에선 안 보여요"
    },
    "pain.c2d": {
      zh: "应援色、口号、灯牌都想好了，真到了现场才发现，声音和手幅全都淹没在人海里。",
      en: "You planned your color, your chant, your light stick - then at the venue it all drowns in the crowd.",
      ja: "応援カラーもスローガンもペンライトも準備したのに、現場では声もうちわも人波に埋もれてしまう。",
      ko: "응원 색도 구호도 응원봉도 준비했지만, 막상 현장에선 목소리와 손팻말이 인파에 묻히죠."
    },
    "pain.c3t": {
      zh: "招牌太小，客人走过就忘",
      en: "Your sign is too small - people walk past and forget",
      ja: "看板が小さくて、通り過ぎたら忘れられる",
      ko: "간판이 너무 작아 지나가면 잊혀져요"
    },
    "pain.c3d": {
      zh: "写在纸板上、贴在桌边，路人一眼扫过，根本看不出你卖什么、今天有什么优惠。",
      en: "Written on cardboard, taped to the table - passersby glance once and still don't know what you sell or what's on offer.",
      ja: "段ボールに書いてテーブルに貼っても、通行人はちらっと見るだけで、何を売っているかも今日の特典も伝わらない。",
      ko: "판지에 적어 테이블에 붙여도, 지나가는 사람은 한 번 훑고 무엇을 파는지 오늘 혜택이 뭔지 모르죠."
    },

    /* ---- 功能 1：字体与颜色 ---- */
    "f1.title": {
      zh: "应援必备的打 Call 神器",
      en: "The ultimate cheer tool for fans",
      ja: "応援に欠かせない打Callツール",
      ko: "응원에 꼭 필요한 치어 툴"
    },
    "f1.desc": {
      zh: "多种字体样式和颜色供你选择",
      en: "Pick from multiple fonts and colors",
      ja: "豊富なフォントとカラーから選べる",
      ko: "다양한 글꼴과 색상 중에서 선택"
    },
    "f1.p1": { zh: "7 种高饱和配色", en: "7 vivid color palettes", ja: "7色の鮮やかな配色", ko: "7가지 선명한 색상" },
    "f1.p2": { zh: "多套字型切换", en: "Multiple font styles", ja: "複数のフォントスタイル", ko: "다양한 글꼴 스타일" },
    "f1.p3": { zh: "字号自由调节", en: "Adjustable text size", ja: "文字サイズを自由に調整", ko: "글자 크기 자유 조절" },
    "f1.p4": { zh: "一键全屏展示", en: "Full-screen with one tap", ja: "ワンタップで全画面表示", ko: "한 번에 전체 화면" },

    /* ---- 功能 2：速度与方向 ---- */
    "f2.title": {
      zh: "好玩有趣的 LED 显示屏",
      en: "A fun LED display",
      ja: "楽しく使えるLEDディスプレイ",
      ko: "재미있는 LED 디스플레이"
    },
    "f2.desc": {
      zh: "可随意切换弹幕速度和显示方向",
      en: "Switch the scroll speed and direction anytime",
      ja: "スクロール速度と表示方向は自由に切り替え",
      ko: "스크롤 속도와 방향을 자유롭게 전환"
    },

    /* ---- 功能 3：动效 ---- */
    "f3.title": { zh: "炫酷的动效", en: "Cool effects", ja: "クールなエフェクト", ko: "멋진 효과" },
    "f3.desc": {
      zh: "快速制作独特的手持弹幕",
      en: "Create your own banner in seconds",
      ja: "あなただけの弾幕をすぐに作成",
      ko: "나만의 배너를 빠르게 제작"
    },
    "fx.neon": { zh: "霓虹呼吸", en: "Neon breathing", ja: "ネオンの呼吸", ko: "네온 브리딩" },
    "fx.neonSub": { zh: "亮度渐隐渐显", en: "Fades in and out", ja: "明るさがゆっくり変化", ko: "밝기가 천천히 변화" },
    "fx.beat": { zh: "心动节拍", en: "Heartbeat pulse", ja: "心拍ビート", ko: "심장 박동" },
    "fx.beatSub": { zh: "跟随节奏缩放", en: "Pulses with the beat", ja: "リズムに合わせて拡大縮小", ko: "리듬에 맞춰 확대 축소" },
    "fx.flash": { zh: "警示闪烁", en: "Alert flash", ja: "警告フラッシュ", ko: "경고 플래시" },
    "fx.flashSub": { zh: "强力抓取注意", en: "Grabs attention instantly", ja: "強力に注意を引く", ko: "강력하게 시선을 끔" },
    "fx.rainbow": { zh: "彩虹循环", en: "Rainbow cycle", ja: "レインボーサイクル", ko: "레인보우 순환" },
    "fx.rainbowSub": { zh: "颜色自动流转", en: "Colors shift automatically", ja: "色が自動で移り変わる", ko: "색상이 자동으로 흐름" },

    /* ---- 四步走 ---- */
    "how.title": {
      zh: "四步，把手机变成一块屏",
      en: "Four steps to turn your phone into a screen",
      ja: "4ステップでスマホを画面に",
      ko: "네 단계로 휴대폰을 화면으로"
    },
    "how.desc": {
      zh: "从输入文字到全屏举起来，全程不到三分钟。",
      en: "From typing to holding it up full-screen - under three minutes.",
      ja: "文字を入力して全画面で掲げるまで、3分もかかりません。",
      ko: "텍스트 입력부터 전체 화면으로 들기까지 3분도 걸리지 않습니다."
    },
    "how.s1t": { zh: "输入想说的话", en: "Type what you want to say", ja: "伝えたい言葉を入力", ko: "전하고 싶은 말을 입력" },
    "how.s1d": {
      zh: "一句话、一个名字、一句口号，最多 30 字，改完立刻上屏。",
      en: "A line, a name, a slogan - up to 30 characters, live on screen as you type.",
      ja: "ひと言、名前、スローガン。最大30文字、入力したらすぐ画面に。",
      ko: "한마디, 이름, 슬로건까지 최대 30자. 입력하면 바로 화면에."
    },
    "how.s2t": { zh: "挑字体和颜色", en: "Pick a font and color", ja: "フォントと色を選ぶ", ko: "글꼴과 색상 선택" },
    "how.s2d": {
      zh: "7 种高饱和配色配多套字型，按场景随意切换，暗光下也够亮。",
      en: "7 vivid palettes and multiple fonts - switch by occasion, bright enough even in the dark.",
      ja: "7色の鮮やかな配色と複数のフォント。シーンに合わせて切り替え、暗い場所でも十分明るい。",
      ko: "7가지 선명한 색상과 여러 글꼴. 상황에 맞게 전환하고 어두운 곳에서도 충분히 밝아요."
    },
    "how.s3t": { zh: "调速度和方向", en: "Set speed and direction", ja: "速度と方向を調整", ko: "속도와 방향 조절" },
    "how.s3d": {
      zh: "20–320 px/s 无级调速，四向滚动，横屏竖屏都能用。",
      en: "Stepless speed from 20 to 320 px/s, four directions, portrait or landscape.",
      ja: "20〜320px/sの無段階調整、4方向スクロール、縦横どちらでも使える。",
      ko: "20~320px/s 무단 속도 조절, 4방향 스크롤, 세로·가로 모두 지원."
    },
    "how.s4t": { zh: "全屏举起来", en: "Hold it up full-screen", ja: "全画面で掲げる", ko: "전체 화면으로 들어올리기" },
    "how.s4d": {
      zh: "一键隐藏界面、亮度拉满，举起来就是人群里最亮的那个。",
      en: "Hide the UI in one tap, max out brightness, and be the brightest thing in the crowd.",
      ja: "ワンタップでUIを非表示、輝度を最大に。掲げれば群衆の中で一番目立つ。",
      ko: "한 번 탭해 UI를 숨기고 밝기를 최대로. 군중 속 가장 밝은 존재가 되세요."
    },
    "how.cap": {
      zh: "全屏展示效果 · 手机上亮度可继续拉满",
      en: "Full-screen preview · brightness can go even higher on your phone",
      ja: "全画面表示のイメージ · スマホではさらに輝度を上げられます",
      ko: "전체 화면 미리보기 · 휴대폰에서 밝기를 더 높일 수 있어요"
    },

    /* ---- 场景卡片 ---- */
    "scenes.title": {
      zh: "一块屏，处处能用",
      en: "One screen, endless possibilities",
      ja: "1枚の画面をどこでも活用",
      ko: "한 화면으로 어디서나"
    },
    "scenes.sub": {
      zh: "从演唱会到路边摊，把手机举起来就有牌面——同一个 App，六种打开方式。",
      en: "From concerts to street stalls - raise your phone and make a statement. One app, six ways to use it.",
      ja: "コンサートから屋台まで、スマホを掲げるだけで存在感が出る。同じアプリで6通りの使い方。",
      ko: "콘서트부터 노점까지, 휴대폰을 들기만 하면 존재감이 생깁니다. 하나의 앱, 여섯 가지 활용법."
    },
    "sc.concertD": {
      zh: "追星现场亮出你的应援色，爱豆一眼就能看到你。",
      en: "Show your fan colors at the concert - your idol will spot you in a second.",
      ja: "ライブ会場であなたの応援カラーを。推しが一目で見つけてくれる。",
      ko: "콘서트에서 나만의 응원 색을. 아이돌이 한눈에 알아봐요."
    },
    "sc.birthdayD": {
      zh: "烛光熄灭的那一刻，点亮满屏的祝福。",
      en: "The moment the candles go out, light up the whole screen with wishes.",
      ja: "ろうそくを吹き消した瞬間、画面いっぱいにお祝いの言葉を。",
      ko: "촛불을 끄는 순간, 화면 가득 축하 메시지를."
    },
    "sc.stallD": {
      zh: "一行大字反复滚动，路过的行人都忍不住回头。",
      en: "One big scrolling line - passersby can't help but look back.",
      ja: "大きな文字が繰り返し流れ、通りかかる人も思わず振り返る。",
      ko: "큼직한 글자가 계속 흐르니 지나가던 사람도 돌아봐요."
    },
    "sc.pickupD": {
      zh: "出站口人再多，TA 也能一眼找到举牌的你。",
      en: "However crowded the exit, they'll find you holding the sign at a glance.",
      ja: "出口がどれだけ混んでいても、看板を掲げるあなたを一目で見つけられる。",
      ko: "출구가 아무리 붐벼도 팻말 든 당신을 한눈에 찾죠."
    },
    "sc.match": { zh: "球赛助威", en: "Game day cheering", ja: "試合応援", ko: "경기 응원" },
    "sc.matchD": {
      zh: "主场氛围拉满，加油声跟着屏幕一起滚起来。",
      en: "Max out the home-crowd energy - the cheers scroll along with the screen.",
      ja: "ホームの雰囲気を最大化。応援の声も画面と一緒に流れる。",
      ko: "홈 분위기를 최대로. 응원 소리도 화면과 함께 흐르죠."
    },
    "sc.event": { zh: "活动暖场", en: "Event welcome", ja: "イベントの歓迎", ko: "행사 환영" },
    "sc.eventD": {
      zh: "年会、团建、门店迎宾，一部手机就是一块迎宾屏。",
      en: "Year-end parties, team building, store greetings - one phone is a welcome screen.",
      ja: "忘年会、チームビルディング、店舗の歓迎に。スマホ1台がそのまま歓迎ボードに。",
      ko: "연말 파티, 팀 빌딩, 매장 환영까지. 휴대폰 하나가 환영 화면이 되죠."
    },

    /* ---- LED 弹幕文案（屏上滚动的文字） ---- */
    "led.brandCheer": {
      zh: "手持弹幕 · 为你打 CALL",
      en: "LED Banner · Cheer for you",
      ja: "LEDバナー · あなたを応援",
      ko: "LED 배너 · 당신을 응원"
    },
    "led.cheer": { zh: "为你打 CALL", en: "Cheer for you", ja: "あなたを応援", ko: "당신을 응원" },
    "led.allLight": {
      zh: "全场为你亮灯",
      en: "The whole crowd lights up for you",
      ja: "会場全体が輝く",
      ko: "온 관중이 빛나요"
    },
    "led.birthday": { zh: "生日快乐", en: "Happy Birthday", ja: "ハッピーバースデー", ko: "생일 축하해" },
    "led.sale": {
      zh: "今日特价 全场 8 折",
      en: "Today's special: 20% off everything",
      ja: "本日特価 全品20%OFF",
      ko: "오늘 특가 전 품목 20% 할인"
    },
    "led.lookHere": { zh: "往这看", en: "Look over here", ja: "こっちを見て", ko: "여길 봐주세요" },
    "led.oneMore": { zh: "再坚持一组", en: "One more set", ja: "あと1セット", ko: "한 세트만 더" },
    "led.lastTen": {
      zh: "最后10份 卖完收摊",
      en: "Last 10 left - closing when sold out",
      ja: "残り10個 売り切れ次第終了",
      ko: "마지막 10개, 팔리면 마감"
    },
    "led.welcomeHome": { zh: "欢迎回家", en: "Welcome home", ja: "おかえりなさい", ko: "집에 온 걸 환영해" },
    "led.win": { zh: "必胜", en: "We will win", ja: "必勝", ko: "필승" },
    "led.welcome": { zh: "欢迎光临", en: "Welcome", ja: "いらっしゃいませ", ko: "환영합니다" },
    "led.fullscreen": {
      zh: "全屏举起来 · 为你打 CALL",
      en: "Full screen · Cheer for you",
      ja: "全画面 · あなたを応援",
      ko: "전체 화면 · 당신을 응원"
    },

    /* ---- 用户评价 ---- */
    "rev.title": {
      zh: "他们把手持弹幕举进了这些场合",
      en: "Where they raised their LED Banner",
      ja: "彼らがLEDバナーを掲げた場所",
      ko: "그들이 LED 배너를 든 순간들"
    },
    "rev.desc": {
      zh: "从演唱会场馆到路边摊，一块屏解决了不少「说不出口」的尴尬。",
      en: "From concert halls to street stalls, one screen solves plenty of awkward moments.",
      ja: "コンサート会場から屋台まで、1枚の画面が「言い出せない」気まずさを解決してくれる。",
      ko: "콘서트장부터 노점까지, 한 화면이 말하기 어려운 어색함을 해결해요."
    },
    "rev.starsAria": { zh: "五星评价", en: "Five star rating", ja: "5つ星評価", ko: "별점 5점" },
    "rev.av1": { zh: "柚", en: "Y", ja: "ゆ", ko: "유" },
    "rev.av2": { zh: "阿", en: "K", ja: "カ", ko: "카" },
    "rev.av3": { zh: "小", en: "X", ja: "シ", ko: "샤" },
    "rev1.name": { zh: "柚子不加冰", en: "Yuzu, no ice", ja: "ゆず（氷なし）", ko: "유자, 얼음 없이" },
    "rev1.meta": {
      zh: "演唱会应援 · 已使用 8 个月",
      en: "Concert support · Used for 8 months",
      ja: "コンサート応援 · 利用歴8ヶ月",
      ko: "콘서트 응원 · 8개월 사용"
    },
    "rev1.text": {
      zh: "把应援色和口号做成滚动弹幕，举起来那一瞬间，周围一排人都在问我用的是什么 App。",
      en: "I turned my fan colors and chant into a scrolling banner. The moment I held it up, a whole row of people asked what app I was using.",
      ja: "応援カラーとスローガンをスクロール弾幕に。掲げた瞬間、周りの一列の人が「何のアプリ？」と聞いてきた。",
      ko: "응원 색과 구호를 흐르는 배너로 만들었어요. 들고 있자 주변 사람들이 무슨 앱이냐고 물어봤죠."
    },
    "rev2.name": { zh: "阿凯在摆摊", en: "Kai at the stall", ja: "屋台のカイさん", ko: "노점 하는 카이" },
    "rev2.meta": {
      zh: "夜市摊主 · 已使用 5 个月",
      en: "Night market vendor · Used for 5 months",
      ja: "夜市の屋台店主 · 利用歴5ヶ月",
      ko: "야시장 상인 · 5개월 사용"
    },
    "rev2.text": {
      zh: "以前写在纸板上没人看，现在「最后 10 份」滚起来，路过的人会专门停下来问一句。挺好用的。",
      en: "Nobody read my cardboard sign. Now 'Last 10 left' scrolls by and people actually stop to ask. Works great.",
      ja: "以前は段ボールに書いても誰も見なかった。今は「残り10個」が流れ、通りかかった人がわざわざ立ち止まって聞いてくれる。なかなか使える。",
      ko: "예전엔 판지에 써도 아무도 안 봤죠. 이제 '마지막 10개'가 흐르니 지나가던 사람이 멈춰서 물어봐요. 꽤 쓸만해요."
    },
    "rev3.name": { zh: "小满要接机", en: "Xiaoman, picking someone up", ja: "お迎えのシャオマン", ko: "마중 나온 샤오만" },
    "rev3.meta": {
      zh: "接机接站 · 已使用 3 个月",
      en: "Airport pickup · Used for 3 months",
      ja: "空港のお迎え · 利用歴3ヶ月",
      ko: "공항 마중 · 3개월 사용"
    },
    "rev3.text": {
      zh: "爸妈第一次出国回来，出口人特别多。屏幕上一直滚着名字，他们远远就看见了，还拍了照。",
      en: "My parents came back from their first trip abroad and the exit was packed. Their names scrolled across the screen - they spotted it from far away and even took a photo.",
      ja: "両親が初めての海外旅行から帰国。出口はすごい人混みだったけど、画面に名前が流れ続け、遠くからでも気づいて写真まで撮ってくれた。",
      ko: "부모님이 첫 해외여행에서 돌아오셨는데 출구가 엄청 붐볐어요. 화면에 이름이 계속 흐르니 멀리서도 보시고 사진도 찍으셨죠."
    },

    /* ---- 下载 CTA ---- */
    "cta.title": {
      zh: "更多功能等你体验<br>现在开始免费下载",
      en: "More features waiting for you<br>Download free now",
      ja: "もっと多くの機能を体験<br>今すぐ無料ダウンロード",
      ko: "더 많은 기능이 기다려요<br>지금 무료로 다운로드"
    },
    "cta.desc": {
      zh: "已上架 App Store，iPhone 与 iPad 均可下载，无需注册账号。",
      en: "Available on the App Store for iPhone and iPad. No account required.",
      ja: "App Storeで配信中。iPhoneとiPadに対応、アカウント登録は不要。",
      ko: "App Store에 출시. iPhone과 iPad 모두 지원, 가입 불필요."
    },
    "cta.qrAlt": {
      zh: "App Store 下载二维码",
      en: "App Store download QR code",
      ja: "App StoreダウンロードQRコード",
      ko: "App Store 다운로드 QR 코드"
    },

    /* ---- 关于我们 ---- */
    "about.title": {
      zh: "关于手持弹幕",
      en: "About LED Banner",
      ja: "LEDバナーについて",
      ko: "LED 배너 소개"
    },
    "about.desc": {
      zh: "我们想做一件很简单的事：把每个人口袋里的手机，变成一块随时能亮起来的屏。不需要额外设备，不用学复杂操作，输入几个字就能被看见。",
      en: "We have one simple goal: turn the phone in everyone's pocket into a screen that lights up anytime. No extra gear, no complex steps - type a few words and be seen.",
      ja: "私たちの目標はシンプルです。誰もがポケットに入れているスマホを、いつでも光る画面に変えること。追加の機器も複雑な操作も不要。数文字入力するだけで見てもらえる。",
      ko: "우리의 목표는 간단합니다. 누구나 주머니에 있는 휴대폰을 언제든 빛나는 화면으로 만드는 것. 추가 장비도 복잡한 조작도 필요 없어요. 몇 글자만 입력하면 눈에 띕니다."
    },
    "about.c1t": { zh: "完全离线可用", en: "Works fully offline", ja: "完全オフライン対応", ko: "완전 오프라인 사용" },
    "about.c1d": {
      zh: "弹幕制作与展示全程在本机完成，你输入的文字不会被上传，也不需要联网。",
      en: "Banners are created and displayed entirely on your device. Your text is never uploaded and no connection is needed.",
      ja: "弾幕の作成と表示はすべて端末内で完結。入力した文字がアップロードされることも、ネット接続も不要。",
      ko: "배너 제작과 표시는 모두 기기에서 이루어집니다. 입력한 글자는 업로드되지 않고 인터넷도 필요 없어요."
    },
    "about.c2t": { zh: "无需账号", en: "No account required", ja: "アカウント不要", ko: "계정 불필요" },
    "about.c2d": {
      zh: "下载即用，不强制注册登录，不索取与功能无关的个人信息。",
      en: "Use it right after download. No forced sign-up, no unrelated personal data collected.",
      ja: "ダウンロードしてすぐ使える。登録の強制も、機能に関係ない個人情報の取得もなし。",
      ko: "다운로드 후 바로 사용. 강제 가입도, 기능과 무관한 개인정보 수집도 없어요."
    },
    "about.c3t": { zh: "免费使用", en: "Free to use", ja: "無料で利用可能", ko: "무료 사용" },
    "about.c3d": {
      zh: "核心的弹幕功能永久免费。若你有定制需求或合作意向，欢迎随时联系我们。",
      en: "Core banner features are free forever. For custom work or partnerships, feel free to reach out.",
      ja: "主要な弾幕機能はずっと無料。カスタムや連携のご相談はお気軽に。",
      ko: "핵심 배너 기능은 영구 무료. 커스텀이나 제휴 문의는 언제든 환영합니다."
    },
    "about.contact": { zh: "联系我们：", en: "Contact us: ", ja: "お問い合わせ：", ko: "문의: " },

    /* ---- 友情链接 ---- */
    "partners.title": { zh: "友情链接", en: "Links", ja: "リンク", ko: "링크" },
    "partners.aria": { zh: "友情链接", en: "Links", ja: "リンク", ko: "링크" },
    "partners.apply": {
      zh: "友链申请（邮件联系）",
      en: "Link requests (email)",
      ja: "リンク申請（メール）",
      ko: "링크 신청(이메일)"
    },

    /* ---- 页脚 ---- */
    "footer.slogan": {
      zh: "好玩有趣的打 CALL 神器。把手机变成 LED 显示屏，随时亮出你想说的话。",
      en: "A fun LED banner for every moment. Turn your phone into an LED display and show what you want to say.",
      ja: "楽しく使えるLEDバナー。スマホがLEDディスプレイになり、伝えたい言葉をいつでも掲げられる。",
      ko: "재미있는 LED 배너. 휴대폰이 LED 디스플레이가 되어 전하고 싶은 말을 언제든 보여줘요."
    },
    "footer.product": { zh: "产品", en: "Product", ja: "製品", ko: "제품" },
    "footer.downloadApp": { zh: "下载应用", en: "Download app", ja: "アプリをダウンロード", ko: "앱 다운로드" },
    "footer.support": { zh: "支持", en: "Support", ja: "サポート", ko: "지원" },
    "footer.email": { zh: "联系邮箱", en: "Email", ja: "メール", ko: "이메일" },
    "footer.aboutCol": { zh: "关于", en: "About", ja: "概要", ko: "소개" },
    "footer.terms": { zh: "用户协议", en: "Terms of Use", ja: "利用規約", ko: "이용 약관" },
    "footer.privacy": { zh: "隐私政策", en: "Privacy Policy", ja: "プライバシーポリシー", ko: "개인정보 처리방침" },
    "footer.sitemap": { zh: "网站地图", en: "Sitemap", ja: "サイトマップ", ko: "사이트맵" },
    "footer.developer": { zh: "个人开发者", en: "Independent developer", ja: "個人開発者", ko: "개인 개발자" },

    /* 子页面标题 */
    "meta.titlePrivacy": {
      zh: "隐私政策 - 手持弹幕",
      en: "Privacy Policy - LED Banner",
      ja: "プライバシーポリシー - LEDバナー",
      ko: "개인정보 처리방침 - LED 배너"
    },
    "meta.titleProtocol": {
      zh: "用户协议 - 手持弹幕",
      en: "Terms of Use - LED Banner",
      ja: "利用規約 - LEDバナー",
      ko: "이용 약관 - LED 배너"
    },

    /* ---- 子页面：隐私政策 / 用户协议（仅公共部分与页头做了本地化，
             法务正文保持原文，上线前请按目标市场另行准备对应语言版本） ---- */
    "breadcrumb.aria": { zh: "面包屑", en: "Breadcrumb", ja: "パンくずリスト", ko: "경로" },
    "page.privacyDesc": {
      zh: "我们尽可能少地收集信息。你输入的文字只留在你的设备上，我们不会读取、上传或将其用于任何其他用途。",
      en: "We collect as little as possible. The text you type stays on your device - we never read it, upload it, or use it for anything else.",
      ja: "私たちは情報を最小限しか収集しません。入力した文字は端末内にのみ残り、読み取ったりアップロードしたり他の目的に使うことはありません。",
      ko: "우리는 정보를 최소한으로만 수집합니다. 입력한 글자는 기기에만 남으며 읽거나 업로드하거나 다른 용도로 쓰지 않습니다."
    },
    "page.protocolDesc": {
      zh: "使用「手持弹幕」即表示你已阅读并同意本协议。请特别留意关于使用限制与免责说明的条款。",
      en: "By using LED Banner you confirm that you have read and agreed to these terms. Please pay attention to the sections on usage restrictions and disclaimers.",
      ja: "LEDバナーを利用することで、本規約を読み同意したものとみなされます。利用制限と免責事項の条項をよくご確認ください。",
      ko: "LED 배너를 사용하면 본 약관을 읽고 동의한 것으로 간주됩니다. 이용 제한과 면책 조항을 특히 확인해 주세요."
    },

    /* ---- 右侧悬浮件 ---- */
    "float.qrAria": { zh: "扫码下载", en: "Scan to download", ja: "QRでダウンロード", ko: "QR로 다운로드" },
    "float.storeTip": {
      zh: "iPhone / iPad 扫码下载",
      en: "Scan to download for iPhone / iPad",
      ja: "iPhone / iPad 用QRコード",
      ko: "iPhone / iPad QR 코드"
    },
    "float.backTopAria": { zh: "回到顶部", en: "Back to top", ja: "トップへ戻る", ko: "맨 위로" }
  };

  /* ------------------------------------------------------------------
     引擎
     ------------------------------------------------------------------ */
  var current = DEFAULT;

  function qsa(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  /* 取译文：缺该语言时回退中文，避免页面出现空白 */
  function t(key, lang) {
    var item = DICT[key];
    if (!item) return "";
    return item[lang] || item[DEFAULT] || "";
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = DEFAULT;
    current = lang;
    document.documentElement.lang = HTML_LANG[lang] || lang;

    /* 1) 纯文本 */
    qsa("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"), lang);
      if (v) el.textContent = v;
    });

    /* 2) 含行内标记的文案（内容出自本字典，非用户输入） */
    qsa("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html"), lang);
      if (v) el.innerHTML = v;
    });

    /* 3) 属性：data-i18n-attr="aria-label:key,alt:key2" */
    qsa("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var v = t(parts[1].trim(), lang);
        if (v) el.setAttribute(attr, v);
      });
    });

    /* 4) LED 弹幕屏文字
          已初始化的屏走实例 setText（会重建所有副本并重新测量）；
          尚未初始化的屏直接改 DOM，随后 LedBanner 初始化时会读 dataset.ledText */
    qsa("[data-i18n-led]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-led"), lang);
      if (!v) return;
      el.dataset.ledText = v;
      if (el.__ledBanner && typeof el.__ledBanner.setText === "function") {
        el.__ledBanner.setText(v);
      } else {
        var spans = el.querySelectorAll(".led-text");
        for (var i = 0; i < spans.length; i++) spans[i].textContent = v;
      }
    });

    /* 5) 语言按钮状态 */
    var box = document.getElementById("langToggle");
    if (box) {
      Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b) {
        var on = b.getAttribute("data-lang") === lang;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    /* 6) 广播，供其它脚本响应（如需要重排动画） */
    try {
      window.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: lang } }));
    } catch (e) {
      /* 老浏览器无 CustomEvent 构造器，忽略即可 */
    }
  }

  function getLang() {
    try {
      var saved = window.localStorage.getItem(STORE_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {
      /* 隐私模式下 localStorage 可能不可用，回退默认语言 */
    }
    return DEFAULT;
  }

  function setLang(lang) {
    try {
      window.localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* 存不了也照样切换本次会话 */
    }
    applyLang(lang);
  }

  function init() {
    var box = document.getElementById("langToggle");
    if (box) {
      box.addEventListener("click", function (e) {
        var btn = e.target.closest ? e.target.closest("[data-lang]") : null;
        if (!btn) return;
        setLang(btn.getAttribute("data-lang"));
      });
    }
    applyLang(getLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* 对外接口 */
  window.I18N = {
    t: function (key) {
      return t(key, current);
    },
    getLang: function () {
      return current;
    },
    setLang: setLang,
    applyLang: applyLang,
    dict: DICT,
    langs: LANGS
  };
})(window, document);
