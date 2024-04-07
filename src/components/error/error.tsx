import React from 'react';
import './error.css';
import {Button, Flex} from '@mantine/core';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // const handleRefresh = () => {
  //   window.location.reload(); // Refresh the page
  // };

  return (
    <div className="error-container">
      <Flex justify="flex-start" align="center" direction="row" columnGap="lg">
        <p className="error-message">{message}</p>
        {/* <Button size="compact-xs" variant="filled" onClick={handleRefresh}>Try Again</Button> */}
      </Flex>
    </div>
  );
};
