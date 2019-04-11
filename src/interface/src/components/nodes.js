import React from 'react';
import { Layout, Menu } from 'antd';

class NodeContent extends React.Component {
  render() {
    const { SubMenu } = Menu;
    const { Content, Sider } = Layout;

    return(
      <Content style={{ padding: '0 50px' }}>
        <Layout className="content-page">
          <Sider>
            <Menu
              mode='inline'
              defaultSelectedKeys={['3']}
              style={{ height: '100%' }}
            >
              <SubMenu key='sub1' title='Statistics'>
                <Menu.Item key='1'>Node Count</Menu.Item>
                <Menu.Item key='2'>Chain Length</Menu.Item>
              </SubMenu>
              <Menu.Item key='3'>Chain Length</Menu.Item>
              <Menu.Item key='4'>Consensus</Menu.Item>
            </Menu>
          </Sider>
          <Content className="content">
            Content
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default NodeContent;
