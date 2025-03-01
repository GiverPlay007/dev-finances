const Modal = {
  open() {
    document
      .querySelector('.modal-overlay')
      .classList.add('active');
  },

  close() {
    document
      .querySelector('.modal-overlay')
      .classList.remove('active');
  }
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances.giver:transactions')) || [];
  },

  set(transactions) {
    localStorage.setItem('dev.finances.giver:transactions', JSON.stringify(transactions));
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction){
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let incomes = 0;

    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        incomes += transaction.amount;
      } 
    });

    return incomes;
  },

  expenses() {
    let expenses = 0;

    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });

    return expenses;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },

  clear() {
    Transaction.all.splice(0, Transaction.all.length);
    App.reload();
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHtmlTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHtmlTransaction(transaction, index) {
    
    const formattedValue = Utils.formatCurrency(transaction.amount);
    const clazz = transaction.amount < 0 ? 'expense' : 'income';

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${clazz}">${formattedValue}</td>
      <td class="date">${Utils.formatDate(transaction.date)}</td>
      <td class="minus">
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `;

    return html;
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());

    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Math.abs(Transaction.expenses()));

    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
};

const Utils = {
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';

    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  },

  formatDate(value) {
    const splittedDate = value.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  }
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if(description.trim() === '' || amount.trim() === '' || date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos.');
    }
  },

  formatValues() {
    let {description, amount, date} = Form.getValues();

    amount = Utils.formatAmount(amount);

    return {
      description,
      amount,
      date
    };
  },

  clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },

  submit(event) {
    event.preventDefault();
    
    try {
      Form.validateFields();

      const transaction = Form.formatValues();
      Transaction.add(transaction);
      App.reload();

      Form.clearFields();
      Modal.close();
    } catch(error) {
      alert(error.message)
      console.log(error);
    }
  }
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    
    Transaction.all.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    Storage.set(Transaction.all);
    DOM.updateBalance();
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  }
};

App.init();