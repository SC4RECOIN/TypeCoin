import React from 'react';
import { Layout, Menu } from 'antd';

class NodeContent extends React.Component {
  state = {
    activePanel: 0,
    nodeCount: -1,
    chainLength: -1,
  }

  setActivePanel(activePanel) {
    if (activePanel === 0) {
      this.sendLengthRequest();
    } else {
      this.sendNodeCountRequest();
    }
    this.setState({activePanel: activePanel})
  }

  sendLengthRequest() {
    fetch(window.env.NODE_URL + '/length', { method: 'GET'})
      .then(res => res.json())
      .then(response => this.setState({chainLength: response.length}))
      .catch(error => console.error('Error getting chain length', error));
  }

  sendNodeCountRequest() {
    fetch(window.env.NODE_URL + '/peers', { method: 'GET'})
      .then(res => res.json())
      .then(response => {
        console.log(response);
        this.setState({nodeCount: response.length});
      })
      .catch(error => console.error('Error getting peers', error));
  }

  componentDidMount() {
    this.sendLengthRequest();
    this.sendNodeCountRequest();
  }

  render() {
    const { Content, Sider } = Layout;

    const panels = [
      (
        <div>
          <h1 style={{margin: 40, fontSize: 40}}>Block Height: {this.state.chainLength}</h1>
          <hr style={{width: "95%"}}/>
          <p style={{marginLeft: 40, fontSize: 20}}>Current length of the longest chain</p>
        </div>
      ),(
        <div>
          <h1 style={{margin: 40, fontSize: 40}}>{this.state.nodeCount}</h1>
          <hr style={{width: "95%"}}/>
          <p style={{marginLeft: 40, fontSize: 20}}>Number of connected peers</p>
        </div>
      )
    ]

    return(
      <Content style={{ padding: '0 50px' }}>
        <Layout className="content-page">
          <Sider>
            <Menu
              mode='inline'
              defaultSelectedKeys={['0']}
              style={{ height: '100%' }}
            >
              <Menu.Item key='0' onClick={() => this.setActivePanel(0)}>Chain Length</Menu.Item>
              <Menu.Item key='1' onClick={() => this.setActivePanel(1)}>Node Count</Menu.Item>
            </Menu>
          </Sider>
          <Content className="content">
            {panels[this.state.activePanel]}
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default NodeContent;
