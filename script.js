window.onload = () => {
  loadSavedTransactions();
  loadSavedHistory(); // load saved history -> for persistance
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
  if(tabName === 'analytics'){
    renderCharts();
  }

  // whenever user switches to history tab renders the history
  if(tabName === 'history'){
    renderHistory();
  }
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
// for history tab implementation
let History = [];
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
    // to update history 
    console.log(transactionObject);
    
    History.push({
      ...transactionObject,
      deleted: false
    })
    console.log(History)
    saveHistoryToLocalStorage();
  }
  // console.log(transactions);
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

  renderCharts();

}

// function to save history to the local storage
function saveHistoryToLocalStorage(){
  localStorage.setItem('savedHistory',JSON.stringify(History))
}

// function to load saved history
function loadSavedHistory(){
  const savedHistory = JSON.parse(localStorage.getItem('savedHistory')) || []
  if(savedHistory){
    History = savedHistory;
  }
}

// feat: to remove the added transaction from the recent transactions
// here's what this feature will do
// it will capture the element which is  used to call this function
// and then create a new array without that element
// then render the transactions object

function deleteTransaction(id){
  transactions = transactions.filter(obj => obj.id !== id)

  // to mark the deleted transactions in the history as deleted
  const transactionHistory = History.find(obj => obj.id === id && !obj.deleted)
  if(transactionHistory){
    transactionHistory.deleted = true
    saveHistoryToLocalStorage();
  }

  // saving to localStorage
  saveChangesToLocalStorage();
  // rendering the transactions list
  renderTransactions();
  // update the dashboard cards after every deletion
  updateDashboardCards();
  renderAutopayTransactions();

  renderCharts();

}

// renderHistory() to show the history tab
// 1 -> show all transactions 
// 2 -> reverse order 
// 3 -> remove delete buttons
// 4 -> show deleted tag for deleted items

function renderHistory(){
  const historyContainer = document.getElementById('history')

  // Clear previous content
  historyContainer.innerHTML = `
    <div class="tab-placeholder">
      <h3>Transaction History</h3>
      <p>View all your past transactions and export data</p>
      <div class="history-filters">
        <button class="filter-button" id="filter30d">Last 30 Days</button>
        <button class="filter-button" id="filter3m">Last 3 Months</button>
        <button class="filter-button" id="filter1y">Last Year</button>
        <button class="filter-button" id="filterCsv">Export CSV</button>
      </div>
      <div id="history-list" class="history-list"></div>
    </div>
  `;

  const historyList = historyContainer.querySelector('#history-list')

  if(History.length === 0){
    historyList.innerHTML = `
      <div class="no-transactions-message">
        <p>No transaction history found.</p>
      </div>
    `;
    return;
  }

  // lets add reverse chronological order
  const reversedHistory = [...History].sort((a,b) => b.id - a.id); // sorts the copied array in descending order
  console.log(History);
  
  // console.log(reversedHistory);
  

  reversedHistory.forEach(obj => {
    // FIXED: Add safety checks for undefined properties
    const status = obj.deleted ? 'Deleted' : (obj.status || 'Done');
    const statusClass = obj.deleted ? 'deleted' : (obj.status?.toLowerCase() || 'done');
    
    const item = document.createElement('div')
    item.className = 'transaction-card fade-in';
    item.innerHTML = `
        <div class="transaction-card-left" style="text-align: left;">
            <span class="transaction-type-badge ${obj.type?.toLowerCase() || 'income'}">
            ${obj.type || 'Income'}
            </span>
            <div class="transaction-details" style="text-align: left;">
              <h3 class="transaction-category" style="text-align: left; margin: 0;">${obj.category}</h3>
              <div class="transaction-meta">
              <span class="transaction-date">${obj.date}</span>
              <div class="meta-separator"></div>
            <span class="transaction-status ${obj.deleted ? 'deleted' : obj.status?.toLowerCase() || 'done'}">
              ${obj.deleted ? 'Deleted' : (obj.status || 'Done')}
            </span>
      </div>
    </div>
  </div>
  <div class="transaction-card-right">
    <span class="transaction-amount ${obj.type?.toLowerCase() || 'income'}">
      ${(obj.type?.toLowerCase() || 'income') === 'expense' ? '-' : '+'}₹${obj.amount}
    </span>
  </div>
    `;
    historyList.appendChild(item);
})
}



