console.clear();

// VARIABLES: Start your engines!

const optionsForm = document.querySelector(".options");
const textarea = document.querySelector("textarea");
const wordCountEl = document.querySelector("#info-word_count");
const charCountEl = document.querySelector("#info-char_count");
const workCountNum = document.querySelector("#word_count");
const charCountNum = document.querySelector("#char_count");
const readingTimeEl = document.querySelector("#reading-time");
const loadingEl = document.querySelector(".loading");
const toxicBtn = document.querySelector("#toxic");
const enableToxic = document.querySelector("#enable_toxicity");
let model;
let charCount = 0;
let wordCount = 0;
let words = 0;
let isToxicEnabled = false;
let isToxicLoaded = false;
let threshold = 0.25;

// FUNCTIONS: Set up our tools!

function readingTime( wordCount ) {
  const wordsPerMinute = 200;
  const minutes = wordCount / wordsPerMinute;
  const readTime = Math.ceil(minutes);
  return readTime;
}

function handleOptions(e){
    e.preventDefault();
}

function clearToxicityLabels(){
    document.querySelectorAll(".cat").forEach( cat =>{
      cat.style.background = "lightgray";
    });
}

function handleTextInput(e){
  if ( isToxicEnabled ){ clearToxicityLabels(); }
  const content = e.target.value;
  charCount     = content.length;
  words         = content.split(/\s/g); // split(" ");
  wordCount     = words.length;
  wordCountEl.textContent = wordCount;
  charCountEl.textContent = charCount;
  const workCountVal = parseInt( workCountNum.value);
  const charCountVal = parseInt( charCountNum.value );
  if ( workCountVal && ( workCountVal <= wordCount ) ){
    textarea.setAttribute("disabled",true);
  }
  if ( charCountVal && ( charCountVal <= charCount ) ){
    textarea.setAttribute("disabled",true);
  }
  readingTimeEl.textContent = readingTime( wordCount );
}

async function enableToxicityCheck(){

  toxicBtn.toggleAttribute("disabled");

  clearToxicityLabels();
  
  if ( isToxicLoaded ){ 
    isToxicEnabled = !isToxicEnabled;
    return; 
  }
  
  // TODO: Dynamically load tf.min.js + toxicity, and wait for loading...

  const labelsToInclude = ['identity_attack', 'insult', 'threat', 'toxicity', 'severe_toxicity', 'sexual_explicit', 'obscene' ];
  loadingEl.style.opacity = 1;
  
  model = await toxicity.load( threshold, labelsToInclude);
  console.log("Toxicity Model Loaded...");
  loadingEl.style.opacity = 0;
  isToxicEnabled = true;
  isToxicLoaded = true;

} // TFJS

async function checkToxicity(){

  console.log("Checking toxicity...");

  if ( !isToxicEnabled || !isToxicLoaded ){ return; }
  
  toxicBtn.classList.add("checking");
  
  console.log([textarea.value]);
  
  const predictions = await model.classify([textarea.value]);
  
  toxicBtn.classList.remove("checking");
  
  // Our predictions are ready, so let's loop over them and display them:
  predictions.forEach( prediction => {
    if ( prediction.results[0].match ){
      const probability = Math.round(prediction.results[0].probabilities[1] * 100 );
      document.querySelector(`.${prediction.label}`).style.background = `linear-gradient(90deg, hotpink ${probability}%, lightgray ${100-probability}%)`;
    }
  })
  

} // TFJS

function enableTextarea(){
  textarea.removeAttribute("disabled");
}

// EVENT HANDLERS: Start the action!

optionsForm.addEventListener( "submit", handleOptions );
textarea.addEventListener( "input", handleTextInput );
enableToxic.addEventListener( "click", enableToxicityCheck );
workCountNum.addEventListener( "input", enableTextarea);
charCountNum.addEventListener( "input", enableTextarea );
toxicBtn.addEventListener( "click", checkToxicity ); // TFJS