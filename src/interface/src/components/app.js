import React from 'react';
import 'antd/dist/antd.css';
import '../index.css'
import { Layout, Menu, Input, Modal } from 'antd';
import NodeContent from './nodes'
import Transaction from './transaction'
import Addresses from './addresses'
import Mine from './mine'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaultPage = 0
    this.state = {
      activeHeader: this.defaultPage,
      modalVisable: true,
      url: ''
    };
    this.setActivePage = this.setActivePage.bind(this);
    this.getPageContent = this.getPageContent.bind(this);
    this.setNodeURL = this.setNodeURL.bind(this);
  }

  setNodeURL(e) {
    this.setState({
      modalVisable: false,
      url: 'https://localhost:44395/api/v1/'
      // url: e.target.value
    });
  }

  setActivePage(activePage) {
    this.setState({activeHeader: activePage})
  }

  getPageContent() {
    switch(this.state.activeHeader) {
      case 0:
        return <NodeContent nodeUrl={this.state.url}/>
      case 1:
        return <Transaction nodeUrl={this.state.url}/>
      case 2:
        return <Addresses nodeUrl={this.state.url}/>
      case 3:
        return <Mine nodeUrl={this.state.url}/>
    }
  }

  render() {
    const { Header, Footer } = Layout;

    return (
      <div>
        <Layout>
          <Header className='header'>
            <div className='logo'/>
            <Menu
              theme='dark'
              mode='horizontal'
              defaultSelectedKeys={[this.defaultPage.toString()]}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key='0' onClick={() => this.setActivePage(0)}>Nodes</Menu.Item>
              <Menu.Item key='1' onClick={() => this.setActivePage(1)}>Transaction</Menu.Item>
              <Menu.Item key='2' onClick={() => this.setActivePage(2)}>Addresses</Menu.Item>
              <Menu.Item key='3' onClick={() => this.setActivePage(3)}>Mine</Menu.Item>
            </Menu>
          </Header>
          {this.getPageContent()}
          <Footer style={{textAlign: 'center'}}>
            Created by Kurtis Streutker
          </Footer>
        </Layout>
        <Modal
          title='Not connected to node'
          visible={this.state.modalVisable}
          footer={null}
        >
          <p>Enter blockchain node URL:</p>
          <Input
            placeholder='Node URL'
            onChange={this.updateTo}
            onPressEnter={this.setNodeURL}
          />
        </Modal>
      </div>
    );
  }
}

export default App;