// feat: render the recent transactions list to show any changes made in the previous transactions list ✅
// here's what this feature will do 
// clears the recent transactions container ✅
// loops through the new transactions array -> if any changes is made ✅
// creates a new div element for every object in the transactions array ✅
// appends the new div to contianer ✅

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
      const scheduledDate = new Date(obj.scheduledTime);
      if (isNaN(scheduledDate.getTime())) {
        // handle invalid
        const transactionCard = document.getElementById(`transaction-${obj.id}`);
        if (transactionCard) {
          const countdownEl = transactionCard.querySelector('.countdown-timer');
          if (countdownEl) {
            countdownEl.textContent = '⏳ Invalid scheduled time';
          }
        }
        return;
      }
      const scheduledTimeStamp = scheduledDate.getTime();
      
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
    renderAutopayTransactions(); // to show the only autopay transactions inside the autopay tab
  }
  renderCharts();

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
  
  // voice commands for autopay features
  // adding a autopay 
  // deleting a autopay
  recognition.onresult = (e) => {
    transcript = e.results[0][0].transcript;
    showTranscript.innerHTML = `
    <p>${transcript}</p>
    `
    console.log(`user says : ${transcript}`);

    // handle voice autopay commands
    if(transcript.toLowerCase().includes('schedule autopay') || transcript.toLowerCase().includes('schedule auto pay')){
      handleVoiceAutoPay(transcript);
    }

    // delete the autopay 
    if(transcript.toLowerCase().includes('cancel auto pay') || transcript.toLowerCase().includes('delete autopay') || transcript.toLowerCase().includes('cancel autopay') || transcript.toLowerCase().includes('delete auto pay') ){
      cancelVoiceAutoPay(transcript);
    }

    // parse commands
    else if(transcript.includes('add income') || transcript.includes('add expense')){
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


// feat: scheduling autopay ✅
// manual additon  ✅
// voice additon {pending} ✅
//  - voice command to add autopay ✅
//  - cancel an autopay ✅
// notification section {pending}
// footer {pending} ✅
// header {pending} ✅
// add the copy of autopay to autopay tab {pending}✅


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
      <div class="transaction-card-left" style="text-align: left;">
     <span class="transaction-type-badge ${obj.type.toLowerCase()}">
      ${obj.type}
     </span>
     <div class="transaction-details" style="text-align: left;">
      <h3 class="transaction-category" style="text-align: left;">${obj.category}</h3>
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


// function to handle voice auto pay functionality
function handleVoiceAutoPay(transcript){
  const showTranscript = document.getElementById('transcript')

  try {
    // parse the voice commands to extract amount category and time
    const parsed = parseAutoPayCommand(transcript)

    if (!parsed.amount || !parsed.category || !parsed.scheduledTime) {
      showTranscript.innerHTML = `<p style="color: red;">Could not parse autopay command. Please try: "Schedule autopay [amount] for [category] on [date] [time]"</p>`;
      return;
    }

    // Create autopay transaction
    const autopayTransaction = {
      id: Date.now(),
      type: 'expense', // Autopay is typically for expenses
      category: parsed.category,
      amount: parsed.amount,
      date: new Date().toISOString().split('T')[0], // Today's date
      description: `Autopay scheduled via voice command`,
      status: 'pending',
      scheduledTime: parsed.scheduledTime
    };

    // Add to transactions array
    transactions.push(autopayTransaction);
    
    // Save and update UI
    saveChangesToLocalStorage();
    renderTransactions();
    updateDashboardCards();
    renderAutopayTransactions();

    // Voice feedback
    const feedbackText = `Autopay scheduled: ${parsed.amount} rupees for ${parsed.category} on ${formatScheduledTime(parsed.scheduledTime)}`;
    const utterance = new SpeechSynthesisUtterance(feedbackText);
    window.speechSynthesis.speak(utterance);

    showTranscript.innerHTML = `<p style="color: green;">✅ ${feedbackText}</p>`;
    
  } catch (error) {
    console.error('Error parsing autopay command:', error);
    showTranscript.innerHTML = `<p style="color: red;">Error scheduling autopay. Please try again.</p>`;
  }
}

// function to parse auto pay commands and return the amount category and time
function parseAutoPayCommand(transcript){
  const words = transcript.toLowerCase().split(' ')

  // to extract the amount from the transcript
  let amount = null;
  words.forEach(word => {
    if(!isNaN(word) && word !== '' && amount === null){
      amount = Number(word)
    }
  })

  // to extract the category 
  let category = null;
  words.forEach((word,index) => {
    if(word === 'for' && words[index+1] && category === null){
      category = words[index+1]
    }
  })


  // extract date and time -> using the function to completely all versions of time
  const scheduledTime = parseDateTime(transcript.toLowerCase())

  return {
    amount,
    category,
    scheduledTime
  }
}

// function to completely extract time -> year , month , date and time
function parseDateTime(transcript){
  const months = {
    'january': 0, 'jan': 0,
    'february': 1, 'feb': 1,
    'march': 2, 'mar': 2,
    'april': 3, 'apr': 3,
    'may': 4,
    'june': 5, 'jun': 5,
    'july': 6, 'jul': 6,
    'august': 7, 'aug': 7,
    'september': 8, 'sep': 8,
    'october': 9, 'oct': 9,
    'november': 10, 'nov': 10,
    'december': 11, 'dec': 11
  }
  const currentYear = new Date().getFullYear();
  let targetDate = new Date();

  // handling today , tommorow and month case
  if(transcript.includes('today')){
    targetDate = new Date();
  }else if(transcript.includes('tomorrow')){
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1)
  }


  // split the transcript to find month and day
  const words = transcript.toLowerCase().split(' ')

  let day = null;
  let month = null;

  words.forEach(word => {
    // cleaning the transcript and removing words like 1st , 2nd , 3rd , 4th
    const cleanWord = word.replace(/st|nd|rd|th/g, '');

    // check if its day(number)
    if(!isNaN(cleanWord) && cleanWord >= 1 && cleanWord <= 31){ // numbers of day in month
      day = Number(cleanWord)
    }

    // check if its month name
   if(months[cleanWord.toLowerCase()]){
      month = months[cleanWord.toLowerCase()]
    }

   if(day && month !== null){
      targetDate = new Date(currentYear , month , day);

      if(targetDate < new Date()){
        targetDate.setFullYear(currentYear + 1)
      }
    }
  })

  // handling time parsing
  let hour = 12
  let minute = 0

  words.forEach(word => {
    if(word.includes('pm') || word.includes('am')){
      const isPM = word.includes('pm')
      const cleanTime = word.replace('pm','').replace('am','');

      if (cleanTime.includes(':')) {
        // Handle "5:30pm" format
        const timeParts = cleanTime.split(':');
        hour = Number(timeParts[0]);
        minute = Number(timeParts[1]);
      } else {
        // Handle "5pm" format
        hour = Number(cleanTime);
        minute = 0;
      }

      // Convert to 24-hour format
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }

      else if(!isNaN(word) && Number(word) >= 1 && Number(word) <= 24){
        const possibleHour = Number(word)
        if(!transcript.includes('am') && !transcript.includes('pm')){
          hour = possibleHour
        }
      }
      
    }
  })

  targetDate.setHours(hour , minute , 0 , 0)
  return targetDate.toISOString();

}

