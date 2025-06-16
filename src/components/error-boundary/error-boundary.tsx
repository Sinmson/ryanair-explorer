import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button } from 'grommet';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          align="center"
          justify="center"
          pad="large"
          gap="medium"
          background="light-2"
          round="small"
        >
          <Heading level={2}>Something went wrong</Heading>
          <Text>{this.state.error?.message}</Text>
          <Button
            primary
            label="Try again"
            onClick={() => this.setState({ hasError: false, error: null })}
          />
        </Box>
      );
    }

    return this.props.children;
  }
} 