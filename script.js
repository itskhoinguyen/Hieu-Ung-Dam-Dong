const form = document.getElementById("surveyForm");
const groups = [...document.querySelectorAll(".question-group")];
const steps = [...document.querySelectorAll(".step")];
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressCount = document.getElementById("progressCount");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");
const errorBox = document.getElementById("surveyError");
const sidebar = document.getElementById("surveySidebar");
const resultPanel = document.getElementById("resultPanel");
const resultTitle = document.getElementById("resultTitle");
const resultIntro = document.getElementById("resultIntro");
const adviceText = document.getElementById("adviceText");
const answerSummary = document.getElementById("answerSummary");
const restartButton = document.getElementById("restartButton");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const totalQuestions = 10;
let currentGroup = 0;

function selectedAnswer(name) {
  return form.querySelector(`input[name="${name}"]:checked`);
}
function answeredCount() {
  let count = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    if (selectedAnswer(`q${i}`)) count++;
  }
  return count;
}
function updateProgress() {
  const count = answeredCount();
  const percent = Math.round(count / totalQuestions * 100);
  progressPercent.textContent = `${percent}%`;
  progressCount.textContent = `${count}/${totalQuestions} câu`;
  progressBar.style.width = `${percent}%`;
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === currentGroup);
    step.classList.toggle("done", i < currentGroup);
  });
  backButton.disabled = currentGroup === 0;
  nextButton.hidden = currentGroup === groups.length - 1;
  submitButton.hidden = currentGroup !== groups.length - 1;
}
function showGroup(index) {
  currentGroup = index;
  groups.forEach((group, i) => group.hidden = i !== index);
  errorBox.hidden = true;
  updateProgress();
}
function validateGroup() {
  const names = [...new Set(
    [...groups[currentGroup].querySelectorAll('input[type="radio"]')]
      .map(input => input.name)
  )];
  for (const name of names) {
    if (!selectedAnswer(name)) {
      errorBox.textContent = "Bạn hãy trả lời đầy đủ các câu hỏi trong phần này nhé.";
      errorBox.hidden = false;
      groups[currentGroup].querySelector(`input[name="${name}"]`)
        .closest("fieldset").scrollIntoView({behavior:"smooth", block:"center"});
      return false;
    }
  }
  errorBox.hidden = true;
  return true;
}
function scrollToPanel() {
  document.querySelector(".survey-panel").scrollIntoView({behavior:"smooth", block:"start"});
}
form.addEventListener("change", updateProgress);
nextButton.addEventListener("click", () => {
  if (!validateGroup()) return;
  if (currentGroup < groups.length - 1) {
    showGroup(currentGroup + 1);
    scrollToPanel();
  }
});
backButton.addEventListener("click", () => {
  if (currentGroup > 0) {
    showGroup(currentGroup - 1);
    scrollToPanel();
  }
});
steps.forEach(step => step.addEventListener("click", () => {
  const target = Number(step.dataset.step);
  if (target <= currentGroup) {
    showGroup(target);
    scrollToPanel();
  } else if (target === currentGroup + 1 && validateGroup()) {
    showGroup(target);
    scrollToPanel();
  }
}));

