import React from 'react';
import { Layout, Menu, Card, Input, Button } from 'antd';

class Wallet extends React.Component {
  state = {
    message: '',
    toAddress: '',
    amount: '',
    walletBalance: -1,
    activePanel: 0
  }

  setActivePanel(activePanel) {
    this.setState({activePanel: activePanel})
  }

  balancePanel() {
    this.sendBalanceRequest();
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

  sendTransaction = () => {
    let message;
    if (this.state.toAddress === '') {
      message = 'To address cannot be empty'
    } else if (this.state.amount === '') {
      message = 'Amount not set'
    } else {
      message = 'Transaction sent'
    }

    this.setState({
      message: message
    })

    const input = {
      "ToAddress": this.state.toAddress,
      "Amount": this.state.amount
    };

    fetch(window.env.NODE_URL + '/transactions/new', {
      method: 'POST',
      body: JSON.stringify(input),
      headers:{'Content-Type': 'application/json'}
    }).then(response => this.setState({message: 'Transaction successfully added'}))
      .catch(error => console.error('Error sending transaction:', error));
  }

  componentDidMount() {
    this.sendBalanceRequest();
  }

  render() {
    const { Content, Sider } = Layout;

    let panel;
    switch(this.state.activePanel) {
      case 0:
        panel = (
          <h1 style={{margin: 20, fontSize: 60}}>{this.state.walletBalance + " TC 💸"}</h1>
        )
        break;
      case 1:
        panel = (
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
        );
        break;
      default:
        panel = "Not implemented";
        break;
    }

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
              <Menu.Item key='2' onClick={() => this.setActivePanel(2)}>Transaction History</Menu.Item>
            </Menu>
          </Sider>
          <Content className='content'>
            {panel}
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default Wallet;
