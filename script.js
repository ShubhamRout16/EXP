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
    transactions.push(transactionObject);
  }
  console.log(transactions);
  
  
  const recentTransactions = document.querySelector('.recent-transaction-card')
  // check if the transaction is the first time
  if(transactions.length === 1){
    recentTransactions.innerHTML = ''
  }

  // creating a new div so as to add new card each time not to replace the previous card
  const transactionDiv = document.createElement('div')
  
  transactionDiv.innerHTML =
  `
  <div>
  <p><strong>Type : ${dataObject.transactionType}</strong></p>
  <p><strong>Category : ${dataObject.category}</strong></p>
  <p><strong>Amount : ${dataObject.amount}</strong></p>
  <p><strong>Date : ${dataObject.date}</strong></p>
  <button>Delete</button>
  </div>
  `;

  recentTransactions.appendChild(transactionDiv)
  // bug appending the child makes the the div to append inside the current text
  // solution: if its the first transaction clear the container

  // form reference to reset the form after every submit
  const myForm = document.querySelector('.transaction-form-content')
  myForm.reset();
}