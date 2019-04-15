import React from 'react';
import 'antd/dist/antd.css';
import '../index.css'
import { Layout, Menu } from 'antd';
import NodeContent from './nodes'
import Wallet from './wallet'
import Addresses from './addresses'
import Mine from './mine'

class App extends React.Component {
  state = {
    activeHeader: 0
  }

  setActivePage(activePage) {
    this.setState({activeHeader: activePage})
  }

  render() {
    const { Header, Footer } = Layout;
    const pageContent = [
      <NodeContent nodeUrl={this.state.url}/>,
      <Wallet nodeUrl={this.state.url}/>,
      <Addresses nodeUrl={this.state.url}/>,
      <Mine nodeUrl={this.state.url}/>
    ]

    return (
      <div>
        <Layout>
          <Header className='header'>
            <div className='logo'>TYPECOIN</div>
            <Menu
              theme='dark'
              mode='horizontal'
              defaultSelectedKeys={[this.state.activeHeader.toString()]}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key='0' onClick={() => this.setActivePage(0)}>Nodes</Menu.Item>
              <Menu.Item key='1' onClick={() => this.setActivePage(1)}>Wallet</Menu.Item>
              <Menu.Item key='2' onClick={() => this.setActivePage(2)}>Addresses</Menu.Item>
              <Menu.Item key='3' onClick={() => this.setActivePage(3)}>Mine</Menu.Item>
            </Menu>
          </Header>
          {pageContent[this.state.activeHeader]}
          <Footer style={{textAlign: 'center'}}>
            Created by Kurtis Streutker
          </Footer>
        </Layout>
      </div>
    );
  }
}

export default App;
