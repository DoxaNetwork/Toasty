import React, { Component } from 'react';

class MemberRow extends Component {

    render() {

        const maxWidth = 500;
        const scale = maxWidth / this.props.totalTokens;
        const balanceWidth = this.props.balance.toNumber() * scale;
        const availableWidth = this.props.availableBalance * scale;

        return (
            <li>
                <div style={{ display: 'flex' }}>
                    <div style={{ backgroundColor: this.props.elected ? '#087F8C' : '#5AAA95', width: `${balanceWidth}px`, height: '20px' }}></div>
                    <div style={{ backgroundColor: '#DEE5E5', width: `${availableWidth}px`, height: '20px' }}></div>
                </div>
                <div> Username: {this.props.username}</div>
                <div> Balance: {this.props.balance.toNumber()} </div>
                <div> Backing: {this.props.backing.toNumber()} </div>
                <div> {this.props.elected ? '' : 'NOT'} Elected  </div>
            </li>
        )
    }
}

export default MemberRow
