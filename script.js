document.addEventListener('DOMContentLoaded', () => {
  let currentQuestionIndex = 0;
  let userAnswers = [];

  // DOM要素
  const startScreen = document.getElementById('start-screen');
  const questionScreen = document.getElementById('question-screen');
  const resultScreen = document.getElementById('result-screen');

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const restoreBtn = document.getElementById('restore-btn');
  const restoreInput = document.getElementById('restore-id-input');
  const restoreError = document.getElementById('restore-error');

  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const questionNumber = document.getElementById('question-number');
  const progressBar = document.getElementById('progress');

  // イベントリスナー
  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (restartBtn) restartBtn.addEventListener('click', resetQuiz);
  if (restoreBtn) restoreBtn.addEventListener('click', handleRestore);

  // 診断開始
  function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    showScreen(questionScreen);
    renderQuestion();
  }

  // 質問の描画
  function renderQuestion() {
    if (typeof questions === 'undefined' || !questions[currentQuestionIndex]) return;

    const q = questions[currentQuestionIndex];
    questionText.textContent = q.text;
    questionNumber.textContent = `質問 ${currentQuestionIndex + 1} / ${questions.length}`;
    if (progressBar) {
      progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    }

    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => handleAnswer(opt.score, idx));
      optionsContainer.appendChild(btn);
    });
  }

  // 回答処理
  function handleAnswer(score, optionIndex) {
    userAnswers.push({ score, optionIndex });
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  // 通常の結果表示
  function showResult() {
    const totalScore = userAnswers.reduce((sum, ans) => sum + ans.score, 0);
    const resultType = determineType(totalScore);
    
    const encodedData = userAnswers.map(a => a.optionIndex).join('');
    const diagnosisId = `FK-${encodedData}`;

    renderResultView(resultType, diagnosisId);
  }

  // 診断IDからの復元処理
  function handleRestore() {
    if (!restoreInput) return;
    const inputVal = restoreInput.value.trim().toUpperCase();
    if (restoreError) restoreError.style.display = 'none';

    const prefix = "FK-";
    if (!inputVal.startsWith(prefix)) {
      if (restoreError) restoreError.style.display = 'block';
      return;
    }

    const rawData = inputVal.replace(prefix, '');
    if (typeof questions === 'undefined' || rawData.length !== questions.length || isNaN(rawData)) {
      if (restoreError) restoreError.style.display = 'block';
      return;
    }

    let totalScore = 0;
    for (let i = 0; i < rawData.length; i++) {
      const optIdx = parseInt(rawData[i], 10);
      const q = questions[i];
      if (q && q.options[optIdx]) {
        totalScore += q.options[optIdx].score;
      } else {
        if (restoreError) restoreError.style.display = 'block';
        return;
      }
    }

    const resultType = determineType(totalScore);
    renderResultView(resultType, inputVal);
  }

  // 結果表示の共通処理
  function renderResultView(typeKey, diagnosisId) {
    if (typeof resultsData === 'undefined' || !resultsData[typeKey]) return;
    const data = resultsData[typeKey];

    const badgeEl = document.getElementById('result-type-badge');
    const nameEl = document.getElementById('result-type-name');
    const idEl = document.getElementById('result-id');
    const ctaPreview = document.getElementById('cta-id-preview');
    const statusEl = document.getElementById('result-status-text');

    if (badgeEl) badgeEl.textContent = data.badge || '';
    if (nameEl) nameEl.textContent = data.name || '';
    if (idEl) idEl.textContent = diagnosisId;
    if (ctaPreview) ctaPreview.textContent = diagnosisId;
    if (statusEl) statusEl.textContent = data.statusText || '';

    const actionList = document.getElementById('result-action-list');
    if (actionList) {
      actionList.innerHTML = '';
      if (data.actions) {
        data.actions.forEach(act => {
          const li = document.createElement('li');
          li.textContent = act;
          actionList.appendChild(li);
        });
      }
    }

    // LINEボタンの動作設定
    const lineBtn = document.getElementById('line-btn');
    if (lineBtn) {
      lineBtn.onclick = () => {
        // ▼ ここにご自身のLINE公式アカウントIDを入力してください（例: "@123abcde"）
        const lineId = "@506hokix"; 

        const message = "相談を希望します";
        const lineUrl = `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent(message)}`;

        window.location.href = lineUrl;
      };
    }

    showScreen(resultScreen);
  }

  // タイプ判定ロジック
  function determineType(score) {
    if (score <= 5) return 'typeA';
    if (score <= 10) return 'typeB';
    return 'typeC';
  }

  // 画面切り替え
  function showScreen(screen) {
    if (!screen) return;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // リセット
  function resetQuiz() {
    if (restoreInput) restoreInput.value = '';
    if (restoreError) restoreError.style.display = 'none';
    showScreen(startScreen);
  }
});
