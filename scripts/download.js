const Downloader = {
  download() {
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(Downloader.transactionsToText(Transaction.all)));
    link.setAttribute('download', 'Extrato.html');
    link.click();
  },
  
  innerHtmlTransactionNoImage(transaction) {
    const formattedValue = Utils.formatCurrency(transaction.amount);
    const clazz = transaction.amount < 0 ? 'expense' : 'income';

    const html = `
      <tr>
        <td class="date">${Utils.formatDate(transaction.date)}</td>
        <td class="${clazz}">${formattedValue}</td>
        <td class="description">${transaction.description}</td>
      </tr>
    `;

    return html;
  },

  transactionsToText(transactions) {
    let body = '';

    transactions.forEach(transaction => {
      body += Downloader.innerHtmlTransactionNoImage(transaction);
    });

    const total = Transaction.total();
    const clazz = total < 0 ? 'expense' : 'income';

    const html = `
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Extrato dev.finance$</title>
          <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html {
            font-size: 93.75%;
          }

          body {
            background: #F0F2F5;
            overflow-x: auto;
            width: min(80vw, 800px);
            display: flex;
            flex-direction: column;
          }
          
          table {
            color: #363F5F;
            border-spacing: 0 0.5rem;
          }

          table tbody tr td {
            color: #969CB3;
          }
          
          table thead tr th:first-child,
          table tbody tr td:first-child {
            border-radius: 0.25rem 0 0 0.25rem;
          }
          
          table thead tr th:last-child,
          table tbody tr td:last-child {
            border-radius: 0 0.25rem 0.25rem 0;
          }
          
          table thead th {
            background: white;
            font-weight: normal;
            padding: 1rem 2rem;
            text-align: left;
          }
          
          table tbody td {
            background: white;
            padding: 1rem 2rem;
          }

          .income {
            color: #12A454;
          }

          .expense {
            color: #E92929;
          }

          @media (min-width: 800px) {
            html {
              font-size: 87.5%;
            }
          }
        </style>
        </head>
        <body>
          <table id="data-table">
            <thead>
              <tr>
                <th>Entradas: <span class="income">${Utils.formatCurrency(Transaction.incomes())}</span></th>
                <th>Saídas: <span class="expense">${Utils.formatCurrency(Transaction.expenses())}</span></th>
                <th>Saldo: <span class="${clazz}">${Utils.formatCurrency(total)}</span></th>
              </tr>
              <tr>
                <th>Data</th>
                <th>Valor</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </body>
        `

    return html;
  }
};