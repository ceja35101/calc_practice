const storageKey = "multiplication-practice-history-v1"
const input = document.getElementById("answer-input")
const button = document.getElementById("button")
const result = document.getElementById("result")
const storageStatus = document.getElementById("storage-status")
let aint, bint, startedAt
let answered = false
let history = []

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]")
  if (!Array.isArray(saved) || !saved.every(row =>
    row && Number.isInteger(row.a) && row.a >= 11 && row.a <= 19 &&
    Number.isInteger(row.b) && row.b >= 11 && row.b <= 19 &&
    Number.isSafeInteger(row.response) && row.response >= 0 &&
    Number.isFinite(row.seconds) && row.seconds >= 0 &&
    typeof row.date === "string" && Number.isFinite(Date.parse(row.date))
  )) throw new Error("Invalid history")
  history = saved.slice(0, 500)
} catch {
  storageStatus.textContent = "保存済みの履歴を読み込めませんでした。"
}

function renderHistory() {
  const body = document.getElementById("history-body")
  if (!body) return
  body.replaceChildren()
  let correctCount = 0
  let totalSeconds = 0
  for (const row of history) {
    const correct = row.response === row.a * row.b
    if (correct) correctCount++
    totalSeconds += row.seconds
    const tr = document.createElement("tr")
    for (const value of [new Date(row.date).toLocaleString("ja-JP"),
      row.a + " × " + row.b, row.response, row.a * row.b,
      correct ? "正解" : "不正解", row.seconds.toFixed(2) + "秒"]) {
      const td = document.createElement("td")
      td.textContent = value
      tr.appendChild(td)
    }
    body.appendChild(tr)
  }
  document.getElementById("summary").textContent = history.length
    ? history.length + "問中" + correctCount + "問正解 ・ 正答率" +
      Math.round(correctCount / history.length * 100) + "% ・ 平均" +
      (totalSeconds / history.length).toFixed(2) + "秒"
    : "まだ回答の記録はありません。"
}

function showQuestion(focusInput = false) {
  aint = Math.floor(Math.random() * 9 + 11)
  bint = Math.floor(Math.random() * 9 + 11)
  document.getElementById("expression").textContent = aint + " × " + bint
  document.getElementById("answer").textContent = ""
  input.value = ""
  input.disabled = false
  input.removeAttribute("aria-invalid")
  result.textContent = ""
  result.removeAttribute("data-correct")
  button.textContent = "回答する"
  answered = false
  startedAt = performance.now()
  if (focusInput) input.focus()
}

document.getElementById("answer-form")?.addEventListener("submit", event => {
  event.preventDefault()
  if (answered) {
    showQuestion(true)
    return
  }
  const value = input.value.trim().replace(/[０-９]/g, char =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0))
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
    result.textContent = "答えを0以上の整数で入力してください。"
    input.setAttribute("aria-invalid", "true")
    input.focus()
    return
  }
  const seconds = (performance.now() - startedAt) / 1000
  const response = Number(value)
  const correct = response === aint * bint
  answered = true
  input.removeAttribute("aria-invalid")
  input.disabled = true
  document.getElementById("answer").textContent = "= " + aint * bint
  result.textContent = (correct ? "正解！" : "不正解") + " 回答時間：" + seconds.toFixed(2) + "秒"
  result.dataset.correct = String(correct)
  button.textContent = "次の問題へ"
  history.unshift({ a: aint, b: bint, response, seconds, date: new Date().toISOString() })
  history = history.slice(0, 500)
  try {
    localStorage.setItem(storageKey, JSON.stringify(history))
    storageStatus.textContent = ""
  } catch {
    storageStatus.textContent = "履歴を保存できません。このページを閉じると今回の記録は失われます。"
  }
  renderHistory()
  button.focus()
})

document.getElementById("history-reset")?.addEventListener("click", () => {
  if (!window.confirm("このブラウザの回答履歴をすべて削除します。よろしいですか？")) return
  const resetStatus = document.getElementById("reset-status")
  try {
    localStorage.removeItem(storageKey)
  } catch {
    resetStatus.textContent = "履歴を削除できませんでした。ブラウザの保存設定を確認してください。"
    return
  }
  history = []
  renderHistory()
  storageStatus.textContent = ""
  resetStatus.textContent = "履歴をリセットしました。"
})

renderHistory()
if (input) showQuestion()

// 戻る操作で古い履歴や計測開始時刻を復元しないようにする。
window.addEventListener("pageshow", event => {
  if (event.persisted) window.location.reload()
})
