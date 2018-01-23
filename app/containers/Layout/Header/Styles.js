import styled from 'styled-components';

export const NavBar = styled.div`
  border-bottom-width: 0;
  border-color: transparent;
  background: #060a0e;
  height: 50px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
`;

export const NavHeader = styled.div`
  padding-top: 14px;

  .nav-link {
    color: whitesmoke;
    text-decoration: none;
    padding: 0px 26px;
  }

  .nav-link:hover {
    color: white;
    cursor: pointer;
  }
`;
