import React from 'react';
import 'antd/dist/antd.css';
import '../index.css'
import { Layout, Menu, Input, Modal } from 'antd';
import NodeContent from './nodes'
import Wallet from './wallet'
import Addresses from './addresses'
import Mine from './mine'
import { ec as EC } from 'elliptic';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaultPage = 0
    this.state = {
      activeHeader: this.defaultPage,
      modalVisable: true,
      modalTitle: 'Setup/import wallet',
      keyPair: null
    };

    this.setActivePage = this.setActivePage.bind(this);
    this.setKeyPair = this.setKeyPair.bind(this);
  }

  setKeyPair(e) {
    const ec = new EC('secp256k1');
    const keyPair = ec.keyFromPrivate(e.target.value);

    this.setState({
      modalVisable: false,
      keyPair: keyPair
    });
  }

  setActivePage(activePage) {
    this.setState({activeHeader: activePage})
  }

  render() {
    const { Header, Footer } = Layout;

    let pageContent;
    switch(this.state.activeHeader) {
      case 0:
        pageContent = <NodeContent nodeUrl={this.state.url}/>
        break;
      case 1:
        pageContent = <Wallet nodeUrl={this.state.url}/>
        break;
      case 2:
        pageContent = <Addresses nodeUrl={this.state.url}/>
        break;
      case 3:
        pageContent = <Mine nodeUrl={this.state.url}/>
        break;
    }

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
              <Menu.Item key='1' onClick={() => this.setActivePage(1)}>Wallet</Menu.Item>
              <Menu.Item key='2' onClick={() => this.setActivePage(2)}>Addresses</Menu.Item>
              <Menu.Item key='3' onClick={() => this.setActivePage(3)}>Mine</Menu.Item>
            </Menu>
          </Header>
          {pageContent}
          <Footer style={{textAlign: 'center'}}>
            Created by Kurtis Streutker
          </Footer>
        </Layout>
        <Modal
          title={this.state.modelTitle}
          visible={this.state.modalVisable}
          footer={null}
        >
          <p>Enter private key:</p>
          <Input
            placeholder='Private key'
            onChange={this.updateTo}
            onPressEnter={this.setKeyPair}
          />
        </Modal>
      </div>
    );
  }
}

export default App;
