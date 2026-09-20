//let random_a = Math.random() * 9 + 11
//let random_b = Math.random() * 9 + 11
let aint
let bint
let answer
let showingAnswer = false

function showQuestion() {
  aint = Math.floor(Math.random() * 9 + 11)
  bint = Math.floor(Math.random() * 9 + 11)  
  answer = aint * bint
  document.getElementById("expression").textContent = aint + " × " + bint
  document.getElementById("answer").textContent = ""
  document.getElementById("button").textContent = "答えを見る"
}

function buttonClick() {
  if (showingAnswer === false) {
  document.getElementById("answer").textContent = "= " + answer
  document.getElementById("button").textContent = "次の問題へ"
  showingAnswer = true
}
else{
  showQuestion()
  showingAnswer = false
  }
}
showQuestion()
let button = document.getElementById("button")
button.addEventListener("click",buttonClick);
