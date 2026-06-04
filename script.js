let randomNumber = parseInt(Math.random() * 100 + 1);
const inpuNumber = document.querySelector("#inputnumber");
const submit = document.querySelector("#subt");
const prev = [];
let remaningguess = 10;
const form=document.querySelector(".form")
const prevguess = document.querySelector(".prevguess");
const remguess = document.querySelector(".remainingguess");
const result = document.querySelector(".horl")
let playgame = true;
if (playgame) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        validate(parseInt(inpuNumber.value));//as .value return a string
    })
}
function validate(number) {
    if (isNaN(number)) {
        alert("Please enter a number");
    }
    else if (number > 100 || number < 1) {
        alert("Please enter a number between 1 and 100")
    }
    else {

        displayguess(number)
        checkinput(number)
    }
}
function displayguess(number) {
prev.push(number);
// prevguess.innerHTML=`${prev}` betterversion is down below
prevguess.textContent = prev.join(", ");
remaningguess--;
   remguess.textContent=remaningguess;
   // now clearing the input box
   inpuNumber.value="";     
}
function checkinput(number) {
    if (number === randomNumber) {
        displaymessage(`you guess correct the random number is ${randomNumber}`);
        endgame();
        return;
    }
    else {
        if (number > randomNumber) {
            displaymessage(`your guess is too high`);
        }
        else {
            displaymessage(`your guess is too low`)
        }
        
        
        
    }
    if(remaningguess===0){
        
          displaymessage(`Game Over! The number was ${randomNumber}`);
          endgame();
    }
}

function displaymessage(message) {
    result.textContent=`${message}`
}
function endgame(){
    if(document.querySelector("#new_game")){
    return;
}
    playgame=false;
    inpuNumber.disabled=true;
    submit.disabled=true;
    const button=document.createElement("button");
    button.id="new_game";
    button.textContent="New Game";
    document.querySelector(".result").appendChild(button)
    button.addEventListener("click", function(){
        newgame();
    });

}
function newgame(){
    playgame=true ;
    inpuNumber.disabled=false;
    submit.disabled=false;
    inpuNumber.value="";
    prevguess.textContent="";
    result.textContent="";
    remguess.textContent=10;
    prev.length=0;
    remaningguess=10;
    randomNumber = parseInt(Math.random() * 100 + 1);
   document.querySelector("#new_game").remove();
}