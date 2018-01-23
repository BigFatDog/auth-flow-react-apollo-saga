import styled from 'styled-components';

const LoginBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.4) 0px 10px 20px -10px;
  background: white;
  overflow: hidden;

  a {
    color: #000;
    text-decoration: none;
    font-weight: bold;
  }

  a:hover,
  a:focus {
    cursor: pointer;
    color: #000 !important;
    text-decoration: none !important;
  }

  a:active,
  a:hover {
    outline: 0;
  }

  .forgot-password {
    font-size: 14px;
    font-weight: normal;
    display: block;
    margin: 20px 0px 30px;
  }

  .forgot-title {
    padding: 0px 20px;
  }

  .forgot-title h2 {
    font-size: 18px;
    margin: 0px;
  }

  .forgot-title p {
    line-height: 2;
    font-size: 14px;
    padding: 10px 0;
  }
`;

export default LoginBox;
