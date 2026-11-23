(() => {
  // Translations are keyed by the Korean public-page copy so markup and animation spans stay intact.
  const pairs = [
    ["회사 안내", "Company"],
    ["회사 소개", "Company Introduction"],
    ["정책", "Policies"],
    [
      "결제와 충전에는 선택한 기관의 계약 통화가 적용됩니다.",
      "Payments and top-ups use the selected institution’s contract currency.",
    ],
    ["이용약관", "Terms of Service"],
    ["개인정보 처리방침", "Privacy Policy"],
    ["환불 정책", "Refund Policy"],
    [
      "테스트 데이터로 구성한 ExamVue 365 Flow 워크리스트 예시",
      "Example ExamVue 365 Flow worklist with test data",
    ],
    ["테스트 데이터로 구성한 화면 예시", "Example screen with test data"],
    ["모니터 3대 비교 판독 배치 개념도", "Conceptual layout for comparison across three monitors"],
    ["새 검사", "New study"],
    ["이전 검사 1", "Previous study 1"],
    ["이전 검사 2", "Previous study 2"],
    ["의뢰가 없는 예시 대시보드 화면", "Example dashboard with no requests"],
    ["의뢰 현황 예시 화면", "Example request dashboard"],
    ["본문 바로가기", "Skip to content"],
    ["메인", "Home"],
    ["서비스", "Services"],
    ["가격", "Pricing"],
    ["언어", "Language"],
    ["로그인", "Log in"],
    ["로그인 / 내 계정", "Log in / My account"],
    ["현재 요금 보기", "View current prices"],
    ["확인", "OK"],
    ["문의하기", "Contact us"],
    ["도입 문의하기", "Contact us"],
    ["맨 위로", "Back to top"],
    ["ExamVue 365 Flow 로딩", "Loading ExamVue 365 Flow"],
    ["부드럽게 흐르는 투명한 3D 유리 리본", "A flowing transparent 3D glass ribbon"],
    ["ExamVue 365 Flow 메인", "ExamVue 365 Flow home"],
    ["주요 메뉴", "Main navigation"],
    ["3D 모션 일시정지", "Pause 3D motion"],
    ["3D 모션 재생", "Play 3D motion"],
    ["안내 닫기", "Close message"],
    ["서비스 소개", "Service overview"],
    ["서비스 선택", "Choose a service"],
    ["서비스 소개 닫기", "Close service overview"],
    ["Telemedicine Service 소개", "Telemedicine service overview"],
    ["Web PACS 소개", "Web PACS overview"],
    ["서비스 소개를 불러오고 있어요.", "Loading service overview."],
    [
      "영상진단 장비부터 원격 판독까지, 동물병원을 위한 통합 진단 솔루션.",
      "Integrated diagnostic solutions for veterinary hospitals, from imaging equipment to remote reading.",
    ],
    ["이미징 솔루션 전문 기업", "Imaging solutions from"],
    ["가 만든 전문적인 이미징 분석 서비스", "— professional imaging analysis"],
    ["이제 당신의 병원이 선택할 차례입니다.", "for your hospital."],
    [
      "영상진단 장비부터 전문 원격 판독까지,",
      "From diagnostic imaging equipment to expert remote reading,",
    ],
    [
      "동물병원을 위한 통합 진단 솔루션을 제공합니다",
      "we provide integrated diagnostic solutions for veterinary hospitals.",
    ],
    ["원격진료 서비스", "Remote reading service"],
    ["설치없이 사용하는, PACS", "PACS without installation"],
    ["상호명 : 제이피아이헬스케어", "Company: JPI Healthcare"],
    ["대표자명 : 김진국", "Representative: Jin-kook Kim"],
    ["사업자 등록번호 : 203-81-48896", "Business registration: 203-81-48896"],
    ["통신판매업번호 : 2024-서울구로-0968", "Mail-order registration: 2024-Seoul Guro-0968"],
    [
      "사업장 주소 : 서울특별시 구로구 디지털로33길 28, 608호(우림이비즈센터1차)",
      "Address: Suite 608, 28 Digital-ro 33-gil, Guro-gu, Seoul, Korea",
    ],
    ["유선번호 :", "Phone:"],
    [
      "설치 없이 브라우저에서 바로 여는 웹 PACS. 저장부터 판독, 리포트까지 병원 어느 PC에서나.",
      "Web PACS opens in your browser without installation, for storage, reading and reporting on any hospital PC.",
    ],
    ["설치는 필요 없어요.", "No installation needed."],
    ["CT도 바로 열리는 웹 PACS", "Web PACS that opens CT scans right away"],
    [
      "검사를 열기 전에 영상을 미리 불러와 두니까, 수천 장짜리 CT도 기다리지 않아요.",
      "Images preload before you open a study, so even CT scans with thousands of images are ready.",
    ],
    [
      "저장부터 판독, 리포트 작성까지 병원 어느 PC에서나 이어서 하세요.",
      "Store, read and report from any PC in your hospital.",
    ],
    ["제공 방식", "Deployment options"],
    ["클라우드로 바로 시작", "Start in the cloud"],
    ["병원 서버 설치도 가능", "Hospital server installation available"],
    ["Chrome · Edge면 끝, 설치 없음", "Chrome or Edge; no installation"],
    ["동물용 의료기기 2등급 허가", "Class 2 veterinary medical device approved"],
    [
      "ExamVue 365 Flow 워크리스트 화면: 검색 필터, 검사 목록, 썸네일 미리보기, 판독 리포트, 관련 검사",
      "ExamVue 365 Flow worklist: search filters, studies, thumbnails, reports and related studies",
    ],
    ["찾는 검사, 바로 찾기", "Find studies quickly"],
    [
      "환자 이름이나 ID, 날짜, 모달리티로 검색하세요. 자주 쓰는 조건은 저장해 두면 한 번에 불러와요.",
      "Search by patient name or ID, date or modality. Save frequently used filters for later.",
    ],
    ["열기 전에 미리 보기", "Preview before opening"],
    [
      "썸네일로 시리즈를 먼저 확인하고, 필요한 영상만 골라 여세요.",
      "Preview series thumbnails and open only the images you need.",
    ],
    ["보면서 바로 판독", "Read as you view"],
    [
      "영상 옆에서 소견과 결론을 쓰고, 임시 저장했다가 확정하면 끝이에요.",
      "Write findings and conclusions beside the images, save a draft and finalize it when ready.",
    ],
    ["지난 검사와 나란히", "Compare previous studies"],
    [
      "같은 환자의 이전 검사가 타임라인에 모여 있어, 클릭 한 번으로 비교할 수 있어요.",
      "Previous studies for the same patient appear on a timeline for one-click comparison.",
    ],
    ["장비는 그대로,", "Keep your equipment,"],
    ["필요한 건 브라우저 하나", "all you need is a browser"],
    [
      "지금 쓰는 촬영 장비에서 영상을 보내면 바로 저장되고, 어느 PC에서나 열어 볼 수 있어요.",
      "Send images from your existing equipment to store them and open them on any PC.",
    ],
    ["도입 전에,", "Before you start,"],
    ["이것만 확인하세요.", "check the essentials."],
    ["도입 방식", "Deployment"],
    ["클라우드 구독 또는 병원 서버 설치", "Cloud subscription or hospital server"],
    ["필요한 것", "Requirements"],
    ["Chrome 또는 Edge 브라우저 하나 (110 이상)", "Chrome or Edge browser (version 110 or later)"],
    ["지원 영상", "Supported images"],
    ["플랫폼 구성도", "Platform diagram"],
    ["의뢰 병원", "Referring hospital"],
    ["웹 뷰어", "Web viewer"],
    ["PACS와 원격 판독이 함께 쓰는 판독 화면", "A shared viewer for PACS and remote reading"],
    ["↑ 영상 보기", "↑ View images"],
    ["검사 · 리포트 공유 ⇄", "Share studies and reports ⇄"],
    ["↑ 판독 진행", "↑ Reading in progress"],
    ["DICOM 서버", "DICOM server"],
    ["병원 영상 저장소", "Hospital image storage"],
    ["클라우드", "Cloud"],
    ["병원 서버", "Hospital server"],
    ["원격 판독 서비스", "Remote reading service"],
    ["전문 판독의 연결", "Connect to a specialist"],
    ["의뢰 병원 화면", "Referring hospital view"],
    ["판독의 화면", "Reader view"],
    ["관리자 화면", "Administrator view"],
    ["판독실 워크스테이션,", "Your reading workstation,"],
    ["이제 브라우저 안에.", "now in your browser."],
    [
      "진단 뷰어와 CT MPR을 같은 탭에서 바로 열어요.",
      "Open the diagnostic viewer and CT MPR in the same tab.",
    ],
    [
      "남겨 둔 측정과 주석은 다음에 열어도 그대로예요.",
      "Measurements and annotations remain when you return.",
    ],
    [
      "오른쪽 도구 막대가 있는 다중 뷰포트 CT 뷰어",
      "Multi-viewport CT viewer with a toolbar on the right",
    ],
    ["워크스테이션에서 하던 판독,", "Read as you would"],
    ["그대로 여기서.", "on your workstation."],
    [
      "최대 4×4 화면에 새 검사와 지난 검사 두 개를 나란히 띄워요. 화면마다 분할과 밝기 설정이 따로 적용되고, 남긴 측정과 주석은 DICOM 표준으로 저장돼 다음에 그대로 다시 볼 수 있어요.",
      "Display a new study and two previous studies side by side in up to a 4×4 layout. Each view has its own layout and brightness settings. Measurements and annotations are saved in DICOM format for your next visit.",
    ],
    [
      "길이 · 각도 · Cobb 각, 원형 · 사각형 · 자유형 ROI 측정",
      "Length, angle and Cobb angle; circular, rectangular and freehand ROI measurements",
    ],
    [
      "윈도우 프리셋, 시네 재생, 반전 · 회전 · 실제 크기 보기",
      "Window presets, cine playback, invert, rotate and actual-size view",
    ],
    [
      "축상면·시상면·관상면을 크로스헤어로 연동한 MPR 뷰어",
      "MPR viewer with crosshairs linking axial, sagittal and coronal views",
    ],
    ["3D 장비 없이도,", "Without 3D equipment,"],
    ["세 방향 단면을 한눈에.", "see three planes at once."],
    [
      "CT 영상으로 축상면 · 시상면 · 관상면을 바로 만들어 보여 줘요. 한 곳을 가리키면 세 단면이 함께 따라오고, MIP · MinIP · 평균 투영과 슬랩 두께도 단면마다 바꿀 수 있어요.",
      "Create axial, sagittal and coronal views from CT images. Point to one location to move all three views together, and adjust MIP, MinIP, average projection and slab thickness for each plane.",
    ],
    ["뷰어에서 버튼 하나로 새 창 열기", "Open a new window from the viewer"],
    ["회전 · 측정 · 조직별 프리셋 그대로 사용", "Use rotation, measurement and tissue presets"],
    ["클릭 한 번으로,", "With one click,"],
    ["보고 싶은 조직을 선명하게.", "see the tissue clearly."],
    [
      "폐, 뼈, 뇌처럼 조직별 프리셋을 우클릭으로 바로 적용하세요. 드래그로도 조절할 수 있어요.",
      "Right-click to apply presets for tissue such as lung, bone or brain. You can also adjust them by dragging.",
    ],
    ["01 / 자주 쓰는 영상 조정 도구", "01 / Common image adjustment tools"],
    ["밝기 / 대비", "Brightness / contrast"],
    ["ROI 기반 윈도우", "ROI window"],
    ["확대 / 축소", "Zoom"],
    ["이동 (Pan)", "Pan"],
    ["90° 회전", "Rotate 90°"],
    ["좌우 반전", "Flip horizontally"],
    ["시네 재생", "Cine playback"],
    ["히스토그램", "Histogram"],
    ["확대 · 축소 범위", "Zoom range"],
    ["시네 재생 속도", "Cine playback speed"],
    ["02 / 조직별 프리셋", "02 / Tissue presets"],
    ["폐", "Lung"],
    ["결절 · 기관지", "Nodules · bronchi"],
    ["복부", "Abdomen"],
    ["간 · 비장 · 신장", "Liver · spleen · kidney"],
    ["뇌", "Brain"],
    ["뇌 조직 · 출혈", "Brain tissue · bleeding"],
    ["뼈", "Bone"],
    ["골절 · 골밀도", "Fractures · bone density"],
    ["척추", "Spine"],
    ["골절 · 디스크", "Fractures · discs"],
    ["연부조직", "Soft tissue"],
    ["근육 · 종괴", "Muscle · masses"],
    [
      "우클릭 한 번으로 프리셋을 바꾸고, 드래그로 밝기와 대비를 세밀하게 조절하세요.",
      "Right-click to change presets, then drag to fine-tune brightness and contrast.",
    ],
    ["늘 보던 배치 그대로,", "Your familiar layout,"],
    ["모니터 3대까지 알아서.", "across up to three monitors."],
    [
      "CT를 열면 새 검사와 지난 검사가 정해 둔 모니터에, 정해 둔 화면 분할로 자동으로 펼쳐져요.",
      "Open a CT study and new and previous studies appear on your chosen monitors in your chosen layouts.",
    ],
    [
      "한 번만 설정해 두면 어느 판독 PC에서든 CT · DX · MR이 늘 같은 모습으로 열려요.",
      "Configure once and CT, DX and MR open consistently on any reading PC.",
    ],
    ["예시 · 모니터 3대로 CT 비교 판독", "Example · CT comparison across three monitors"],
    ["뷰어 1: 새 CT가 선택된 워크리스트", "Viewer 1: worklist with a new CT selected"],
    ["뷰어 1 · 워크리스트", "Viewer 1 · Worklist"],
    ["뷰어 2: 최근 이전 검사", "Viewer 2: most recent previous study"],
    ["뷰어 2 · 관련 검사 1 · 3×3", "Viewer 2 · Related study 1 · 3×3"],
    ["뷰어 3: 그 이전 검사", "Viewer 3: earlier study"],
    ["뷰어 3 · 관련 검사 2 · 2×2", "Viewer 3 · Related study 2 · 2×2"],
    [
      "모니터 위치는 판독 PC마다 따로 저장돼요.",
      "Monitor positions are saved separately for each reading PC.",
    ],
    ["보안과 관리는 저희가 챙길게요.", "We take care of security and management."],
    ["병원마다 따로,", "Separate for each hospital,"],
    ["안전하게 분리", "securely isolated"],
    [
      "병원마다 저장 공간과 계정이 따로 나뉘어 데이터가 섞이지 않아요.",
      "Each hospital has separate storage and accounts, so data stays isolated.",
    ],
    ["전 구간 암호화,", "Encrypted throughout,"],
    ["모든 기록은 그대로", "with an audit trail"],
    [
      "접속과 영상 전송은 모두 암호화되고, 누가 언제 봤는지 기록이 남아요.",
      "Access and image transfers are encrypted, with a record of who viewed them and when.",
    ],
    ["어떤 장비와도", "Works with equipment"],
    ["잘 맞는 DICOM", "using DICOM"],
    [
      "CT, MR, CR, DR, 초음파 등 표준 DICOM 영상을 그대로 주고받아요.",
      "Exchange standard DICOM images including CT, MR, CR, DR and ultrasound.",
    ],
    ["허가받은", "Approved"],
    ["동물용 의료기기", "veterinary medical device"],
    [
      "농림축산검역본부에서 동물용 의료기기 2등급 허가를 받았어요.",
      "Approved as a class 2 veterinary medical device by the Animal and Plant Quarantine Agency.",
    ],
    ["클라우드로 가볍게,", "Start easily in the cloud,"],
    ["병원 서버로 안전하게.", "or securely on a hospital server."],
    ["우리 병원에 맞는 방식으로 시작하세요.", "Choose the option that fits your hospital."],
    ["나중에 바꾸거나 함께 써도 괜찮아요.", "Switch or use both later."],
    ["어떤 방식이든,", "Whichever you choose,"],
    ["원격 판독과 바로 연결돼요.", "connect directly to remote reading."],
    ["병원이 커져도 그대로 이어서 쓰세요. ↗", "Continue as your hospital grows. ↗"],
    ["오늘 신청하면, 오늘 시작", "Apply and start today"],
    ["서버를 들이거나 따로 관리할 필요가 없어요.", "No server to purchase or manage."],
    ["업데이트와 백업은 자동으로 해 드려요.", "Updates and backups are automatic."],
    ["영상은 병원 안에만", "Images stay in your hospital"],
    [
      "병원 서버에 설치해 영상이 밖으로 나가지 않아요.",
      "Install on your hospital server to keep images on site.",
    ],
    ["기능은 클라우드와 똑같아요.", "The features are the same as the cloud."],
    ["브라우저만 있으면 돼요", "All you need is a browser"],
    [
      "Chrome이나 Edge(110 이상)면 충분해요.",
      "Chrome or Edge (version 110 or later) is all you need.",
    ],
    ["따로 설치할 프로그램이 없어요.", "There is no separate program to install."],
    ["궁금한 점이 있으신가요?", "Frequently asked questions"],
    ["따로 설치해야 하는 프로그램이 있나요?", "Do I need to install a program?"],
    [
      "아니요, Chrome이나 Edge(110 이상) 브라우저만 있으면 돼요. 병원 어느 PC에서나 접속해서 바로 판독하세요.",
      "No. All you need is Chrome or Edge (version 110 or later). Read images from any PC in your hospital.",
    ],
    [
      "클라우드와 병원 서버 설치는 어떻게 다른가요?",
      "How do cloud and hospital server installations differ?",
    ],
    [
      "클라우드는 서버 없이 바로 시작할 수 있고, 업데이트와 백업도 자동으로 해 드려요. 병원 서버에 설치하면 영상이 병원 밖으로 나가지 않아요. 기능은 똑같고, 나중에 바꾸거나 함께 써도 괜찮아요.",
      "The cloud starts without a server and includes automatic updates and backups. A hospital server keeps images on site. Both offer the same features, and you can switch or use both later.",
    ],
    ["지금 쓰는 촬영 장비와 연결되나요?", "Does it connect to our existing imaging equipment?"],
    [
      "CT, MR, CR, DR, 초음파, PET, XA 영상을 표준 DICOM으로 주고받아요. 다른 PACS로 보내거나 필름 프린터로 바로 출력할 수도 있어요.",
      "It exchanges CT, MR, CR, DR, ultrasound, PET and XA images using standard DICOM. You can also send images to another PACS or print them on film.",
    ],
    ["우리 병원 영상은 안전하게 보관되나요?", "Are our hospital images stored securely?"],
    [
      "병원마다 저장 공간과 계정이 따로 주어져서 데이터가 서로 섞이지 않아요. 접속과 영상 전송은 모두 암호화(TLS 1.2 이상)되고, 누가 언제 보고 내보냈는지 기록이 남아요.",
      "Each hospital has separate storage and accounts. Access and image transfers are encrypted (TLS 1.2 or later), and viewing and export activity is recorded.",
    ],
    ["원격 판독도 함께 쓸 수 있나요?", "Can we also use remote reading?"],
    [
      "네, 워크리스트에서 ‘판독 의뢰’만 누르면 전문 판독의가 같은 영상을 그대로 봐요. 영상을 다시 올릴 필요가 없고, 완료된 리포트는 그 검사에 자동으로 붙어요. 원격 판독만 쓰셔도 웹 PACS 뷰어는 기본으로 제공돼요.",
      "Yes. Select “Request reading” in the worklist and a specialist can view the same images without another upload. The completed report is attached to the study. The web PACS viewer is included with remote reading.",
    ],
    ["도입 전에 써 볼 수 있나요?", "Can we try it before adopting it?"],
    [
      "네, 데모를 신청하시면 우리 병원 영상으로 직접 써 보실 수 있어요. 아래 ‘데모 신청하기’를 눌러 주세요.",
      "Yes. Request a demo below to try it with your hospital’s images.",
    ],
    ["웹 PACS,", "Try web PACS"],
    ["우리 병원 영상으로 직접 써 보세요.", "with your own hospital’s images."],
    ["데모 신청하기", "Request a demo"],
    [
      "전문 영상의학 수의사와 동물병원을 연결하는 수의 원격 판독 서비스. 의뢰부터 결과 확인까지 하나의 흐름으로.",
      "Veterinary remote reading connects hospitals with veterinary radiology specialists, from request through results.",
    ],
    ["판독이 어려운 영상,", "For challenging images,"],
    ["전문 영상의학 수의사에게", "ask a veterinary radiology specialist"],
    ["바로 맡기세요", "to read them."],
    [
      "영상을 올리고 의뢰서만 보내면, 검증된 영상의학 수의사가 판독해 드려요.",
      "Upload images and submit a request for review by a qualified veterinary radiology specialist.",
    ],
    ["의뢰부터 결과 확인까지 한곳에서 끝나요.", "Manage requests and results in one place."],
    ["ExamVue 365 Flow 판독 의뢰 현황 화면", "ExamVue 365 Flow reading request status screen"],
    ["촬영은 병원에서, 판독은", "Your hospital takes the images;"],
    ["영상의학 전문 수의사에게.", "a veterinary radiology specialist reads them."],
    ["필요할 때 언제든 전문가에게 맡기고,", "Turn to an expert whenever you need one,"],
    ["진료의 다음 단계를 함께 만들어요.", "and plan the next step in care together."],
    [
      "병원에서 의뢰하면 검증된 전문가가 영상을 꼼꼼히 확인하고,",
      "When your hospital sends a request, a qualified specialist reviews the images",
    ],
    ["믿을 수 있는 판독 결과로 답해 드려요.", "and provides a reliable report."],
    ["이런 병원에 추천해요", "Recommended for hospitals that"],
    ["영상의학 전문 인력을", "Need radiology expertise"],
    ["상시 채용하기 어려운 병원", "without hiring full time"],
    ["필요할 때만 이용하니까,", "Use the service when needed"],
    ["인력 부담 없이 판독을 맡길 수 있어요.", "without adding permanent staff."],
    ["판독 의뢰와 결과를 체계적으로", "Want to organize reading"],
    ["관리하고 싶은 병원", "requests and results"],
    ["의뢰 접수부터 진행 상태와 결과 확인까지", "Track requests, progress and results"],
    ["한곳에서 관리할 수 있어요.", "in one place."],
    ["긴급하거나 복잡한 검사에", "Need a second opinion"],
    ["추가 의견이 필요한 병원", "on urgent or complex studies"],
    ["판단이 애매한 영상도", "Make confident decisions"],
    ["전문가의 의견으로 확신을 더하세요.", "with an expert opinion."],
    ["더 빠르고, 더 간편하게.", "Faster and simpler."],
    ["판독이 쉬워지는 네 가지 이유.", "Four reasons reading gets easier."],
    ["전문 판독은 더 가까이,", "Expert reading is closer,"],
    ["번거로운 일은 더 적게.", "with less work for you."],
    ["급한 의뢰는 더 빠르게.", "Faster urgent requests."],
    ["최대 48시간 이내에", "Receive diagnostic results"],
    ["진단 결과를 받아보세요.", "within 48 hours."],
    ["의뢰서는 AI가 채워드립니다.", "AI helps complete requests."],
    ["의뢰서는 AI가 채워 드려요.", "AI helps complete requests."],
    ["AI가 내용을 다듬어 주니까", "AI helps refine the details"],
    ["작성 시간이 확 줄어요.", "to reduce writing time."],
    ["다양한 모달리티를 한곳에서.", "Multiple modalities in one place."],
    ["X-ray부터 MRI까지, 한곳에서.", "From X-ray to MRI, in one place."],
    ["X-ray · CT · MRI · 초음파 등", "X-ray, CT, MRI, ultrasound"],
    ["주요 DICOM 영상을 모두 받아요.", "and other major DICOM images are supported."],
    ["전송부터 저장까지 안전하게.", "Secure from transfer to storage."],
    ["환자 정보는 보내고 저장하는", "Patient information is encrypted"],
    ["모든 과정에서 암호화돼요.", "during transfer and storage."],
    ["진료실에서도, 이동 중에도", "In the clinic or on the go"],
    ["휴대폰 · 태블릿 · PC로", "On your phone, tablet or PC,"],
    ["의뢰하고 바로 확인하세요.", "request and review results."],
    [
      "따로 설치할 필요 없이 웹으로 접속하면 돼요.",
      "Access it on the web without installing anything.",
    ],
    [
      "휴대폰, 태블릿, PC 어떤 화면에서도 보기 편하게 맞춰 보여 드려요.",
      "The display adapts to phones, tablets and PCs.",
    ],
    ["스마트폰에서 이용하는 ExamVue 365 Flow", "ExamVue 365 Flow on a phone"],
    ["데스크톱에서 이용하는 ExamVue 365 Flow", "ExamVue 365 Flow on a desktop"],
    ["태블릿에서 이용하는 ExamVue 365 Flow", "ExamVue 365 Flow on a tablet"],
    ["영상에서,", "From images"],
    ["진료의 확신으로.", "to confidence in care."],
    [
      "의뢰 접수부터 전문 판독, 결과 알림까지.",
      "From request to expert reading and results notification.",
    ],
    ["진료의 흐름을 끊지 않는 네 단계.", "Four steps that keep care moving."],
    ["더 깊게 읽고,", "Read deeper,"],
    ["더 명확하게 전해요.", "communicate clearly."],
    ["의뢰서 접수", "Submit a request"],
    ["영상을 올리고", "Upload images"],
    ["의뢰서를 작성하면 끝이에요.", "and complete the request."],
    ["전문 수의사 배정", "Specialist assigned"],
    ["의뢰 내용을 확인한 뒤", "After reviewing your request,"],
    [
      "알맞은 영상의학 전문 수의사를 배정해요.",
      "we assign a suitable veterinary radiology specialist.",
    ],
    ["전문 영상 판독", "Expert image reading"],
    ["영상을 꼼꼼히 살펴보고", "The specialist reviews the images"],
    ["종합 진단 보고서를 작성해요.", "and prepares a comprehensive diagnostic report."],
    ["결과 전달", "Results delivered"],
    ["판독이 끝나면 이메일 · 문자 ·", "When reading is complete, we notify you by email, text,"],
    ["카카오톡 · 왓츠앱으로 바로 알려 드려요.", "KakaoTalk or WhatsApp."],
    ["원격 판독에는,", "Remote reading includes"],
    ["웹 PACS 뷰어가 기본으로.", "a web PACS viewer."],
    [
      "의뢰한 영상은 기본 제공되는 ExamVue 365 Flow",
      "Open requested images directly in the included",
    ],
    ["웹 PACS 뷰어에서 바로 열어 볼 수 있어요.", "ExamVue 365 Flow web PACS viewer."],
    ["웹 PACS 자세히 보기", "Learn more about web PACS"],
    ["브라우저에서 바로 열기", "Open in your browser"],
    [
      "설치 없이, 의뢰한 영상을 웹 뷰어로 확인해요.",
      "View requested images on the web without installation.",
    ],
    ["익숙한 뷰어 도구 그대로", "Familiar viewer tools"],
    [
      "확대, 밝기 · 대비 조절, 측정까지 판독실처럼 써요.",
      "Zoom, adjust brightness and contrast, and measure as in a reading room.",
    ],
    ["병원 PACS로도 확장", "Expand to hospital PACS"],
    [
      "원격 판독 외 업무에도 쓰려면 별도 요금으로 이용할 수 있어요.",
      "Use it for work beyond remote reading for an additional fee.",
    ],
    ["PRICING / 요금 안내", "PRICING / Rates"],
    ["판독한 만큼만,", "Pay for what you read,"],
    ["투명하게 계산해요.", "with transparent pricing."],
    ["판독 요금", "Reading rates"],
    [
      "첫 이미지(부위) 요금에 추가분만 더해져요.",
      "The first image or body part is charged at the base rate; additional ones are charged separately.",
    ],
    ["표시 통화", "Display currency"],
    ["첫 번째 이미지 기준", "First image"],
    ["추가 이미지당", "Per additional image"],
    ["첫 번째 부위 기준", "First body part"],
    ["추가 부위당", "Per additional body part"],
    ["미리 충전하면", "Top up in advance"],
    ["더 드려요.", "and receive extra credit."],
    ["충전 금액 선택", "Choose top-up amount"],
    ["100만 원", "₩1 million"],
    ["200만 원", "₩2 million"],
    ["500만 원", "₩5 million"],
    ["충전 금액", "Top-up amount"],
    ["추가 적립", "Bonus credit"],
    ["사용 가능 금액", "Available balance"],
    ["충전하기", "Top up"],
    ["결제 방식 선택", "Choose how to pay"],
    ["건별 결제와 충전금 결제 중 골라요.", "Pay per reading or use prepaid credit."],
    ["언제든 충전", "Top up anytime"],
    ["손쉬운 취소 · 환불", "Easy cancellation and refunds"],
    ["판독의 배정 전이라면 언제든 취소해요.", "Cancel anytime before a reader is assigned."],
    ["내역 한눈에 보기", "See your history at a glance"],
    [
      "충전 · 사용 · 적립 내역을 한곳에서.",
      "View top-ups, spending and bonus credit in one place.",
    ],
    ["판독 결과는 얼마나 걸리나요?", "How long do reading results take?"],
    [
      "급한 의뢰는 최대 48시간 안에 결과를 받아 보실 수 있어요. 판독이 끝나면 이메일 · 문자 · 카카오톡 · 왓츠앱으로 바로 알려 드려요.",
      "Urgent requests receive results within 48 hours. When reading is complete, you are notified by email, text, KakaoTalk or WhatsApp.",
    ],
    ["어떤 영상을 의뢰할 수 있나요?", "What images can I submit?"],
    [
      "X-ray, CT, MRI, 초음파 등 주요 DICOM 영상을 의뢰할 수 있어요. 영상을 올리고 의뢰서를 작성하면 접수가 끝나요.",
      "You can submit major DICOM images including X-ray, CT, MRI and ultrasound. Upload images and complete a request to get started.",
    ],
    ["판독은 누가 하나요?", "Who reads the images?"],
    [
      "검증된 영상의학 전문 수의사가 판독해요. 의뢰 내용을 확인한 뒤 검사에 맞는 판독의를 배정해 드려요.",
      "A qualified veterinary radiology specialist reads them. We review the request and assign a specialist suited to the study.",
    ],
    ["요금은 어떻게 되나요?", "How much does it cost?"],
    [
      "검사 종류와 수량에 따른 현재 요금은 위 요금 안내에서 확인하실 수 있어요.",
      "See the current rates above for pricing by study type and quantity.",
    ],
    ["병원에 PACS가 없어도 쓸 수 있나요?", "Can we use it without a PACS?"],
    [
      "네, 영상을 직접 올려서 의뢰하시면 돼요. 의뢰한 영상은 기본 제공되는 웹 PACS 뷰어에서 바로 열어 볼 수 있어요.",
      "Yes. Upload images directly with your request and open them in the included web PACS viewer.",
    ],
    [
      "아니요, 웹으로 접속하면 바로 쓸 수 있어요. 휴대폰, 태블릿, PC 어디서든 의뢰하고 결과를 확인하세요.",
      "No. Access the service on the web from a phone, tablet or PC to request readings and view results.",
    ],
    ["더 빠르고 정확한 판독,", "For faster, accurate reading,"],
    ["지금 시작해 보세요.", "get started today."],
    ["가격 안내", "Pricing"],
    [
      "이미징 솔루션 전문 기업, 제이피아이헬스케어입니다. 문의: 02-2108-2580",
      "JPI Healthcare provides imaging solutions. Contact: 02-2108-2580",
    ],
    [
      "영상진단 장비부터 전문 원격 판독까지, 동물병원을 위한 원격진료 서비스를 제공합니다.",
      "We provide remote reading for veterinary hospitals, from diagnostic imaging equipment to expert interpretation.",
    ],
    [
      "별도 설치 없이 웹에서 사용하는 영상 관리 서비스입니다.",
      "An image management service available on the web without installation.",
    ],
    [
      "ExamVue 365 Flow와 Web PACS를 통해 진단 영상과 판독의 흐름을 연결합니다.",
      "ExamVue 365 Flow and Web PACS connect diagnostic imaging and reading.",
    ],
  ];
  const en = new Map(pairs),
    original = new WeakMap(),
    attrOriginal = new WeakMap();
  const storageKey = "examvue-language";
  let lang = "ko";
  const valid = (value) => value === "ko" || value === "en";
  const params = new URLSearchParams(location.search);
  try {
    lang = valid(params.get("lang"))
      ? params.get("lang")
      : valid(localStorage.getItem(storageKey))
        ? localStorage.getItem(storageKey)
        : "ko";
  } catch {
    if (valid(params.get("lang"))) lang = params.get("lang");
  }
  function translate(value) {
    if (lang !== "en") return value;
    const trimmed = value.trim(),
      translated =
        en.get(trimmed) || (/^[+\s\d,]+원$/.test(trimmed) ? trimmed.replace("원", " KRW") : null);
    return translated ? value.replace(trimmed, translated) : value;
  }
  function renderNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest("script,style,.flow-studio")) return;
      if (!original.has(node)) original.set(node, node.nodeValue);
      const next = translate(original.get(node));
      if (node.nodeValue !== next) node.nodeValue = next;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches("script,style,.flow-studio")) return;
      for (const name of ["aria-label", "alt", "title", "content"]) {
        if (
          !node.hasAttribute(name) ||
          (name === "content" && !node.matches('meta[name="description"]'))
        )
          continue;
        let attrs = attrOriginal.get(node);
        if (!attrs) {
          attrs = {};
          attrOriginal.set(node, attrs);
        }
        const current = node.getAttribute(name);
        if (
          !(name in attrs) ||
          (current !== attrs[name] && current !== (en.get(attrs[name]) || attrs[name]))
        )
          attrs[name] = current;
        const next = translate(attrs[name]);
        if (current !== next) node.setAttribute(name, next);
      }
      node.childNodes.forEach(renderNode);
    }
  }
  function localizedURL(url) {
    const u = new URL(url, location.href);
    u.searchParams.set("lang", lang);
    return u.href;
  }
  function render() {
    document.documentElement.lang = lang;
    renderNode(document.head);
    renderNode(document.body);
    document.querySelectorAll(".language select").forEach((select) => {
      select.value = lang;
    });
    document.querySelectorAll("iframe[data-src]").forEach((frame) => {
      frame.dataset.src = localizedURL(frame.dataset.src);
      if (frame.contentWindow)
        frame.contentWindow.postMessage({ type: "examvue-language", lang }, location.origin);
    });
  }
  function setLanguage(next, broadcast = true) {
    if (!valid(next)) return;
    lang = next;
    try {
      localStorage.setItem(storageKey, lang);
    } catch {}
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(history.state, "", url);
    render();
    if (broadcast && window.parent !== window)
      window.parent.postMessage({ type: "examvue-language", lang }, location.origin);
  }
  function start() {
    document
      .querySelectorAll(".language select")
      .forEach((select) => select.addEventListener("change", () => setLanguage(select.value)));
    document.addEventListener("click", (event) => {
      const a = event.target.closest("a[href]");
      if (!a) return;
      const u = new URL(a.href, location.href);
      if (u.origin === location.origin && !a.getAttribute("href").startsWith("#"))
        a.href = localizedURL(a.href);
    });
    window.addEventListener("message", (event) => {
      if (
        event.origin !== location.origin ||
        event.data?.type !== "examvue-language" ||
        !valid(event.data.lang)
      )
        return;
      if (
        event.source === window.parent ||
        [...document.querySelectorAll("iframe")].some(
          (frame) => frame.contentWindow === event.source,
        )
      )
        setLanguage(event.data.lang, false);
    });
    window.addEventListener("storage", (event) => {
      if (event.key === storageKey && valid(event.newValue)) setLanguage(event.newValue, false);
    });
    document
      .querySelectorAll("iframe[data-src]")
      .forEach((frame) =>
        frame.addEventListener("load", () =>
          frame.contentWindow?.postMessage({ type: "examvue-language", lang }, location.origin),
        ),
      );
    new MutationObserver((records) =>
      records.forEach((record) => {
        if (record.type === "attributes") renderNode(record.target);
        else record.addedNodes.forEach(renderNode);
      }),
    ).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });
    render();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