// NEW: Function to format scheduled time for display
function formatScheduledTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}


// feat : to cancel autopay/ delete it ✅
// why ? -> earlier we made delete transaction command -> 'delete transaction number 1/2/3/4...' 
// but this doesnt works so we have to make a new voice command to cancel autopay 

function cancelVoiceAutoPay(transcript){
  // after cancel autopay user might say
  // by transaction number : 'cancel autopay number 2'
  // by category : 'cancel autopay for transport'
  // we have to extract number or category
  let indexOfTransactions = null
  let category = ''
  let toDeleteItemId = ''
  const words = transcript.toLowerCase().split(' ')


  // cancel autopay by number not working because it traverses through the whole transactions list instead of traversing through only pending lists
  const pendingTransactions = transactions.filter(obj => (obj.status === 'pending' && obj.scheduledTime !== null))

  words.forEach((word,index) => {
    if(word === 'number' || word === 'no'){
      indexOfTransactions = Number(words[index + 1]) - 1;
      if(!isNaN(indexOfTransactions) && indexOfTransactions >= 0 && indexOfTransactions < pendingTransactions.length){
        const foundObj = pendingTransactions[indexOfTransactions]
        toDeleteItemId = foundObj.id
        deleteTransaction(toDeleteItemId)
      }
    }
    else if(word === 'for'){
      // collect everything after 'for'
      category = words.slice(index + 1).join(' ');
      transactions.forEach(obj => {
        if(obj.category.toLowerCase() === category && obj.status === 'pending' && obj.scheduledTime !== null){
          toDeleteItemId = obj.id
          deleteTransaction(toDeleteItemId)
        }
      })
    }
  })
}

