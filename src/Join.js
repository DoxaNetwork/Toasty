import React, { Component } from 'react'

class Join extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            etherAmount: 1
        };

        this.handleUserNameChange.bind(this); // TODO why doesn't this work?
        this.clickButton.bind(this)
    }

    async getAccount() {
        let results = await this.props.getWeb3;

        // TODO make this a promise
        results.web3.eth.getAccounts((error, accounts) => {
            this.account = accounts[0] //TODO how to let user choose address?
        })
    }

    async componentWillMount() {
        this.tokenInstance = await this.props.getContract(this.props.token);
        await this.getAccount();
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value})
    }

    handleEtherAmountChange(event) {
        this.setState({etherAmount: event.target.value})
    }

    async clickButton() {
        await this.tokenInstance.register.sendTransaction(
            this.state.username,
            {from: this.account, value: new window.web3.BigNumber(window.web3.toWei(this.state.etherAmount,'ether'))}
        )
    }

    render() {
        return (
            <div>
                <h2>Become a member </h2>
                <form>
                    <p>
                        Username
                        <input type="text" name="username" value={this.state.username} onChange={this.handleUserNameChange.bind(this)}/>
                    </p>
                    <p>
                        Ether amount
                        <input type="number" name="etherAmount" value={this.state.etherAmount} onChange={this.handleEtherAmountChange.bind(this)}/>
                    </p>
                    <p>
                        Buys you {this.state.etherAmount * 1000} Toasty tokens
                    </p>
                </form>
                <button onClick={this.clickButton.bind(this)}>Join</button>
            </div>
        )
    }
}

export default Join
