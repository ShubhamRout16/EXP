window.onload = () => {
  loadSavedTransactions();
  autoPayCountdown();
}
// feat: just calculates balance and returns it
function balance(){
  let income = 0
  let expenses = 0

  transactions.forEach(obj => {
    if(obj.type === 'income'){
      income += Number(obj.amount)
    }else{
      expenses += Number(obj.amount)
    }
  })

  let balance = income - expenses;
  return balance;
}

// feat: tab switching functionality {done}
// click on the tab to show its respective page content


// all tabs
const transaction = document.getElementById('transactions')
const analytics = document.getElementById('analytics')
const autopay = document.getElementById('autopay')
const history = document.getElementById('history')
function showTab(tabName){
  // removed active class from all the buttons
  const tabsBtn = document.querySelectorAll('.tab-trigger')
  tabsBtn.forEach(btn => {
    return btn.classList.remove('active')
  });
  // remove the active class from all the tabcontent
  transaction.classList.remove('active')
  analytics.classList.remove('active')
  autopay.classList.remove('active')
  history.classList.remove('active')
  // adding active class to the button name clicked tab btn
  const chosenElementBtn = document.getElementById(`${tabName}-btn`)
  const chosenElement = document.getElementById(tabName)
  chosenElementBtn.classList.add('active')
  // adding active class to the clicked button tab content
  chosenElement.classList.add('active')
}

// feat: Adding transactions manually
// here's what this feature will do
// when we fill the add transactions form and click on add transaction button
// capture everything from form
// create a transaction object and store in array
// update the recent transaction lists
// update the dashboard cards

// first defining the demo transaction object
/*
{
  id: 1,
  type: "income" or "expense",
  category: (from lists above),
  amount: number,
  date: "yyyy-mm-dd",
  description: optional text
}
*/

let transactions = [];
let currentId ;
function addTransaction(event){
  event.preventDefault();
  // all the input data from the form
  const formData = new FormData(event.target);
  // converting into the object
  const dataObject = Object.fromEntries(formData.entries());
  console.log(dataObject);

  // for autopay feat
  const autoPayCheckBox = document.getElementById('checkautopay')
  const myScheduledTime = document.getElementById('scheduledtime')
  if(dataObject.amount > 0 && dataObject.category !== '' && dataObject.date !== ''){
    let transactionObject = {
      id: Date.now(),
      type: dataObject.transactionType,
      category: dataObject.category,
      amount: dataObject.amount,
      date: dataObject.date,
      description: dataObject.description,
    }
    if(autoPayCheckBox.checked){
      transactionObject.status = 'pending'
      transactionObject.scheduledTime = myScheduledTime.value
    }
    else{
      transactionObject.status = 'done'
      transactionObject.scheduledTime = null
    }
    currentId = transactionObject.id;
    transactions.push(transactionObject);
  }
  console.log(transactions);
  // saving changes to localStorage
  saveChangesToLocalStorage();

  // call renderTransaction to update any changes made
  renderTransactions();

  // form reference to reset the form after every submit
  const myForm = document.querySelector('.transaction-form-content')
  myForm.reset();

  // update the dashboard cards after every addition
  updateDashboardCards();

  renderAutopayTransactions();
}

// feat: to remove the added transaction from the recent transactions
// here's what this feature will do
// it will capture the element which is  used to call this function
// and then create a new array without that element
// then render the transactions object

function deleteTransaction(id){
  transactions = transactions.filter(obj => obj.id !== id)
  // saving to localStorage
  saveChangesToLocalStorage();
  // rendering the transactions list
  renderTransactions();
  // update the dashboard cards after every deletion
  updateDashboardCards();
  renderAutopayTransactions();
}

// feat: render the recent transactions list to show any changes made in the previous transactions list
// here's what this feature will do
// clears the recent transactions container
// loops through the new transactions array -> if any changes is made
// creates a new div element for every object in the transactions array
// appends the new div to contianer 

function renderTransactions(){
  const transactionsContainer = document.getElementById('transactions-list')
  // clearing the transactions container
  transactionsContainer.innerHTML = ''
  // if there is no object in the transaction array then show the default text
  if(transactions.length === 0){
   transactionsContainer.innerHTML = `
    <div class="no-transactions-message">
     <p>No Transactions found</p>
    </div>
   `
   return;
  }
  transactions.forEach(obj => {
   const indiTransactionDiv = document.createElement('div')
   indiTransactionDiv.className = 'transaction-card fade-in'
   indiTransactionDiv.id = `transaction-${obj.id}`
   indiTransactionDiv.innerHTML = `
    <div class="transaction-card-left">
     <span class="transaction-type-badge ${obj.type.toLowerCase()}">
      ${obj.type}
     </span>
     <div class="transaction-details">
      <h3 class="transaction-category">${obj.category}</h3>
      <div class="transaction-meta">
       <span class="transaction-date">${obj.date}</span>
       <div class="meta-separator"></div>
       <span class="transaction-status ${obj.status.toLowerCase()}">${obj.status}</span>
      </div>
      ${
       obj.status === "pending"
       ? `<div class="countdown-timer">⏳ calculating...</div>`
       : ""
      }
     </div>
    </div>
    <div class="transaction-card-right">
     <span class="transaction-amount ${obj.type.toLowerCase()}">
      ${obj.type.toLowerCase() === 'expense' ? '-' : '+'}₹${obj.amount}
     </span>
     <button class="transaction-delete-btn" onclick="deleteTransaction(${obj.id})">
      Delete
     </button>
    </div>
   `
   transactionsContainer.appendChild(indiTransactionDiv);
  })
 }

