import React, { useState } from 'react';
import './signup-page.css';
import { AuthApi } from '../../api/authApi';
import { APIStatus, PageProps } from '../../types';
import { Loader } from '../loader/loader';
import { ErrorMessage } from '../error/error';

export const SignUpPage: React.FC<PageProps> = ({
    navigateToLoginPage
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignUp = async () => {
    if(password.length === 0 || username.length === 0) {
        setErrorMessage(SignUpErrorMessages.required);
        return;
      }
    setIsLoading(true);
    const res = await AuthApi.signUp({ username, password });
    setIsLoading(false);

    switch (res) {
      case APIStatus.Success:
        navigateToLoginPage();
        break;
      case APIStatus.BadRequest:
        setErrorMessage(SignUpErrorMessages.exists);
        break;
      case APIStatus.ServerError:
        setErrorMessage(SignUpErrorMessages.failed);
      case APIStatus.NotFound:
        setErrorMessage('UserName Is Taken.');
        break;
      default:
        break;
    }
  };

  const handleLogin = () => {
    navigateToLoginPage();
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
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
        {isLoading ? <Loader /> : <button type="button" className="signup-btn" onClick={handleSignUp}>Sign Up</button>}
      </form>
      <p className="login-link">Already have an account? <button type="button" onClick={handleLogin}>Login</button></p>
    </div>
  );
};

const SignUpErrorMessages = {
    required: 'Username and password are required',
    exists: 'Username already exists',
    failed: 'Sign Up failed, please try again'
};
