/**
 * 復学可能性診断 Webアプリ - メイン処理
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 設定 & 定数
    // ==========================================
    // LINE公式アカウント等の遷移先URL（後から差し替え可能）
    const LINE_REDIRECT_URL = "https://lin.ee/TSJe0Uw";

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
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

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
    const inputVal = restoreInput.value.trim().toUpperCase();
    restoreError.style.display = 'none';

    const prefix = "FK-";
    if (!inputVal.startsWith(prefix)) {
      restoreError.style.display = 'block';
      return;
    }

    const rawData = inputVal.replace(prefix, '');
    if (typeof questions === 'undefined' || rawData.length !== questions.length || isNaN(rawData)) {
      restoreError.style.display = 'block';
      return;
    }

    let totalScore = 0;
    for (let i = 0; i < rawData.length; i++) {
      const optIdx = parseInt(rawData[i], 10);
      const q = questions[i];
      if (q && q.options[optIdx]) {
        totalScore += q.options[optIdx].score;
      } else {
        restoreError.style.display = 'block';
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

    document.getElementById('result-type-badge').textContent = data.badge || '';
    document.getElementById('result-type-name').textContent = data.name || '';
    document.getElementById('result-id').textContent = diagnosisId;
    const ctaPreview = document.getElementById('cta-id-preview');
    if (ctaPreview) ctaPreview.textContent = diagnosisId;
    document.getElementById('result-status-text').textContent = data.statusText || '';

    const actionList = document.getElementById('result-action-list');
    actionList.innerHTML = '';
    if (data.actions) {
      data.actions.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act;
        actionList.appendChild(li);
      });
    }

    // LINEボタンの動作設定（「相談を希望します」のみ自動入力）
    const lineBtn = document.getElementById('line-btn');
    if (lineBtn) {
      lineBtn.onclick = () => {
        // ▼ ここにご自身のLINE公式アカウントIDを入力してください（例: "@123abcde"）
        const lineId = "@506hokix"; 

        // 自動入力するメッセージ
        const message = "相談を希望します";

        // LINE起動用URL生成
        const lineUrl = `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent(message)}`;

        // LINEアプリを開く
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
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // リセット
  function resetQuiz() {
    restoreInput.value = '';
    restoreError.style.display = 'none';
    showScreen(startScreen);
  }
});
