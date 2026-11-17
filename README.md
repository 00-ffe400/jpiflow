# JPI Flow / ExamVue 365 Flow

## 로그인 3D 첫 구현 — 검토 브랜치

`feature/login-3d-preview`에는 Figma 로그인 화면과 **261101.blend 원본 메시·카메라를 사용하는 실시간 3D 스튜디오**의 `/login/` 미리보기가 있습니다. 파란 구와 원형 구멍이 있는 유리판 6개 배열을 기본으로 제공하며, 오른쪽 패널에서 형상·재질·초점·전체 이동을 편집합니다. 이전 곡선·타일 모델은 비교 프리셋으로 보존합니다. `node tools/serve-login.mjs` 실행 후 http://127.0.0.1:4173/login/?controls=1 에서 확인하세요. 실행·설정·Blender 재추출·GitHub·배포 방법은 [로그인 README](dist/login/README.md)를 참고하세요. **공개 배포와 main 병합은 수행하지 않습니다.**

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

## 로그인 3D 시안 · 파란 중심과 유리 궤도

`feature/login-3d-preview` 브랜치에서 작업합니다. Node.js 설치 후 다음 명령으로 실행합니다.

```sh
node tools/serve-login.mjs 4174
```

- 로그인 화면: http://127.0.0.1:4174/login/
- 장면만 보기: http://127.0.0.1:4174/login/?view=scene
- 우측의 **3D 설정**에서 전체 이동, 중심 형태, 유리 궤도, 재질과 모션을 편집합니다.

Pinterest 633881716349791611의 중심 오브젝트와 문구를 참고한 시안입니다. 모니터, 화면 테두리, 물리적 받침대와 배경 건축물은 구현 대상에서 제외했습니다. 평평한 원형 절단면이 있는 파란 반구와 세 겹의 유리 궤도는 실제 지오메트리이며, 문구는 선택 가능한 HTML 텍스트입니다. 문구는 의미 단위로 등장하고 중심과 궤도는 각각 회전·부유합니다. 움직임 줄이기를 지원합니다. 기존 로그인 폼과 이전 모델들은 유지합니다.

설정 구조는 `dist/login/studio-state.js`에 정의되어 있습니다. 새 모델 이름은 `pinOrbit`, 중심은 `pinCore`, 궤도는 `pinRings`이며 각 그룹의 위치·회전·크기, `material`, `motion`은 독립적입니다. 형상은 `pin-orbits.js`, 렌더링은 `scene-v2.js`, 문구는 `studio.js`와 `studio.css`에서 관리합니다. 반구는 곡면·작은 가장자리 라운드·평평한 원형 절단면이 닫힌 메시입니다. 가로·높이·깊이, 절단면 테두리 라운드, X·Y·Z 기울기를 조절할 수 있습니다. 기존 큐브 설정은 카메라·재질·궤도·모션을 유지한 채 중심 형태와 반구 비율·기울기만 한 번 보정합니다. 보정 전 설정은 브라우저의 `examvue.studio.v2.beforeHemisphere`에 보존합니다. 형태 변경 시에만 메시를 재생성하고 이전 지오메트리를 해제합니다. 회전 속도는 시간에 따라 적분해 변경 시 각도가 튀지 않게 합니다.

설정은 브라우저에 자동 저장됩니다. 저장 탭의 **기억한 현재 설정 · 유리판과 파란 구**는 이전에 요청한 기준값을 복원합니다. 원본은 `dist/login/presets/current-baseline.json`이며, 구 이동 깊이 1.2u와 반복 시간 4.4초를 포함합니다. 이번 구성 수정 직전에 내보낸 설정은 `dist/login/presets/before-content-revision.json`으로도 보존했으며 JSON 가져오기로 복원할 수 있습니다. 이름을 붙여 저장한 사용자 프리셋은 유지됩니다.

모바일은 별도 카메라와 텍스트 배치를 사용하고, 좁은 세로 화면에서는 카메라 거리를 확보합니다. 390px 모바일과 데스크톱에서 로그인·장면 보기, 우측 패널 열기/닫기, 궤도 개수 변경과 가로 넘침을 확인했습니다. PNG 내보내기는 3D 장면 전용이며 HTML 문구와 패널은 포함하지 않습니다.

검증 명령:

```sh
node tools/check-pin-orbits.mjs
node tools/check-blender-model.mjs
node tools/check-glass-composite.mjs
```

공개 배포는 별도 요청 후에만 진행합니다. 저장소에 push하는 작업과 사이트 배포는 별개입니다.
