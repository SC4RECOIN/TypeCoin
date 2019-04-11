import React from 'react';
import { Layout, Menu, Card, Input, Button } from 'antd';

class Transaction extends React.Component {
  state = {
    message: '',
    toAddress: '',
    fromAddress: '',
    key: '',
    amount: ''
  }

  updateTo = e => {
    this.setState({
      toAddress: e.target.value,
    })
  }

  updateFrom = e => {
    this.setState({
      fromAddress: e.target.value,
    })
  }

  updateKey = e => {
    this.setState({
      key: e.target.value,
    })
  }

  updateAmount = e => {
    this.setState({
      amount: e.target.value,
    })
  }

  sendTransaction = () => {
    let message;
    if (this.state.fromAddress === '') {
      message = 'From address cannot be empty'
    } else if (this.state.toAddress === '') {
      message = 'To address cannot be empty'
    } else if (this.state.key === '') {
      message = 'Key field cannot be empty'
    } else if (this.state.amount === '') {
      message = 'Amount not set'
    } else {
      message = 'Transaction sent'
    }

    this.setState({
      message: message
    })

    const input = {
      "FromAddress": this.state.fromAddress,
      "ToAddress": this.state.toAddress,
      "PrivateKey":this.state.key,
      "Amount": this.state.amount
    };

    fetch(this.props.nodeUrl + 'transactions/new', {
      method: 'POST',
      body: JSON.stringify(input),
      headers:{'Content-Type': 'application/json'}
    }).then(response => this.setState({message: 'Transaction successfully added'}))
    .catch(error => console.error('Error sending transaction:', error));
  }

  render() {
    const { Content, Sider } = Layout;

    return(
      <Content style={{ padding: '0 50px' }}>
        <Layout className='content-page'>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode='inline'
              defaultSelectedKeys={['0']}
              style={{ height: '100%' }}
            >
              <Menu.Item key='0'>Create</Menu.Item>
            </Menu>
          </Sider>
          <Content className='content'>
            <Card title='New Transaction' style={{marginTop: 10}}>
              <Input
                placeholder='From'
                onChange={this.updateFrom}
                style={{marginBottom: 20}}
              />
              <Input
                placeholder='To'
                onChange={this.updateTo}
                style={{marginBottom: 20}}
              />
              <Input
                placeholder='Private key'
                onChange={this.updateKey}
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
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default Transaction;
