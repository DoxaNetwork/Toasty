import React, { Component } from 'react'

import MemberRow from './MemberRow'

class MemberTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            totalTokens: null
        }
    }

    async componentWillMount() {
        this.tokenInstance = await this.props.getContract(this.props.token);

        // TODO this code should also be modular
        const memberCount = await this.tokenInstance.memberCount();
        const indexesToRetrieve = [...new Array(memberCount.toNumber()).keys()];

        const functions = indexesToRetrieve.map(index => this.tokenInstance.findMemberByIndex(index));
        let results = await Promise.all(functions);

        // TODO: this code should be modular. it will be used a lot
        let users = [];
        let totalTokens = 0;
        for (const [address, username, active, elected, balance, backing] of results) {
            totalTokens += balance.toNumber();
            users.push({address, username, elected, balance, backing})
        }

        users.sort((a,b) => b.balance - a.balance );

        this.setState({users, totalTokens})

    }

    render() {
        let users = this.state.users;

        const maxWidth = 500; // TODO this should not be in two places
        const threshold = 1000;
        const scale = maxWidth / this.state.totalTokens;
        const thresholdScaled = threshold * scale + 40; // TODO we shouldnt have the ul margin hardcoded here

        let userList = users.map(({ address, username, elected, balance, backing }) =>
            <MemberRow key={address} username={username} elected={elected} balance={balance} backing={backing} totalTokens={this.state.totalTokens} availableBalance={1000}/>
        );

        return (
            <div>
                <h2>Current Members</h2>
                <div style={{ position: 'relative' }}>
                    <ul style={{ listStyle: 'none' }}>
                        {userList}
                        <div style={{ position: 'absolute', border: '1px dashed darkgray', height: '100%', width: '0px', top: '0', left:`${thresholdScaled}px`}}/>
                    </ul>

                </div>
            </div>
        )
    }

}

export default MemberTable
