import React, { useState } from 'react';
import './login-page.css';
import { AuthApi } from '../../api/authApi';
import { APIStatus, PageProps } from '../../types';
import { Loader } from '../loader/loader';
import { ErrorMessage } from '../error/error';

export const LoginPage: React.FC<PageProps> = ({
  navigateToMainPage, 
  navigateToSignUpPage
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('' );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    if(password.length === 0 || username.length === 0) {
      setErrorMessage(LoginErrorMessages.required);
      return;
    }
    setIsLoading(true);
    const res = await AuthApi.login({ username, password });
    setIsLoading(false);
    
    switch (res) {
      case APIStatus.Success:
        navigateToMainPage();
        break;
      case APIStatus.BadRequest:
        setErrorMessage(LoginErrorMessages.invalid);
        break;
      case APIStatus.Unauthorized:
        setErrorMessage(LoginErrorMessages.invalid);
        break;
      case APIStatus.ServerError:
        setErrorMessage(LoginErrorMessages.failed);
        break;
      default:
        break;
    }
  };

  const handleSignUp = () => {
    navigateToSignUpPage()
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {errorMessage && <ErrorMessage message={errorMessage}/>}
        {isLoading ? <Loader /> :<button type="button" className="login-btn" onClick={handleLogin}>Login</button>}
      </form>
      <p className="signup-link">Don't have an account? <button type="button" onClick={handleSignUp}>Sign Up</button></p>
    </div>
  );
};

const LoginErrorMessages = {
  required: 'Username and password are required',
  invalid: 'Invalid username or password',
  failed: 'Login failed, please try again'
};