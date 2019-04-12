import React from 'react';
import { Layout, Menu, Card, Input, Button } from 'antd';

class Wallet extends React.Component {
  state = {
    message: '',
    toAddress: '',
    amount: '',
    walletBalance: -1,
    txHistory: [],
    activePanel: 0
  }

  setActivePanel(activePanel) {
    this.setState({activePanel: activePanel})
  }

  balancePanel() {
    this.sendBalanceRequest();
    this.sendTxHistoryRequest();
    this.setState({activePanel: 0})
  }

  updateTo = e => {
    this.setState({
      toAddress: e.target.value,
    })
  }

  updateAmount = e => {
    this.setState({
      amount: e.target.value,
    })
  }

  sendBalanceRequest() {
    fetch(window.env.NODE_URL + '/my-balance', {
      method: 'POST',
      headers:{'Content-Type': 'application/json'}
    }).then(res => res.json())
      .then(response => this.setState({walletBalance: response.balance}))
      .catch(error => console.error('Error getting address balance:', error));
  }

  sendTxHistoryRequest() {
    fetch(window.env.NODE_URL + '/my-wallet-history', { method: 'GET'})
      .then(res => res.json())
      .then(response => this.setState({txHistory: response.history}))
      .catch(error => console.error('Error getting address balance:', error));
  }

  sendTransaction = () => {
    let message;
    if (this.state.toAddress === '') {
      message = 'To address cannot be empty';
    } else if (this.state.amount === '') {
      message = 'Amount not set';
    } else {
      const input = {
        'ToAddress': this.state.toAddress,
        'Amount': this.state.amount
      };
  
      fetch(window.env.NODE_URL + '/transactions/new', {
        method: 'POST',
        body: JSON.stringify(input),
        headers:{'Content-Type': 'application/json'}
      }).then(response => this.setState({message: 'Transaction successfully added'}))
        .catch(error => console.error('Error sending transaction:', error));
      
      message = 'Transaction sent';
    }

    this.setState({
      message: message
    })
  }

  componentDidMount() {
    this.sendBalanceRequest();
  }

  render() {
    const { Content, Sider } = Layout;

    const panel = [
      (
        <div>
          <h1 style={{margin: 30, fontSize: 60}}>{this.state.walletBalance + " TC 💸"}</h1>
          <hr style={{width: "90%"}}/>
        </div>
      ),
      (
        <Card title='New Transaction' style={{marginTop: 10}}>
          <Input
            placeholder='From'
            onChange={this.updateFrom}
            style={{marginBottom: 20}}
          />
          <Input
            placeholder='Amount'
            onChange={this.updateAmount}
            style={{marginBottom: 20}}/>
          <Button
            onClick={this.sendTransaction}
            style={{marginBottom: 15}}
          >
            Send
          </ Button>
          <p>Message: {this.state.message}</p>
        </Card>
      )
    ];

    return(
      <Content style={{ padding: '0 50px' }}>
        <Layout className='content-page'>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode='inline'
              defaultSelectedKeys={['0']}
              style={{ height: '100%' }}
            >
              <Menu.Item key='0' onClick={() => this.balancePanel()}>Wallet Balance</Menu.Item>
              <Menu.Item key='1' onClick={() => this.setActivePanel(1)}>New Transaction</Menu.Item>
            </Menu>
          </Sider>
          <Content className='content'>
            {panel[this.state.activePanel]}
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default Wallet;
