# JPI Flow / ExamVue 365 Flow

ExamVue 365 Flow 소개 웹사이트의 현재 작업 코드입니다.

공개 사이트: https://jpiflow.ffe400.chatgpt.site

## 프로젝트 구성

- `dist/`: HTML, CSS, JavaScript, 이미지, 폰트, Three.js 등 사이트 파일
- `tools/local-server.ps1`: Windows 로컬 미리보기 서버
- `start-local-server.bat`: Windows 미리보기 실행
- `.openai/hosting.json`: 기존 Sites 배포 대상 설정 (인증 정보 없음)

`dist/`는 별도 빌드 없이 운영 랜딩에 연결됩니다. 환경별 연결 주소와 가격표를 담은 배포본은 아래 명령으로 만듭니다. HTML 파일을 직접 열면 모듈·이미지 경로가 제대로 작동하지 않을 수 있습니다.

## 다른 컴퓨터에서 작업

1. 이 저장소를 clone하고 Codex에서 폴더를 엽니다.
2. Windows에서는 `start-local-server.bat`를 실행합니다. 기본 주소는 http://localhost:8080 입니다.
3. `dist/`의 파일을 수정합니다.
4. 작업을 마친 뒤 commit/push하고, 다른 컴퓨터에서는 작업 전에 pull합니다.

동시에 두 컴퓨터에서 같은 파일을 수정하기보다는 한 컴퓨터에서 push한 다음 다른 컴퓨터에서 pull하는 방식을 권장합니다.

## 공개 사이트 배포

공식 랜딩의 기본 주소는 `https://jpi365flow.com`입니다. 로그인·내 계정, 현재 가격, 잔액 충전, 이용약관·개인정보 처리방침·환불 정책은 모두 같은 환경의 랜딩으로 연결됩니다. 로그인 상태와 충전 통화는 랜딩에서 확인합니다.

Node.js 22 이상에서 다음 명령을 실행하면 `outputs/` 아래에 새 배포 폴더를 만들고 그 경로를 출력합니다. 기본 주소로 내보낼 때는 환경변수를 생략하세요.

```sh
node tools/export-handoff.mjs
LANDING_PUBLIC_ORIGIN=https://dev.jpi365flow.com node tools/export-handoff.mjs
```

PowerShell에서는 `$env:LANDING_PUBLIC_ORIGIN = 'https://dev.jpi365flow.com'`을 지정한 뒤 같은 Node.js 명령을 실행합니다. 이 환경변수는 `start-local-server.bat`로 미리 볼 때도 적용됩니다. 다른 환경을 지정할 때는 경로 없는 HTTPS 주소를 사용하세요. 로컬 서버에서는 `http://localhost:포트`도 지원합니다.

내보낼 때 해당 랜딩에서 한국어용 원화 요금과 영어용 달러 요금, 통화별 충전 상품을 읽습니다. 요금이 바뀌면 내보내기를 다시 실행하세요. 현재 가격은 어느 때나 가격 섹션의 링크에서 확인할 수 있습니다.

출력된 폴더를 Sites 배포 루트로 선택하세요. 폴더에는 기존 프로젝트 설정인 `.openai/hosting.json`과 배포할 `dist/`가 들어 있습니다. 저장소에 push해도 Sites는 자동 배포되지 않습니다.
다른 컴퓨터에서 필요한 로그인·연결은 해당 계정으로 다시 진행합니다.

## 작업 안내

이 브랜치는 홈페이지·Telemedicine·Web PACS 개발자 공유용 코드입니다. 별도의 로그인 3D·반구 실험은 포함하지 않습니다.

이 저장소는 기존 로컬 원본의 현재 스냅샷입니다. 과거 Git 기록, 배포 압축본, 검토 스크린샷, 로그인 토큰은 포함하지 않습니다.
기존 디자인, 문구, 이미지, 리본 설정, 등장 애니메이션 및 모바일 최적화를 유지하면서 필요한 부분만 수정하세요.

Three.js 및 Pretendard 등 포함된 외부 라이브러리·폰트의 라이선스는 해당 파일과 함께 보존합니다.

개발자 전달용 브랜치: `homepage-handoff`