// feat: charts for both income and expenses✅

function calculateCategorySums(type){
  const categorySums = {}
  transactions
  .filter(obj => obj.type === type)
  .forEach(obj => {
    if(!categorySums[obj.category]){
      categorySums[obj.category] = 0
    }
    categorySums[obj.category] += Number(obj.amount)
  })
  return categorySums;
}


// store globally
let incomeChartInstance;
let expenseChartInstance;

function renderCharts(){
  const incomeData = calculateCategorySums('income')
  const expenseData = calculateCategorySums('expense')

  const incomeChart = document.getElementById('incomeChart').getContext('2d')
  const expenseChart = document.getElementById('expenseChart').getContext('2d')

  // destroy previous chart if it exists
  if (incomeChartInstance) {
    incomeChartInstance.destroy();
  }
  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }

  incomeChartInstance = new Chart(incomeChart , {
    type: 'pie',
    data: {
      labels: Object.keys(incomeData),
      datasets: [{
        data: Object.values(incomeData),
        backgroundColor: [
          '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {position: 'bottom'}
      }
    }
  });

  expenseChartInstance = new Chart(expenseChart, {
    type: 'pie',
    data: {
      labels: Object.keys(expenseData),
      datasets: [{
        data: Object.values(expenseData),
        backgroundColor: [
          '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}


// feat: working on the history tab section
// here's what this feature will do :-
// 1 -> it should show all the transactions of the past and present ✅
// 2 -> including the deleted transactions ✅
// 3 -> it should filter transactions by type
//      -> income , expense and autopay 
//   -> it should also filter transactions by date
// 4 -> show the transactions in reverse chronological order ✅
//   -> show latest transaction on top and oldest on last (LIFO type) -> appending new on top ✅
// 5 -> show a search box to filter through category
// 6 -> delete task should not be shown in the history -> its task should solely to only show previous transactions made either delted or not ✅
// 7 -> persistaance of the previously stored history data using -> localStorage ✅

// feat: to add a filter of of 30day , 3months , 1year and export as a csv
function filterByDate(date){
  const allTransactions = JSON.parse(localStorage.getItem('transactions')) || []
  const now = new Date()
  let filtered = allTransactions;
  if(date === '30d'){
    // making a copy of todays date 
    const past = new Date(now);
    // todays date - 30 -> will give a starting date
    past.setDate(now.getDate() - 30)
    // traversing through all transactions array and checking each object if date is greater than or equal to our start and if true include them in filtered
    filtered = allTransactions.filter(obj => new Date(obj.date) >= past)
  }

  if(date === '3m'){
    const past = new Date(now)
    past.setDate(now.getMonth() - 3)
    filtered = allTransactions.filter(obj => new Date(obj.date) >= past)
  }

  if(date === '1y'){
    const past = new Date(now)
    past.setDate(now.getFullYear() - 1)
    filtered - allTransactions.filter(obj => new Date(obj.date) >= past)
  }

  renderHistory(filtered)
}