// feat: adding autopay functionality
// here's what this feature will do we will create autopay transaction 
// and add the transaction to the recent transactions with status pending and scheduled timer countdown
// once timer reaches its countdown then status changes to done and some animations for better ux

function autoPayCountdown(){
  setInterval(() => {
   const nowTime = Date.now()
   transactions.forEach(obj => {
    if(obj.status === 'pending' && obj.scheduledTime !== null){
     const scheduledTimeStamp = new Date(obj.scheduledTime).getTime();
     if(nowTime >= scheduledTimeStamp){
      obj.status = 'done'
      saveChangesToLocalStorage()
      renderTransactions()
      updateDashboardCards()
      renderAutopayTransactions()
      // highlight the changed transaction
      const changedCard = document.getElementById(`transaction-${obj.id}`);
      if (changedCard) {
        changedCard.classList.add('status-done-animate');
        setTimeout(() => {
          changedCard.classList.remove('status-done-animate');
        }, 1500);
      }
     }else{
      const timeDiff = scheduledTimeStamp - nowTime
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      const transactionCard = document.getElementById(`transaction-${obj.id}`);
      if (transactionCard) {
       const countdownEl = transactionCard.querySelector('.countdown-timer');
       if (countdownEl) {
        countdownEl.textContent = `⏳ ${hours}h ${mins}m ${seconds}s left`;
       }
      }
     }
    }
   })
  }, 1000)
 }



// feat: update dashboard cards
// here's what this code will do
// everytime a transaction is added or deleted calculate the values are update in the dasjboard cards
// and call this function everytime adding transactions or deleting it

function updateDashboardCards(){
  // calculate the values for the dashboard cards
  let income = 0
  let expenses = 0

  transactions.forEach(obj => {
    if(obj.type === 'income'){
      income += Number(obj.amount)
    }else{
      expenses += Number(obj.amount)
    }
  })

  let balance = income - expenses;

  document.querySelector('.summary-card[data-type="balance"] .summary-card-value').textContent = `₹${balance.toFixed(2)}`
  document.querySelector('.summary-card[data-type="income"] .summary-card-value').textContent = `₹${income.toFixed(2)}`
  document.querySelector('.summary-card[data-type="expenses"] .summary-card-value').textContent = `₹${expenses.toFixed(2)}`
  document.querySelector('.summary-card[data-type="transactions"] .summary-card-value').textContent = transactions.length
}


// feat: persist the previous data in the browser through LocalStorage
// here's how this feature will work
// everytime we make changes in the transacations array we will call a function 
// which stores the changes made and when page loads the changes previously made will be still their

function saveChangesToLocalStorage(){
  // converted transactions array to JSON and stored it
  localStorage.setItem('savedTransactions', JSON.stringify(transactions))
}

// this function checks if there is any previously saved array and loads it
function loadSavedTransactions(){
  const getSavedTransactions = JSON.parse(localStorage.getItem('savedTransactions'))
  if(getSavedTransactions){
    transactions = getSavedTransactions
    renderTransactions();
    updateDashboardCards(); // bug happening cause of this
    // bug: updateDashboard doesnt persists -> will solve after voice commands
    // lets analyze why this is happening
    // we are saving the transactions inside the local storage and when page loads we are calling the saved history
    // then inisde savedlocalstorage we are rendering the msg changes 
    // and also render the dashboards cards count by calling updateDashboardcards
  }
}

// feat: voice command functionality
// here's what this feature will do
/*
“add income of 10000 for savings” → adds a transaction

“add expense of 500 for food” → adds a transaction

“delete transaction number 3” → deletes

“what’s my balance” → reads current balance aloud

“show my autopay reminders” → switches tab or speaks reminders
*/

