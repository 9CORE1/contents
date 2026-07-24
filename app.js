document.addEventListener('DOMContentLoaded', () => {
    // === 1. 테마 토글 (다크 / 라이트) ===
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // 로컬 스토리지에서 테마 불러오기
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    document.body.className = savedTheme;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.className = 'light-theme';
                localStorage.setItem('theme', 'light-theme');
            } else {
                document.body.className = 'dark-theme';
                localStorage.setItem('theme', 'dark-theme');
            }
        });
    }

    // === 2. 모바일 사이드바 햄버거 메뉴 ===
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const appSidebar = document.getElementById('appSidebar');

    if (mobileMenuBtn && appSidebar) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            appSidebar.classList.toggle('open');
        });

        // 사이드바 외부 클릭 시 모바일 사이드바 닫기
        document.addEventListener('click', (e) => {
            if (appSidebar.classList.contains('open') && !appSidebar.contains(e.target) && e.target !== mobileMenuBtn) {
                appSidebar.classList.remove('open');
            }
        });
    }

    // === 3. 진도체크 및 프로그레스 바 관리 ===
    const stepChecks = document.querySelectorAll('.step-check');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalSteps = stepChecks.length;

    // 진척율 계산 및 UI 업데이트
    function updateProgress() {
        const checkedCount = document.querySelectorAll('.step-check:checked').length;
        const percentage = totalSteps > 0 ? Math.round((checkedCount / totalSteps) * 100) : 0;
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
    }

    // 초기 상태 불러오기 및 이벤트 바인딩
    stepChecks.forEach(check => {
        const stepNum = check.getAttribute('data-step');
        const isChecked = localStorage.getItem(`step-${stepNum}`) === 'true';
        check.checked = isChecked;

        // 체크박스 클릭 시 저장
        check.addEventListener('change', () => {
            localStorage.setItem(`step-${stepNum}`, check.checked);
            updateProgress();
        });
        
        // 체크박스가 속한 부모 a 태그로의 클릭 이벤트 버블링 방지 (이동 방지)
        check.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    updateProgress();

    // === 4. 1단계 내부 서브 스텝 슬라이더 제어 로직 (index.html 전용) ===
    const swiperBtns = document.querySelectorAll('.swiper-btn');
    const contentSwiperBar = document.querySelector('.content-swiper-bar');
    const subSteps = document.querySelectorAll('.sub-step');

    if (swiperBtns.length > 0 && contentSwiperBar && subSteps.length > 0) {
        swiperBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetStep = parseInt(btn.getAttribute('data-target-step'), 10);

                // 스위퍼 바 클래스 조절 (translateX 처리를 위해)
                if (targetStep === 2) {
                    contentSwiperBar.classList.add('step-2');
                    contentSwiperBar.classList.remove('step-3');
                } else if (targetStep === 3) {
                    contentSwiperBar.classList.add('step-3');
                    contentSwiperBar.classList.remove('step-2');
                } else {
                    contentSwiperBar.classList.remove('step-2', 'step-3');
                }

                // 버튼 active 클래스 토글
                swiperBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 서브 스텝 본문 콘텐츠 스와프
                subSteps.forEach((step, idx) => {
                    step.classList.remove('active');
                    if (idx === (targetStep - 1)) {
                        step.classList.add('active');
                    }
                });
            });
        });
    }


    // === 5. 프롬프트 복사 기능 (5단계 전용) ===
    const copyBtns = document.querySelectorAll('.copy-btn');
    const copyToast = document.getElementById('copyToast');
    let toastTimeout;

    if (copyBtns.length > 0) {
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const promptElement = document.getElementById(targetId);
                if (!promptElement) return;
                
                const promptText = promptElement.textContent;
                
                navigator.clipboard.writeText(promptText).then(() => {
                    // 토스트 띄우기
                    if (copyToast) {
                        copyToast.classList.add('show');
                        clearTimeout(toastTimeout);
                        toastTimeout = setTimeout(() => {
                            copyToast.classList.remove('show');
                        }, 2500);
                    }

                    // 버튼 아이콘 임시 변환 피드백
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `<i class="fa-solid fa-check text-accent-green"></i> 복사 완료!`;
                    btn.style.borderColor = 'var(--accent-green)';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.borderColor = '';
                    }, 2000);
                }).catch(err => {
                    console.error('프롬프트 복사 실패: ', err);
                });
            });
        });
    }

    // === 5-2. 메일주소 복사 기능 ===
    const emailBtns = document.querySelectorAll('.copy-email-btn');
    if (emailBtns.length > 0) {
        emailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const emailText = "teacha99@gmail.com";
                navigator.clipboard.writeText(emailText).then(() => {
                    // toast 팝업 노출 (없으면 동적으로 생성해서 body에 붙임)
                    let toast = document.getElementById('copyToast');
                    if (!toast) {
                        toast = document.createElement('div');
                        toast.id = 'copyToast';
                        toast.className = 'copy-toast';
                        toast.innerHTML = `<i class="fa-solid fa-circle-check toast-icon"></i> <span>클립보드에 메일주소가 복사되었습니다!</span>`;
                        document.body.appendChild(toast);
                    } else {
                        const span = toast.querySelector('span');
                        if (span) span.textContent = '클립보드에 메일주소가 복사되었습니다!';
                    }
                    
                    toast.classList.add('show');
                    clearTimeout(toastTimeout);
                    toastTimeout = setTimeout(() => {
                        toast.classList.remove('show');
                    }, 2500);

                    // 버튼 피드백 (아이콘 및 텍스트 변경)
                    const icon = btn.querySelector('.step-num i');
                    const itemTitle = btn.querySelector('.item-title');
                    
                    const originalIconClass = icon ? icon.className : '';
                    const originalTitleText = itemTitle ? itemTitle.textContent : '';

                    if (icon) icon.className = 'fa-solid fa-check text-accent-green';
                    if (itemTitle) {
                        itemTitle.textContent = '복사 완료!';
                        itemTitle.classList.add('text-accent-green');
                    }

                    setTimeout(() => {
                        if (icon) icon.className = originalIconClass;
                        if (itemTitle) {
                            itemTitle.textContent = originalTitleText;
                            itemTitle.classList.remove('text-accent-green');
                        }
                    }, 2000);
                }).catch(err => {
                    console.error('메일 복사 실패: ', err);
                });
            });
        });
    }

    // === 5-1. 프롬프트 더보기 / 접기 토글 기능 ===
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.toggle-more-btn');
        if (!toggleBtn) return;
        
        const contentBox = toggleBtn.closest('.prompt-split-content');
        if (!contentBox) return;

        const isExpanded = contentBox.classList.contains('expanded');
        const span = toggleBtn.querySelector('span');
        const icon = toggleBtn.querySelector('i');

        if (isExpanded) {
            contentBox.classList.remove('expanded');
            if (span) span.textContent = '더보기';
            if (icon) icon.className = 'fa-solid fa-chevron-down';
        } else {
            contentBox.classList.add('expanded');
            if (span) span.textContent = '접기';
            if (icon) icon.className = 'fa-solid fa-chevron-up';
        }
    });
    // === 6. 비디오 플레이어 선택 기능 (6단계 전용) ===
    const videoSelectItems = document.querySelectorAll('.video-select-item');
    const mainVideoPlayer = document.getElementById('mainVideoPlayer');
    const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
    const currentVideoTitle = document.getElementById('currentVideoTitle');
    const currentVideoDesc = document.getElementById('currentVideoDesc');

    if (videoSelectItems.length > 0 && mainVideoPlayer) {
        // 비디오 세부 설명 매핑
        const videoDescriptions = {
            'PZkXdko-YA4': '프롬프트 엔지니어링 개선 전, AI 동영상 생성 초기에 나타나는 왜곡 현상과 전형적인 물리법칙 위배 움직임을 비교 분석하는 예제입니다.',
            '2mnmhfSB858': 'Seedance 2.0 mini 버전으로 프롬프트 개선 전 생성한 숏폼 영상입니다. 해상도가 다소 낮고 디테일이 부족한 초기 렌더링 상태를 보여줍니다.',
            'EDOPMsvdMMo': '프롬프트를 정교하게 수정하고 세부 속성을 묘사한 뒤 Seedance 2.0으로 렌더링한 숏폼 영상입니다. 캐릭터 움직임과 의상의 일관성이 대폭 개선되었습니다.',
            '2U8-ympkdo0': 'Kling 3.0의 Motion Control 기능을 활용해 고화질로 생성한 숏폼 예시입니다. 카메라 모션과 캐릭터 동선이 매우 매끄럽게 제어되는 결과를 확인하세요.',
            '44f86T3UdJM': 'Google Omni Flash 엔진을 적용하여 생성된 일반형 가로 비율 영상입니다. 구도의 안정성과 프레임의 일관성이 높게 유지됩니다.',
            'DBJGwULkyl4': 'Seedance 2.0 버전을 실전 마케팅 연출에 응용한 영상입니다. 조명 연출 및 배경 디테일의 풍부함을 비교해볼 수 있습니다.',
            'JnvFk4L2vqU': 'Gemini를 활용하여 제작한 숏폼 영상 결과물입니다.'
        };

        videoSelectItems.forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.getAttribute('data-video-id');
                const videoType = item.getAttribute('data-video-type');
                
                const titleEl = item.querySelector('.v-title');
                const title = titleEl ? titleEl.textContent : '';
                
                // 리스트 활성 스타일 설정
                videoSelectItems.forEach(vi => vi.classList.remove('active'));
                item.classList.add('active');



                // 유튜브 임베드 주소 교체 및 세부 묘사 텍스트 변경
                mainVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
                if (currentVideoTitle) currentVideoTitle.textContent = title;
                if (currentVideoDesc) currentVideoDesc.textContent = videoDescriptions[videoId] || '';
            });
        });
    }

    // === 7. CapCut 튜토리얼 비디오 선택 기능 (7단계 전용) ===
    const tutorialItems = document.querySelectorAll('.tutorial-item');
    const capcutVideoPlayer = document.getElementById('capcutVideoPlayer');
    const capcutVideoTitle = document.getElementById('capcutVideoTitle');
    const capcutVideoDesc = document.getElementById('capcutVideoDesc');

    if (tutorialItems.length > 0 && capcutVideoPlayer) {
        tutorialItems.forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.getAttribute('data-video-id');
                const title = item.getAttribute('data-title');
                const desc = item.getAttribute('data-desc');

                tutorialItems.forEach(ti => ti.classList.remove('active-tutorial'));
                item.classList.add('active-tutorial');

                capcutVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
                if (capcutVideoTitle) capcutVideoTitle.textContent = title;
                if (capcutVideoDesc) capcutVideoDesc.textContent = desc;
            });
        });
    }


    // === 8. 이미지 상세 보기 (5단계 전용 라이트박스 뷰어) ===
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    
    // 툴바 버튼
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');

    if (galleryItems.length > 0 && lightboxModal && lightboxImg) {
        let currentIndex = 0;
        const galleryList = Array.from(galleryItems);

        let currentScale = 1;
        let isDragging = false;
        let startX = 0, startY = 0;
        let translateX = 0, translateY = 0;

        // 라이트박스 열기
        function openLightbox(index) {
            currentIndex = index;
            const item = galleryList[currentIndex];
            const src = item.getAttribute('data-src');
            const caption = item.getAttribute('data-title');

            lightboxImg.src = src;
            if (lightboxCaption) lightboxCaption.textContent = caption;
            
            // 줌 초기화
            resetZoom();

            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        }

        // 라이트박스 닫기
        function closeLightbox() {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
        }

        // 이전 이미지로 이동
        function showPrevImage() {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = galleryList.length - 1;
            openLightbox(prevIndex);
        }

        // 다음 이미지로 이동
        function showNextImage() {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= galleryList.length) nextIndex = 0;
            openLightbox(nextIndex);
        }

        galleryList.forEach((item, index) => {
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        });

        if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
        if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
        if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
        if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });

        // 키보드 네비게이션 매핑
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        });

        // --- 줌 & 드래그 인터랙션 구현 ---
        function updateImageTransform() {
            lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        }

        function resetZoom() {
            currentScale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
        }

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                currentScale = Math.min(currentScale + 0.25, 4);
                updateImageTransform();
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                currentScale = Math.max(currentScale - 0.25, 0.5);
                if (currentScale === 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateImageTransform();
            });
        }

        if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

        // 마우스 휠 줌 기능
        lightboxImg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            currentScale = Math.min(Math.max(currentScale + delta, 0.5), 4);
            if (currentScale === 1) {
                translateX = 0;
                translateY = 0;
            }
            updateImageTransform();
        });

        // 드래그 기능 (확대되었을 때 이동 가능)
        lightboxImg.addEventListener('mousedown', (e) => {
            if (currentScale <= 1) return; // 확대 안되었을 땐 드래그 방지
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            lightboxImg.style.transition = 'none'; // 드래그 시 딜레이 없앰
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                lightboxImg.style.transition = 'transform 0.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
            }
        });

        // === 5. 즐겨찾기 드롭다운 이동 처리 ===
        const favSelects = document.querySelectorAll('.fav-select');
        favSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const url = e.target.value;
                if (url) {
                    window.open(url, '_blank');
                    select.value = ""; // 선택 후 초기화하여 placeholder 상태로 복귀
                }
            });
        });
    }
});
