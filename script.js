'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Dave Ejezie',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Kennesia Watkin',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formattedDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `today`;
  if (daysPassed === 1) return `yesterday`;
  if (daysPassed <= 7) return `${daysPassed} ago`;

  return Intl.DateTimeFormat(locale).format(date);
};

const currencyFormat = (value, locale, currency) => {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const movementDisplay = function (acc, sort = false) {
  const sortMov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  containerMovements.innerHTML = '';

  sortMov.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const datesDisplay = formattedDate(date, acc.locale);
    const formatMov = currencyFormat(mov, acc.locale, acc.currency);
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${datesDisplay}</div>
        <div class="movements__value">${formatMov}
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Displaying balance
const balanceDisplay = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = currencyFormat(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

//Displaying summary
const summaryDisplay = acc => {
  const deposits = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = currencyFormat(deposits, acc.locale, acc.currency);

  const withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = currencyFormat(
    Math.abs(withdrawals),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = currencyFormat(
    interest,
    acc.locale,
    acc.currency
  );
};

const updateFeed = function (acc) {
  //display movements
  movementDisplay(acc);
  //display balance
  balanceDisplay(acc);
  //display summary
  summaryDisplay(acc);
};

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

//Event Handler for LOGIN
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    //display UI
    containerApp.style.opacity = 100;
    //clearing input fields
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
    //display welcome message
    labelWelcome.textContent = `Welcome Back ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateFeed(currentAccount);
    //start timer
    if (timer) clearInterval(timer);
    timer = startTimer();
  }
});
//TIMER
const startTimer = function () {
  //inactivity time
  let time = 600;
  //timer function
  const countDown = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //display timer
    labelTimer.textContent = `${min}:${sec}s`;
    //stopping timer at zero
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Login to get started`;
      inputLoanAmount.value = '';
      inputTransferAmount.value = inputTransferTo.value = '';
      inputTransferTo.blur();
      inputLoginPin.value = inputLoginUsername.value = '';
      inputLoginPin.blur();
    }
    //decrease timer
    time--;
  };
  countDown();
  const timer = setInterval(countDown, 1000);
  return timer;
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const recipient = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    recipient &&
    currentAccount.balance >= amount &&
    recipient !== currentAccount
  ) {
    //transfer process
    currentAccount.movements.push(-amount);
    recipient.movements.push(amount);
    //displaying date
    currentAccount.movementsDates.push(new Date());
    recipient.movementsDates.push(new Date());
    //clearing input fields
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.blur();
    updateFeed(currentAccount);
    //reset timer
    if (timer) clearInterval(timer);
    timer = startTimer();
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  //verify user
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    //find index of user in the array list
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount / 10)
  ) {
    //displaying transfer
    currentAccount.movements.push(loanAmount);
    //displaying date
    currentAccount.movementsDates.push(new Date());
    inputLoanAmount.value = '';
    updateFeed(currentAccount);
    //reset timer
    if (timer) clearInterval(timer);
    timer = startTimer();
  } else {
    console.log(
      `You do not qualify for that amount, please try a lower amount.`
    );
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  movementDisplay(currentAccount.movements, !sorted);
  sorted = !sorted;
});

const now = new Date();
const locale = navigator.language;
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  weekday: 'long',
  month: 'long',
  year: 'numeric',
};

labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
