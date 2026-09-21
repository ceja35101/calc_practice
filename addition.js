const mode = document.getElementById("addition-mode")
const nextButton = document.getElementById("button")
const number = document.getElementById("current-number")
const label = document.getElementById("number-label")
const remaining = document.getElementById("remaining")
const calculation = document.getElementById("calculation")
const calculationText = document.getElementById("calculation-text")
const toggle = document.getElementById("calculation-toggle")
let numbers = []
let shown = 0
let finished = false

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
  number.textContent = "?"
  label.textContent = "準備完了"
  remaining.textContent = "残り20個"
  nextButton.textContent = "開始する"
  calculationText.textContent = "まだ数字を表示していません。"
}

nextButton.addEventListener("click", () => {
  if (finished) reset()
  if (!numbers.length) numbers = createNumbers(mode.value === "repeat")
  if (shown < numbers.length) {
    number.textContent = numbers[shown]
    shown++
    label.textContent = shown + "個目の数字"
    remaining.textContent = "残り" + (numbers.length - shown) + "個"
    const displayed = numbers.slice(0, shown)
    let total = 0
    calculationText.textContent = displayed.map((value, index) => {
      const previous = total
      total += value
      return `${index + 1}回目：${previous} + ${value} = ${total}`
    }).join("\n")
    nextButton.textContent = shown === numbers.length ? "合計を見る" : "次の数字へ"
  } else {
    number.textContent = numbers.reduce((sum, value) => sum + value, 0)
    label.textContent = "20個の数字の合計"
    nextButton.textContent = "もう一度始める"
    finished = true
  }
})

toggle.addEventListener("click", () => {
  calculation.hidden = !calculation.hidden
  toggle.setAttribute("aria-expanded", String(!calculation.hidden))
  toggle.textContent = calculation.hidden ? "途中の計算を表示" : "途中の計算を非表示"
})

mode.addEventListener("change", reset)
