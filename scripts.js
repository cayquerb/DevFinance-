// MODAL 
const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

// LOCALSTORAGE
const Storage = {
    get() {
        // TRANSFORMA NOVAMENTE A STRING EM ARRAY OU VICE VERSA
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
        
        // PEGA TODOS OS ARRAYS E OS TRANSFORMAM EM STRING PARA ARMAZENAR NO LOCALSTORAGE
        JSON.stringify(transactions))
    }
}

// VALORES DE ENTRADA
const Transaction = {
    all: Storage.get(),

    // ADICIONA UMA NOVA TRANSAÇÃO
    add(transaction) {
        Transaction.all.push(transaction)
        
        App.reload()
    },

    // EXCLUI UMA TRANSAÇÃO
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // SOMA OS VALORES DE ENTRADA SE FOREM MAIORES QUE ZERO
        let income = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income
    },

    expenses() {
        // SOMA SAÍDA DOS VALORES
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense
    },

    total() {
        // DIFERENÇA ENTRE ENTRADA E SAÍDA
        return Transaction.incomes() + Transaction.expenses();
    }
}

// DOM E MANIPULAÇÕES
const DOM = {

    // ADICIONA A ESTRUTURA DIRETAMENTE ATRAVÉS DO JAVASCRIPT 
    transactionsContainer: document.querySelector('#data-table tbody'),

    // ADICIONA UMA TRANSAÇÃO
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        // POSIÇÃO EXPECIFICA DO ARRAY EXCLUIDO
        tr.dataset.index = index

        // EXIBE OS ITENS QUE FORAM ADICIONADOS COM A FORMATAÇÃO AUTOMÁTICA
        DOM.transactionsContainer.appendChild(tr)
    },

    // ESTRUTURA BÁSICA PARA ADIÇÃO DA TRANSAÇÃO
    innerHTMLTransaction(transaction, index) {

        // VALIDAÇÃO QUE DETRMINA SE É SAÍDA OU ENTRADA
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="remove item">
            </td>
        `
        return html
    },

    // ATUALIZA OS VALORES ENTRADA/SAÍDA/TOTAL
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // NÃO PERMITE DUPLICAR TRANSAÇÕES AO FAZER O RELOAD
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// FORMATAÇÃO DA MOEDA
const Utils = {
    formatAmount (value){
        value = Number(value) * 100

        return value
    },

    formatDate(date) {
        // RETORNA O VALOR DA DATA NA FORMA PADRÃO ATRAVÉS DA EXPRESSÃO REGULAR
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {

        // FORMATA OS VALORES DE ENTRADA DEFININDO POSITIVO/NEGATIVO
        const signal = Number(value) < 0 ? "-" : ""

        // TRANSFORMA O VALOR EM STRING
        // ATRAVÉS DA EXPRESSÃO REGULAR RETIRA QUALQUER CARACTERE QUE NÃO FOR UM NÚMERO
        value = String(value).replace(/\D/g, "")

        // FORMATA VALOR PARA DECIMAL
        value = Number(value) / 100

        // FORMATA PARA O PADRÃO REAL BRASILEIRO (R$)
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),


    // PEGA OS VALORES QUE ESTÃO SENDO RECEBIDOS ATRAVÉS DO OBJETO
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() {
        const {description,amount,date} = Form.getValues()

        // VALIDA SE TODOS OS CAMPOS FORAM PREENCHIDOS
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Preencha todos os campos")
            }

        console.log(description);
    },

    formatValues() {
        let {description,amount,date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        
        return {
            description,
            amount,
            date
        } 
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        // IMPEDE O COMPORTAMENTO PADRÃO DO FORMULÁRIO
        event.preventDefault()

        try {
            // VERIFICA SE OS CAMPOS SÃO VÁLIDOS
            Form.validateFields()

            // FORMATA OS DADOS ANTES DE SALVAR
            const transaction = Form.formatValues()

            // ADICIONAR TRANSAÇÃO
            Transaction.add(transaction)

            // LIMPAR OS CAMPOS
            Form.clearFields()

            // FECHAR O MODAL
            Modal.close()

        } catch (error) {
            alert(error.message)
        }

       

        // Form.formatData()
    }

   
}

// INICIA E PARA APLICAÇÃO
const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
       
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()



 