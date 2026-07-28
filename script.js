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

  // イベントリスナー設定
  startBtn.addEventListener('click', startQuiz);
  restartBtn.addEventListener('click', resetQuiz);
  restoreBtn.addEventListener('click', handleRestore);

  // 診断開始
  function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    showScreen(questionScreen);
    renderQuestion();
  }

  // 質問の描画
  function renderQuestion() {
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

  // 結果表示（通常の診断完了時）
  function showResult() {
    // スコア計算
    const totalScore = userAnswers.reduce((sum, ans) => sum + ans.score, 0);
    const resultType = determineType(totalScore);
    
    // 診断IDの生成 (例: FK-012012)
    const encodedData = userAnswers.map(a => a.optionIndex).join('');
    const diagnosisId = `FK-${encodedData}`;

    renderResultView(resultType, diagnosisId);
  }

  // 診断IDからの復元処理
  function handleRestore() {
    const inputVal = restoreInput.value.trim().toUpperCase();
    restoreError.style.display = 'none';

    // 簡易バリデーション (FK-で始まり、質問数分の数字が続くか)
    const prefix = "FK-";
    if (!inputVal.startsWith(prefix)) {
      restoreError.style.display = 'block';
      return;
    }

    const rawData = inputVal.replace(prefix, '');
    if (rawData.length !== questions.length || isNaN(rawData)) {
      restoreError.style.display = 'block';
      return;
    }

    // 復元スコア計算
    let restoredAnswers = [];
    let totalScore = 0;

    for (let i = 0; i < rawData.length; i++) {
      const optIdx = parseInt(rawData[i], 10);
      const q = questions[i];
      if (q && q.options[optIdx]) {
        const score = q.options[optIdx].score;
        restoredAnswers.push({ score, optionIndex: optIdx });
        totalScore += score;
      } else {
        restoreError.style.display = 'block';
        return;
      }
    }

    const resultType = determineType(totalScore);
    renderResultView(resultType, inputVal);
  }

  // 結果描画の共通処理
  function renderResultView(typeKey, diagnosisId) {
    const data = resultsData[typeKey];
    if (!data) return;

    document.getElementById('result-type-badge').textContent = data.badge;
    document.getElementById('result-type-name').textContent = data.name;
    document.getElementById('result-id').textContent = diagnosisId;
    document.getElementById('cta-id-preview').textContent = diagnosisId;
    document.getElementById('result-status-text').textContent = data.statusText;

    const actionList = document.getElementById('result-action-list');
    actionList.innerHTML = '';
    data.actions.forEach(act => {
      const li = document.createElement('li');
      li.textContent = act;
      actionList.appendChild(li);
    });

    // LINEコピーボタンの設定
    const lineBtn = document.getElementById('line-btn');
    lineBtn.onclick = () => {
      navigator.clipboard.writeText(`【診断ID】${diagnosisId}\nLINE相談を希望します。`);
      alert('診断IDをコピーしました！LINE画面に貼り付けてご送信ください。');
    };

    showScreen(resultScreen);
  }

  // スコアに基づくタイプ判定 logic
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
