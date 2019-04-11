import React from 'react';
import { Layout, Menu, Card, Button } from 'antd';

class Mine extends React.Component {
  state = {
    buttonMsg: 'Start Mining',
    blockMined: '',
    loading: false
  };

  sendMineRequest = () => {
    this.setState({
      buttonMsg: 'Mining',
      loading: true,
    })

    const input = {RewardAddress:  '0x8AbC81fa694D6FBd14E7df3d9e39e0951fD0a206'};
    fetch(this.props.nodeUrl + 'mine', {
      method: 'POST',
      body: JSON.stringify(input),
      headers:{'Content-Type': 'application/json'}
    }).then(res => res.json())
    .then(response => this.setState({
      blockMined: JSON.stringify(response.blockData, null, 2),
      loading: false
    }))
    .catch(error => console.error('Error mining block', error));
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
              <Menu.Item key='0'>Mine Block</Menu.Item>
            </Menu>
          </Sider>
          <Content className='content'>
            <Card title='Block' style={{marginTop: 10}}>
              <Button
                loading={this.state.loading}
                onClick={this.sendMineRequest}
                style={{marginBottom: 15}}
              >
                {this.state.buttonMsg}
              </Button>
              <pre>{this.state.blockMined}</pre>
            </Card>
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default Mine;
