 
const form = document.getElementById("surveyForm");
const groups = [...document.querySelectorAll(".question-group")];
const steps = [...document.querySelectorAll(".survey-step")];

const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressCount = document.getElementById("progressCount");

const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");

const errorBox = document.getElementById("surveyError");
const completePanel = document.getElementById("surveyComplete");
const summary = document.getElementById("personalSummary");
const restartButton = document.getElementById("restartButton");
const sidebar = document.querySelector(".survey-sidebar");

let currentGroup = 0;
const totalQuestions = 10;

function answeredCount() {
  let count = 0;

  for (let i = 1; i <= totalQuestions; i++) {
    const selected = form.querySelector(
      `input[name="q${i}"]:checked`
    );

    if (selected) count++;
  }

  return count;
}

function updateProgress() {
  const count = answeredCount();
  const percent = Math.round(count / totalQuestions * 100);

  progressPercent.textContent = percent + "%";
  progressCount.textContent = count + "/" + totalQuestions + " câu";
  progressBar.style.width = percent + "%";

  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentGroup);
    step.classList.toggle("done", index < currentGroup);
  });

  backButton.disabled = currentGroup === 0;
  nextButton.hidden = currentGroup === groups.length - 1;
  submitButton.hidden = currentGroup !== groups.length - 1;
}

function showGroup(index) {
  currentGroup = index;

  groups.forEach((group, i) => {
    group.hidden = i !== index;
  });

  errorBox.hidden = true;
  updateProgress();
}

function validateCurrentGroup() {
  const inputs = groups[currentGroup].querySelectorAll(
    'input[type="radio"]'
  );

  const names = [...new Set(
    [...inputs].map(input => input.name)
  )];

  for (const name of names) {
    const selected = form.querySelector(
      `input[name="${name}"]:checked`
    );

    if (!selected) {
      errorBox.textContent =
        "Bạn hãy trả lời đầy đủ các câu hỏi trong phần này nhé.";

      errorBox.hidden = false;

      const firstInput = groups[currentGroup].querySelector(
        `input[name="${name}"]`
      );

      firstInput.closest("fieldset").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      return false;
    }
  }

  errorBox.hidden = true;
  return true;
}

function scrollToSurvey() {
  document.querySelector(".survey-main").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

form.addEventListener("change", updateProgress);

nextButton.addEventListener("click", () => {
  if (!validateCurrentGroup()) return;

  if (currentGroup < groups.length - 1) {
    showGroup(currentGroup + 1);
    scrollToSurvey();
  }
});

backButton.addEventListener("click", () => {
  if (currentGroup > 0) {
    showGroup(currentGroup - 1);
    scrollToSurvey();
  }
});

steps.forEach(step => {
  step.addEventListener("click", () => {
    const target = Number(step.dataset.step);

    if (target <= currentGroup) {
      showGroup(target);
      scrollToSurvey();
      return;
    }

    if (!validateCurrentGroup()) return;

    if (target === currentGroup + 1) {
      showGroup(target);
      scrollToSurvey();
    }
  });
});

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!validateCurrentGroup()) return;

  if (answeredCount() !== totalQuestions) {
    errorBox.textContent = "Bạn hãy hoàn thành cả 10 câu hỏi.";
    errorBox.hidden = false;
    return;
  }

  const answers = new FormData(form);

  summary.replaceChildren();

  for (let i = 1; i <= totalQuestions; i++) {
    const row = document.createElement("div");
    row.className = "summary-item";

    const question = document.createElement("span");
    question.textContent = "Câu " + i;

    const answer = document.createElement("b");
    answer.textContent = answers.get("q" + i);

    row.append(question, answer);
    summary.appendChild(row);
  }

  form.hidden = true;
  sidebar.hidden = true;
  completePanel.hidden = false;

  progressPercent.textContent = "100%";
  progressCount.textContent = "10/10 câu";
  progressBar.style.width = "100%";

  steps.forEach(step => step.classList.add("done"));

  scrollToSurvey();
});

restartButton.addEventListener("click", () => {
  form.reset();

  form.hidden = false;
  sidebar.hidden = false;
  completePanel.hidden = true;

  showGroup(0);
  updateProgress();
  scrollToSurvey();
});

showGroup(0);
updateProgress();