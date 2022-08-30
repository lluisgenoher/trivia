const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const counterCorrectText = document.getElementById("counterCorrect");
const MAX_QUESTIONS = 10;

let token = null;
let currentQuestion = {};
let acceptingAnswers = false;
let correctQuestions = 0;
let counterQuestions = 0;
let availableQuestions = [];
let previousAnswer = null;
let nameCategory = null;
let idCategory = null;

let questions = [];


function getCategories() {
    fetch('https://opentdb.com/api_category.php')
        .then(response => {
            return response.json();
        })
        .then(data => {

            const options = data.trivia_categories.map(category => {
                return `<option> ${category.name} </option>`;
            });

            document.querySelector("#category").insertAdjacentHTML("afterbegin", options);
        }).catch(error => {
            console.log(error)
        });
}

$('.play-btn').click(function() {
    var selected = $('#category option:selected');
    nameCategory = selected.html();
})

function getIdCategory(){
    fetch('https://opentdb.com/api_category.php')
    .then(response => {
        return response.json();
    })
    .then(data => {
        data.trivia_categories.map(category => {
            
          if(nameCategory.trim() === category.name.trim()){
              idCategory = category.id;
              
          }
        })
    }).catch(error => {
        console.log(error);
    });
}
function hideHome() {
    var home = document.getElementById("home");
    var questionBox = document.getElementById("box_question");
    if (questionBox.style.display == "none") {
        home.style.display = "none";
        questionBox.style.display = "block";
    }
    getToken();
    getIdCategory();
    getQuestions();
}

function startGame() {
    counterQuestions = 0;
    correctQuestions = 0;
    counterCorrectText.innerText = `${correctQuestions}/${counterQuestions}`;
    availableQuestions = [...questions];
    getNewQuestion();
}

function getNewQuestion() {
    hideNextButton();
    if (availableQuestions.length === 0 || counterQuestions >= MAX_QUESTIONS) {
            getQuestions();
            return false;
    }
    counterQuestions++;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
  
    question.innerText = currentQuestion.question.replace(/(&quot\;)/g,"\"").replace(/(&#039\;)/g,"\'");

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number].replace(/(&quot\;)/g,"\"").replace(/(&#039\;)/g,"\'");;
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

function getToken(){
    fetch('https://opentdb.com/api_token.php?command=request')
    .then(response => {
        return response.json();
    })
    .then(data => {
        if(token === null){
            token = data.token;
        }
       
    }).catch(error => {
        console.log(error);
    });
 
}
function getQuestions() {  
   
    fetch('https://opentdb.com/api.php?amount='+MAX_QUESTIONS+'&category='+idCategory+'&type=multiple&token='+token)
        .then(response => {
            return response.json();
        })
        .then(loadedQuestions => {
            if(loadedQuestions.response_code!=0){
                getToken();
                getQuestions(); //Call again
                return false;
            }
            console.log(loadedQuestions)
            questions = loadedQuestions.results.map(loadedQuestion => {
                const formatedQuestion = {
                   
                    question: loadedQuestion.question
                };
   
                const answerChoices = [...loadedQuestion.incorrect_answers];
                formatedQuestion.answer = Math.floor(Math.random() * 4) + 1;
                answerChoices.splice(formatedQuestion.answer - 1, 0, loadedQuestion.correct_answer);

                answerChoices.forEach((choice, index) => {
                    formatedQuestion['choice' + (index + 1)] = choice;
                })

                return formatedQuestion;
            });

            startGame();
        }).catch(error => {
            console.log(error);
        });
}
choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
      
        previousAnswer =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        selectedChoice.parentElement.classList.add(previousAnswer);

        setTimeout(() => {

            if (previousAnswer === 'correct') correctQuestions++;

            counterCorrectText.innerText = `${correctQuestions}/${counterQuestions}`;
            
            showNextButton();

        }, 500);
    });
});

function hideNextButton() {
  
    if (previousAnswer === 'correct'){
        document.querySelectorAll('.correct').forEach(e => e.classList.remove('correct'));
    }
    else{
        document.querySelectorAll('.incorrect').forEach(e => e.classList.remove('incorrect'));
    }  
        
    document.getElementById("next_btn").style.display = "none";
}

function showNextButton() {
    document.getElementById("next_btn").style.display = "block"
}
getCategories()