function makeSummary() {
  answerSummary.replaceChildren();
  for (let i = 1; i <= totalQuestions; i++) {
    const chosen = selectedAnswer(`q${i}`);
    const row = document.createElement("div");
    row.className = "answer-row";
    const question = document.createElement("span");
    question.textContent = `Câu ${i}`;
    const answer = document.createElement("b");
    answer.textContent = chosen ? chosen.value : "Chưa trả lời";
    row.append(question, answer);
    answerSummary.append(row);
  }
}
function makeAdvice() {
  // Nhóm câu trả lời được dùng để gợi ý tự suy ngẫm, không phải điểm chẩn đoán.
  const answers = {};
  for (let i = 1; i <= totalQuestions; i++) {
    answers[i] = selectedAnswer(`q${i}`)?.value || "";
  }
  const mayFeelPressure = [
    "Thường xuyên", "Rất thường xuyên", "Thỉnh thoảng",
    "Hơi ngại nhưng vẫn muốn nói", "Lo bị đánh giá hoặc chê cười",
    "Muốn đồng ý để tránh khác biệt", "Sợ bị tách biệt khỏi nhóm",
    "Tin rằng số đông luôn đúng", "Thiếu tự tin vào bản thân",
    "Lựa chọn của đa số mọi người", "Thường tin ngay", "Ít khi"
  ];
  const pressureAnswers = [answers[1], answers[2], answers[4], answers[5], answers[7], answers[8]];
  const count = pressureAnswers.filter(value => mayFeelPressure.includes(value)).length;

  if (count >= 3) {
    resultTitle.textContent = "Hãy dành cho mình thời gian để suy xét";
    resultIntro.textContent = "Một số câu trả lời cho thấy ý kiến của người xung quanh có thể ảnh hưởng đến bạn trong vài tình huống. Điều này khá phổ biến và không nói lên rằng bạn yếu đuối hay thiếu bản lĩnh.";
    adviceText.textContent = "Khi thấy mình muốn đổi ý chỉ vì mọi người chọn khác, hãy tạm dừng và tự hỏi: “Nếu không biết người khác chọn gì, mình sẽ chọn gì?” Sau đó kiểm tra thông tin và cân nhắc hậu quả. Bạn có thể lắng nghe số đông mà vẫn tự đưa ra quyết định phù hợp với mình.";
  } else {
    resultTitle.textContent = "Tiếp tục suy nghĩ độc lập và cởi mở";
    resultIntro.textContent = "Các lựa chọn của bạn gợi ý rằng bạn có thể đang cân nhắc ý kiến của mình và người khác trong những tình huống được hỏi. Ai cũng có lúc chịu ảnh hưởng, tùy hoàn cảnh.";
    adviceText.textContent = "Hãy tiếp tục kiểm chứng thông tin, lắng nghe ý kiến khác và giải thích lựa chọn bằng lý lẽ. Suy nghĩ độc lập không có nghĩa là luôn phản đối số đông; nếu bằng chứng cho thấy mình chưa đúng, sẵn sàng thay đổi cũng là một điểm mạnh.";
  }
  if (answers[6] === "Hùa theo nhóm") {
    adviceText.textContent += " Khi thấy một nhóm cùng chê bai ai đó, hãy tránh hùa theo khi chưa hiểu sự việc. Nếu an toàn, bạn có thể chuyển chủ đề hoặc tìm người lớn đáng tin cậy để hỗ trợ.";
  }
  if (answers[9] === "Hiếm khi được tôn trọng") {
    adviceText.textContent += " Nếu bạn thường cảm thấy ý kiến của mình không được tôn trọng, hãy thử trao đổi với giáo viên hoặc người lớn đáng tin để tìm cách chia sẻ an toàn hơn.";
  }
  if (answers[10] === "Kết hợp nhiều giải pháp") {
    adviceText.textContent += " Bạn cũng có thể góp phần tạo thay đổi bằng cách khuyến khích lớp học lắng nghe nhau, kiểm chứng thông tin và không chế giễu người có quan điểm khác.";
  }
}
form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateGroup()) return;
  if (answeredCount() !== totalQuestions) {
    errorBox.textContent = "Bạn hãy hoàn thành cả 10 câu hỏi trước khi xem lời khuyên.";
    errorBox.hidden = false;
    return;
  }
  makeSummary();
  makeAdvice();
  form.hidden = true;
  sidebar.hidden = true;
  resultPanel.hidden = false;
  progressPercent.textContent = "100%";
  progressCount.textContent = "10/10 câu";
  progressBar.style.width = "100%";
  steps.forEach(step => step.classList.add("done"));
  resultPanel.scrollIntoView({behavior:"smooth", block:"start"});
});
restartButton.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  sidebar.hidden = false;
  resultPanel.hidden = true;
  showGroup(0);
  scrollToPanel();
});
menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
navMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
showGroup(0);
updateProgress();
