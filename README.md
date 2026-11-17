# JPI Flow / ExamVue 365 Flow

## 로그인 3D 첫 구현 — 검토 브랜치

`feature/login-3d-preview`에는 Figma 로그인 화면과 실시간 곡선 조형 3D 스튜디오의 `/login/` 미리보기가 있습니다. 설정은 오른쪽 패널이며, 회색 정지 조형 3안, 유리 보기 전환, 전체 모델 이동과 두께·곡률·비틀기 설정을 제공합니다. 이전 타일 모델도 비교 프리셋으로 유지합니다. 기존 소개 사이트는 유지됩니다. `node tools/serve-login.mjs` 실행 후 http://127.0.0.1:4173/login/?controls=1 에서 확인하세요. 자세한 실행·설정 구조·GitHub 작업·배포 방법과 후속 확장 범위는 [로그인 README](dist/login/README.md)를 참고하세요. **공개 배포와 main 병합은 수행하지 않습니다.**

ExamVue 365 Flow 소개 웹사이트의 현재 작업 코드입니다.

공개 사이트: https://jpiflow.ffe400.chatgpt.site

## 프로젝트 구성

- `dist/`: HTML, CSS, JavaScript, 이미지, 폰트, Three.js 등 사이트 파일
- `tools/local-server.ps1`: Windows 로컬 미리보기 서버
- `start-local-server.bat`: Windows 미리보기 실행
- `.openai/hosting.json`: 기존 Sites 배포 대상 설정 (인증 정보 없음)

별도 빌드 과정 없이 `dist/`를 웹 서버에서 제공합니다. HTML 파일을 직접 열면 모듈·이미지 경로가 제대로 작동하지 않을 수 있습니다.

## 다른 컴퓨터에서 작업

1. 이 저장소를 clone하고 Codex에서 폴더를 엽니다.
2. Windows에서는 `start-local-server.bat`를 실행합니다. 기본 주소는 http://localhost:8080 입니다.
3. `dist/`의 파일을 수정합니다.
4. 작업을 마친 뒤 commit/push하고, 다른 컴퓨터에서는 작업 전에 pull합니다.

동시에 두 컴퓨터에서 같은 파일을 수정하기보다는 한 컴퓨터에서 push한 다음 다른 컴퓨터에서 pull하는 방식을 권장합니다.

## 공개 사이트 배포

이 저장소에 push하는 것만으로 현재 Sites 사이트가 자동 배포되지는 않습니다.
Codex에서 기존 Sites 연결을 사용해 `.openai/hosting.json`의 프로젝트 ID를 유지하고, 현재 `dist/`를 패키징해 배포합니다. 새 사이트를 생성하지 마세요.
다른 컴퓨터에서 필요한 로그인·연결은 해당 계정으로 다시 진행합니다.

## 작업 안내

이 저장소는 기존 로컬 원본의 현재 스냅샷입니다. 과거 Git 기록, 배포 압축본, 검토 스크린샷, 로그인 토큰은 포함하지 않습니다.
기존 디자인, 문구, 이미지, 리본 설정, 등장 애니메이션 및 모바일 최적화를 유지하면서 필요한 부분만 수정하세요.

Three.js 및 Pretendard 등 포함된 외부 라이브러리·폰트의 라이선스는 해당 파일과 함께 보존합니다.
