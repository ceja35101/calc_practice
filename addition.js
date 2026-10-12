const mode = document.getElementById("addition-mode")
const nextButton = document.getElementById("button")
const number = document.getElementById("current-number")
const label = document.getElementById("number-label")
const remaining = document.getElementById("remaining")
const calculation = document.getElementById("calculation")
const calculationText = document.getElementById("calculation-text")
const toggle = document.getElementById("calculation-toggle")
const subtract = document.body.dataset.operation === "subtract"
const totalForm = document.getElementById("total-form")
const totalInput = document.getElementById("total-input")
const totalResult = document.getElementById("total-result")
const dailyKey = subtract ? "subtraction-daily-v1" : "addition-daily-v1"
const day = () => {
  const date = new Date()
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
let daily
function loadDaily() {
  daily = { day: day(), correct: 0, completed: 0 }
  try {
    const saved = JSON.parse(localStorage.getItem(dailyKey))
    if (saved && saved.day === day() && Number.isSafeInteger(saved.completed) &&
        Number.isSafeInteger(saved.correct) && saved.correct >= 0 && saved.completed >= saved.correct) daily = saved
  } catch {
    document.getElementById("save-status").textContent = "当日の記録を読み込めませんでした。"
  }
}
function renderDaily() {
  document.getElementById("daily-progress").textContent = `今日：${daily.correct}問正解 / ${daily.completed + (finished ? 0 : 1)}問目`
}
function checkDay() {
  if (daily.day === day()) return false
  loadDaily()
  reset()
  return true
}
let numbers = []
let shown = 0
let finished = false
const missingNumberMode = () => !subtract && mode.value !== "repeat"
const displayCount = () => missingNumberMode() ? 19 : 20

function createNumbers(withRepeats) {
  if (withRepeats) return Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 1)
  const values = Array.from({ length: 20 }, (_, index) => index + 1)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values
}

function reset() {
  numbers = []
  shown = 0
  finished = false
  number.textContent = subtract ? "210" : "?"
  label.textContent = "準備完了"
  remaining.textContent = "残り20個"
  nextButton.textContent = "開始する"
  nextButton.hidden = false
  totalForm.hidden = true
  totalInput.value = ""
  totalResult.textContent = ""
  renderDaily()
  calculationText.textContent = "まだ数字を表示していません。"
  if (!subtract) {
    document.getElementById("addition-guide").textContent = missingNumberMode()
      ? "19個の数字を足し、210との差から最後の数字を当ててください。"
      : "20個の数字を足し、最後に合計を入力してください。"
    document.querySelector('label[for="total-input"]').textContent = missingNumberMode() ? "最後の数字（1〜20）" : "最後の合計"
  }
}

nextButton.addEventListener("click", () => {
  if (checkDay()) return
  if (finished) reset()
  if (!numbers.length) numbers = createNumbers(!subtract && mode.value === "repeat")
  if (shown < displayCount()) {
    number.textContent = numbers[shown]
    shown++
    label.textContent = shown + "個目の数字"
    remaining.textContent = "残り" + (numbers.length - shown) + "個"
    const displayed = numbers.slice(0, shown)
    let total = subtract ? 210 : 0
    calculationText.textContent = displayed.map((value, index) => {
      const previous = total
      total += subtract ? -value : value
      return `${index + 1}回目：${previous} ${subtract ? "−" : "+"} ${value} = ${total}`
    }).join("\n")
    nextButton.textContent = "次の数字へ"
    if (shown === displayCount()) {
      nextButton.hidden = true
      totalForm.hidden = false
      totalInput.focus()
    }
  }
})

toggle.addEventListener("click", () => {
  calculation.hidden = !calculation.hidden
  toggle.setAttribute("aria-expanded", String(!calculation.hidden))
  toggle.textContent = calculation.hidden ? "途中の計算を表示" : "途中の計算を非表示"
})

mode?.addEventListener("change", reset)
totalForm.addEventListener("submit", event => {
  event.preventDefault()
  if (checkDay() || finished || shown !== displayCount()) return
  const value = totalInput.value.trim().replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
    totalResult.textContent = "答えを0以上の整数で入力してください。"
    return
  }
  const sum = numbers.reduce((a, b) => a + b, 0)
  const answer = missingNumberMode() ? numbers[19] : subtract ? 210 - sum : sum
  const correct = Number(value) === answer
  finished = true
  daily.completed++
  if (correct) daily.correct++
  renderDaily()
  try {
    localStorage.setItem(dailyKey, JSON.stringify(daily))
    document.getElementById("save-status").textContent = ""
  } catch {
    document.getElementById("save-status").textContent = "当日の記録を保存できませんでした。"
  }
  number.textContent = answer
  remaining.textContent = "残り0個"
  label.textContent = "最後の答え"
  totalResult.textContent = correct ? "正解！" : `不正解。正解は${answer}です。`
  totalForm.hidden = true
  nextButton.hidden = false
  nextButton.textContent = "もう一度始める"
  nextButton.focus()
})
loadDaily()
reset()
setInterval(checkDay, 1000)
document.addEventListener("visibilitychange", checkDay)
window.addEventListener("pageshow", event => {
  if (event.persisted) window.location.reload()
})