function startListening(){
  // later usage to execute commands
  let type = ''
  let amount = 0
  let category = ''
  const today = new Date();
  let toBeDeleted = 0;
  // this part shows what we are speaking is understood by browser
  const showTranscript = document.getElementById('transcript')
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  
  recognition.onresult = (e) => {
    transcript = e.results[0][0].transcript;
    showTranscript.innerHTML = `
    <p>${transcript}</p>
    `
    console.log(`user says : ${transcript}`);

    // parse commands
    if(transcript.includes('add income') || transcript.includes('add expense')){
      const parts = transcript.toLowerCase().split(' '); // returns array
      // extract type , amount and category from the parts
      parts.forEach((words , index) => {
        if(words === 'income' || words === 'expense'){
          type = words;
        }
        else if(!isNaN(words) && words !== ' '){
          amount = Number(words)
        }
        else if(words === 'for'){
          category = parts[index+1] 
        }
      })
      
      let voiceTransactionObj = {
        id: Date.now(),
        type: type,
        category: category,
        amount: amount,
        date: today.toLocaleDateString(),
      }

      transactions.push(voiceTransactionObj)
      saveChangesToLocalStorage();
      renderTransactions();
      updateDashboardCards();
      

      // feedback voice
      const text = 'Transaction Added Successfully !'
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
    else if(transcript.includes('delete')){
      const parts = transcript.toLowerCase().split(' ')
      parts.forEach((findNum , index) => {
        if(findNum === 'number'){
          const objectNo = Number(parts[index+1])
          toBeDeleted = objectNo
          if(!isNaN(objectNo) && objectNo >=1 && objectNo <= transactions.length){
            const deleteElementIndex = transactions[objectNo-1]
            deleteTransaction(deleteElementIndex.id)
          }
          else{
            showTranscript.textContent = 'Transaction number invalid or out of range'
          }
        }
      })

      // feedback voice
      const text = `Deleted Transaction Number ${toBeDeleted}`
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance);
    }
    else if(transcript.includes('speak balance')){
      // to speak balance -> calculate balance
      const utterance = new SpeechSynthesisUtterance(balance())
      window.speechSynthesis.speak(utterance);
    }
    else if(transcript.includes('current balance')){
      const utterance = new SpeechSynthesisUtterance(balance())
      window.speechSynthesis.speak(utterance);
    }
    else if(transcript.includes('switch to')){
      const keywordToTabId = {
        'transactions': 'transactions',
        'autopay': 'autopay',
        'auto pay': 'autopay',
        'history': 'history',
        'analytics': 'analytics'
      };
      
      // to switch tabs -> get tab name
      const parts = transcript.toLowerCase().split(' ')
      const keywords = ['transactions','autopay','history','analytics','auto pay']
      const tabName = keywords.find(tab => parts.includes(tab))
      if(tabName){
        showTab(keywordToTabId[tabName])
      }else {
        showTranscript.textContent = "Couldn't recognize tab name";
      }
    }
  }

  recognition.onerror = (e) => {
    showTranscript.textContent = 'Could not understand, please try again.'
  }

  recognition.start();
}

// feat: speak balance
function speakBalance(){
  const utterance = new SpeechSynthesisUtterance(balance())
  window.speechSynthesis.speak(utterance)
}


// feat: scheduling autopay 
// manual additon done 
// voice additon {pending}
// notification section {pending}
// footer {pending}
// header {pending}
// add the copy of autopay to autopay tab {pending}


function renderAutopayTransactions(){
  // clears the autopayList container
  const autopayContainer = document.getElementById('autopay-list')
  autopayContainer.innerHTML = ''
  transactions.forEach(obj => {
    if(obj.scheduledTime !== null && obj.status === 'pending'){
      const indiTransactionDiv = document.createElement('div')
      indiTransactionDiv.className = 'transaction-card fade-in'
      indiTransactionDiv.id = `transaction-${obj.id}`
      indiTransactionDiv.innerHTML = `
      <div class="transaction-card-left">
     <span class="transaction-type-badge ${obj.type.toLowerCase()}">
      ${obj.type}
     </span>
     <div class="transaction-details">
      <h3 class="transaction-category">${obj.category}</h3>
      <div class="transaction-meta">
       <span class="transaction-date">${obj.date}</span>
       <div class="meta-separator"></div>
       <span class="transaction-status ${obj.status.toLowerCase()}">${obj.status}</span>
      </div>
      ${
       obj.status === "pending"
       ? `<div class="countdown-timer">⏳ calculating...</div>`
       : ""
      }
     </div>
    </div>
    <div class="transaction-card-right">
     <span class="transaction-amount ${obj.type.toLowerCase()}">
      ${obj.type.toLowerCase() === 'expense' ? '-' : '+'}₹${obj.amount}
     </span>
     <button class="transaction-delete-btn" onclick="deleteTransaction(${obj.id})">
      Delete
     </button>
    </div>
   `
   autopayContainer.appendChild(indiTransactionDiv);
    }
  })
}
