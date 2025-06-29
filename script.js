window.onload = () => {
  loadSavedTransactions();
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
  if(dataObject.amount > 0 && dataObject.category !== '' && dataObject.date !== ''){
    let transactionObject = {
      id: Date.now(),
      type: dataObject.transactionType,
      category: dataObject.category,
      amount: dataObject.amount,
      date: dataObject.date,
      description: dataObject.description,
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
    <p>No Transactions found</p>
    `
  }

  transactions.forEach(obj => {
    const indiTransactionDiv = document.createElement('div')
    indiTransactionDiv.innerHTML = `
    <div>
      <p><strong>Type : ${obj.type}</strong></p>
      <p><strong>Category : ${obj.category}</strong></p>
      <p><strong>Amount : ${obj.amount}</strong></p>
      <p><strong>Date : ${obj.date}</strong></p>
      <button onclick="deleteTransaction(${obj.id})">Delete</button>
    </div>
    `
    transactionsContainer.appendChild(indiTransactionDiv);
  })
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
  }
}