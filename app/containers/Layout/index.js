import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import Header from './Header/Loadable';

const LayoutWrapper = styled.div`
  height: 100vh !important;
`;

export default ({ children }) => {
  return (
    <LayoutWrapper>
      <div id="container" className="fitParent">
        <Header />
        {/* {showConnectionIssue && !connected */}
        {/* ? <ConnectionNotification /> */}
        {/* : null} */}
        <div
          className="content-wrapper"
          style={{
            position: 'relative',
            height: 'calc(100% - 50px)',
          }}
        >
          {children}
        </div>
      </div>
    </LayoutWrapper>
  );
};
