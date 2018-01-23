import styled from 'styled-components';

const InputTextWrapper = styled.div`
  height: 46px;
  margin-bottom: 20px;
  background: 16px center / 14px no-repeat #f2f2f2;
  background-repeat: no-repeat;
  background-position: 16px center;

  label {
    display: none;
  }

  .input-icon {
    font-size: 18px;
    margin-left: 10px;
    margin-right: 10px;
    line-height: 46px;
  }

  .input-text {
    width: 240px;
    font-size: 18px;
    margin: 0px;
    border: 0;
    background: transparent;
    background-size: 14px;
    background-repeat: no-repeat;
    background-position: 16px center;
    text-indent: 30px;
  }

  input {
    outline: 0;
    background-color: transparent !important;
  }

  textarea:focus,
  input:focus,
  .uneditable-input:focus {
    border-color: transparent !important;
    outline: 0;
    -webkit-box-shadow: inset 0 1px 1px transparent !important;
    -moz-box-shadow: inset 0 1px 1px transparent !important;
    box-shadow: inset 0 1px 1px transparent !important;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-transition-delay: 99999s !important;
  }
`;

export default InputTextWrapper;
