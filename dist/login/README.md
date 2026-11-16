# ExamVue 로그인 · 첫 구현

Figma `dBqLrPQwdGVtFdGX66AYJf`의 `1854:44180` 화면을 기준으로 한 반응형 로그인 미리보기입니다. Pinterest의 Guavapay 3D Portfolio에서 푸른 유리 큐브, 어두운 입체 타일과 내부 조명을 참고했습니다. Figma의 문구, 흰 배경, 좌우 구성, Pretendard, 폼 크기와 간격을 우선합니다.

## 실행

프로젝트 루트에서 Node.js 20 이상으로 실행합니다. 별도 패키지 설치나 빌드가 필요 없습니다.

```sh
node tools/serve-login.mjs
```

브라우저: http://127.0.0.1:4173/login/ . 다른 포트는 `node tools/serve-login.mjs 4174`로 지정합니다. 기존 Windows 실행 도구를 쓰면 http://localhost:8080/login/ 에서도 확인할 수 있습니다. 파일을 직접 여는 대신 HTTP 서버로 실행하세요.

## 구현 범위와 피드백

- 첫 화면: Figma 데스크톱 비율과 폼 폭 374px, 입력 48px, 버튼 56px, 간격 32px. 모바일은 3D 위 / 폼 아래로 재배치합니다.
- 실제 Three.js 유리 큐브와 타일, 떠오름·회전·포인터 반응. 외부 이미지/CDN/HDR 요청 없이 기존 저장소의 Three.js와 폰트를 사용합니다.
- 3D 설정: 형태, 두께, 곡률, 비틀기, 색상, 재질, 투명도, 조명, 속도. 로컬 자동 저장, JSON 복사·가져오기, 초기화.
- `?controls=0`: 컨트롤 없는 화면. `?controls=1`: 설정 창을 바로 표시. 설정 창의 숨기기 버튼 또는 Shift+D로 유틸리티 숨김/표시. 모바일에서 다시 열려면 주소에 `?controls=1`을 넣습니다.
- 모션 정지와 OS의 `prefers-reduced-motion` 지원. OS 설정은 사용자 패널보다 우선합니다. 오프스크린과 비활성 탭의 3D 렌더링을 멈춥니다.
- 로그인 입력 검증, 비밀번호 표시, 이메일 기억하기, 계정 링크 모달. 모달을 다시 열 때 내부 단위별 등장 모션이 재생됩니다. Escape·배경 클릭·닫기·포커스 복귀 지원.
- **인증 API 미연결**: 실제 로그인, 이메일 전송, 비밀번호 변경, 회원가입은 수행하지 않습니다. 화면에 데모임을 표시합니다. 비밀번호는 저장하거나 전송하지 않습니다. 이후 승인된 인증 API를 연결합니다.
- 나머지 화면과 서비스 흐름은 첫 화면 피드백을 받은 뒤 확장합니다. 기존 메인 사이트는 수정하지 않았습니다.

## 구조와 수정

`index.html`: 문구·구조·접근성, `styles.css`: Figma 폼과 반응형·모션, `app.js`: 폼·모달·설정 저장, `scene.js`: 3D·조명·재질. SVG 두 개는 Figma 원본을 `assets/`에 저장했습니다. 폰트와 Three.js는 상위 `../assets/`, `../vendor/`를 공유하므로 배포 시 `dist/` 전체를 포함하세요. 라이선스도 기존 파일과 함께 보존합니다.

## 다른 컴퓨터 / GitHub

기존 `00-ffe400/jpiflow` 저장소의 `feature/login-3d-preview` 브랜치에서 작업합니다.

```sh
git clone --branch feature/login-3d-preview https://github.com/00-ffe400/jpiflow.git
cd jpiflow
node tools/serve-login.mjs
```

수정 전 `git pull`, 수정 후 `git add dist/login tools/serve-login.mjs README.md`, `git commit`, `git push`를 사용합니다. 3D 설정은 브라우저별로 저장되므로 다른 컴퓨터에 옮길 때 설정 복사·가져오기를 사용합니다.

## 배포 (요청 시)

현재 공개 배포하지 않습니다. GitHub push로 기존 Sites에 자동 배포되지 않습니다. 공개 배포 요청을 받으면 기존 `.openai/hosting.json`의 프로젝트 ID와 접근 범위를 유지하여 `dist/`를 패키징하고 해당 사이트에 배포합니다. 이 브랜치를 main에 병합하는 작업도 현재 수행하지 않습니다. 다른 정적 호스팅은 `dist/`를 사이트 루트로 지정하고 `/login/`으로 접근합니다.

## 기본 점검

```sh
node --check dist/login/app.js
node --check dist/login/scene.js
node --check tools/serve-login.mjs
```

브라우저에서는 1920×1080·1440×900·390×844·320×740 배치, 폼 오류, 비밀번호 토글, 모달 재열기, 설정 복사·가져오기와 움직임 줄이기를 확인합니다. 검토 결과는 루트의 `docs/login-preview-qa.md`에 기록합니다.
