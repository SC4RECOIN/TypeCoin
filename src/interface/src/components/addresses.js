import React, { Component } from 'react';
import { Layout, Menu, Input, Card } from 'antd';

class Addresses extends Component {
  state = {
      address: '',
      balance: ''
  };

  setAddressValues = e => {
    const input = {address:  e.target.value};
    fetch(window.env.NODE_URL + '/balance', {
      method: 'POST',
      body: JSON.stringify(input),
      headers:{'Content-Type': 'application/json'}
    }).then(res => res.json())
      .then(response => this.setAddressBalance(response.balance))
      .catch(error => console.error('Error retrieving balance:', error));

    this.setState({
      address: e.target.value,
      balance: 'Sending request...'
    })
  }

  setAddressBalance(balance) {
    this.setState({
      balance: balance
    })
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
              <Menu.Item key='0'>Get Balance</Menu.Item>
            </Menu>
          </Sider>
          <Content className='content'>
            <Card title='Blockchain address' style={{marginTop: 10}}>
              <Input
                placeholder='Address'
                style={{marginBottom: 20}}
                onPressEnter={this.setAddressValues}
              />
              <p>Address:  {this.state.address}</p>
              <p>Balance:  {this.state.balance}</p>
            </Card>
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default Addresses;
