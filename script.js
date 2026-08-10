/**
 * 復学可能性診断 Webアプリ - メイン処理
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 設定 & 定数
    // ==========================================
    // LINE公式アカウント等の遷移先URL（後から差し替え可能）
    const LINE_REDIRECT_URL = "https://lin.ee/zEte7eg";

    // 軸ごとの重み付け（合計1.0）
    const WEIGHTS = {
        energy: 0.4,
        school: 0.3,
        future: 0.2,
        home: 0.1
    };

    // ==========================================
    // アプリケーション状態 (State)
    // ==========================================
    let currentQuestionIndex = 0;
    let userAnswers = []; // 各質問に対するスコアを保持

    // ==========================================
    // DOM要素の取得
    // ==========================================
    const screens = {
        top: document.getElementById('screen-top'),
        question: document.getElementById('screen-question'),
        result: document.getElementById('screen-result')
    };

    const btnStart = document.getElementById('btn-start');
    const btnRestart = document.getElementById('btn-restart');
    const btnLine = document.getElementById('btn-line');

    const questionCard = document.getElementById('question-card');
    const questionText = document.getElementById('question-text');
    const questionNumber = document.getElementById('question-number');
    const progressPercent = document.getElementById('progress-percent');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const randomMessage = document.getElementById('random-message');
    const optionButtons = document.querySelectorAll('.btn-option');

    // ==========================================
    // イベントリスナー設定
    // ==========================================
    btnStart.addEventListener('click', startQuiz);
    btnRestart.addEventListener('click', restartQuiz);
    
    // LINEボタンの動作設定
    const btn-line= document.getElementById('line-btn');
    if (btn-line) {
      btn-line.onclick = () => {
        const lineId = "@506hokix"; //
        const message = "相談を希望します";
        const lineUrl = `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent(message)}`;

        window.location.href = lineUrl;
      };
    }

    // 選択肢ボタンにイベント追加
    optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const score = parseInt(e.currentTarget.getAttribute('data-score'), 10);
            handleAnswer(score);
        });
    });

    // ==========================================
    // 画面遷移・制御処理
    // ==========================================
    
    // 指定の画面を表示する関数
    function showScreen(screenKey) {
        Object.keys(screens).forEach(key => {
            screens[key].classList.remove('active');
        });
        screens[screenKey].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 診断スタート
    function startQuiz() {
        currentQuestionIndex = 0;
        userAnswers = [];
        showScreen('question');
        renderQuestion();
    }

    // もう一度診断する
    function restartQuiz() {
        showScreen('top');
    }

    // 質問描画処理
    function renderQuestion() {
        const currentQ = QUESTIONS_DATA[currentQuestionIndex];
        const totalQ = QUESTIONS_DATA.length;

        // 進捗表示の更新
        questionNumber.textContent = `質問 ${currentQuestionIndex + 1} / ${totalQ}`;
        const percent = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);
        progressPercent.textContent = `${percent}%`;
        progressBarFill.style.width = `${percent}%`;

        // 質問文の更新
        questionText.textContent = currentQ.text;

        // ランダムメッセージの更新
        const msgIndex = Math.floor(Math.random() * RANDOM_MESSAGES.length);
        randomMessage.textContent = RANDOM_MESSAGES[msgIndex];
    }

    // 回答選択時の処理
    function handleAnswer(score) {
        // 回答データを記録
        const currentQ = QUESTIONS_DATA[currentQuestionIndex];
        userAnswers.push({
            axis: currentQ.axis,
            score: score
        });

        // カードのスライドアニメーション処理（左へ消える）
        questionCard.classList.add('slide-out-left');

        setTimeout(() => {
            currentQuestionIndex++;

            if (currentQuestionIndex < QUESTIONS_DATA.length) {
                // 次の質問を表示して右からスライドイン
                questionCard.classList.remove('slide-out-left');
                questionCard.classList.add('slide-in-right');
                
                renderQuestion();

                // アニメーションクラスのリセット
                setTimeout(() => {
                    questionCard.classList.remove('slide-in-right');
                }, 50);
            } else {
                // 完了時：診断結果画面へ
                questionCard.classList.remove('slide-out-left');
                showResults();
            }
        }, 300);
    }

    // ==========================================
    // 診断ロジック・結果生成処理
    // ==========================================
    function showResults() {
        // 1. 各軸のスコア計算
        const axisTotals = { energy: 0, school: 0, future: 0, home: 0 };
        const axisMaxes = { energy: 0, school: 0, future: 0, home: 0 };

        userAnswers.forEach(ans => {
            axisTotals[ans.axis] += ans.score;
            axisMaxes[ans.axis] += 3; // 1問あたり最大3点
        });

        // 100点満点換算
        const axisScores = {
            energy: Math.round((axisTotals.energy / axisMaxes.energy) * 100),
            school: Math.round((axisTotals.school / axisMaxes.school) * 100),
            future: Math.round((axisTotals.future / axisMaxes.future) * 100),
            home: Math.round((axisTotals.home / axisMaxes.home) * 100)
        };

        // 2. 総合点の算出（重み付け）
        const finalScore = Math.round(
            (axisScores.energy * WEIGHTS.energy) +
            (axisScores.school * WEIGHTS.school) +
            (axisScores.future * WEIGHTS.future) +
            (axisScores.home * WEIGHTS.home)
        );

        // 3. 最もスコアが低い軸（ボトルネック）を特定
        let lowestAxis = 'energy';
        let lowestScore = axisScores.energy;

        Object.keys(axisScores).forEach(axis => {
            if (axisScores[axis] < lowestScore) {
                lowestScore = axisScores[axis];
                lowestAxis = axis;
            }
        });

        // 4. 結果表示の更新
        renderResultScreen(finalScore, lowestAxis);
        showScreen('result');
    }

    // 診断結果画面のDOM描画
    function renderResultScreen(finalScore, lowestAxis) {
        // ランダム診断ID生成
        document.getElementById('result-id').textContent = generateDiagnosticId();

        // タイプ情報の取得
        const typeInfo = TYPES_DATA[lowestAxis];

        // 描画設定
        document.getElementById('type-title').textContent = typeInfo.title;
        document.getElementById('type-status').textContent = typeInfo.status;
        document.getElementById('type-strength').textContent = typeInfo.strength;
        document.getElementById('type-challenge').textContent = typeInfo.challenge;
        document.getElementById('type-action').textContent = typeInfo.action;
        document.getElementById('type-avoid').textContent = typeInfo.avoid;
        document.getElementById('type-message').textContent = typeInfo.message;

        // ロードマップの描画
        renderRoadmap(typeInfo.roadmapStep);

        // 数字カウントアップアニメーション
        animateScoreCount(finalScore);

        // スクロールフェードイン効果の適用
        initScrollAnimations();
    }

    // 診断IDの生成 (例: FK-240731-3842)
    function generateDiagnosticId() {
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `FK-${yy}${mm}${dd}-${randomNum}`;
    }

    // スコアカウントアップ表示
    function animateScoreCount(targetScore) {
        const scoreElem = document.getElementById('score-number');
        let current = 0;
        const duration = 1200; // 1.2秒
        const stepTime = 20;
        const increment = targetScore / (duration / stepTime);

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                current = targetScore;
                clearInterval(timer);
            }
            scoreElem.textContent = Math.floor(current);
        }, stepTime);
    }

    // ロードマップ描画
    function renderRoadmap(currentStepNumber) {
        const container = document.getElementById('roadmap-container');
        container.innerHTML = '';

        ROADMAP_STEPS.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'roadmap-step';
            if (step.step === currentStepNumber) {
                stepDiv.classList.add('active');
            }
            stepDiv.textContent = `${step.step}. ${step.name}`;
            container.appendChild(stepDiv);
        });
    }

    // スクロールによる結果セクションフェードイン表示
    function initScrollAnimations() {
        const sections = document.querySelectorAll('.result-section');
        
        // 最初は順次フェードインさせる
        sections.forEach((sec, index) => {
            setTimeout(() => {
                sec.classList.add('visible');
            }, 200 * index);
        });
    }
});

