import React from 'react';
import styled from 'styled-components';
import LocaleToggle from '../LocaleToggle';

const LayoutWrapper = styled.div`
  height: 100vh !important;
`;

export default ({ children }) => {
  return (
    <LayoutWrapper>
      <LocaleToggle />
      <div id="container" className="fitParent">
        {children}
      </div>
    </LayoutWrapper>
  );
};
