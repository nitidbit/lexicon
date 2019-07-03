import React, { FormEvent } from 'react';

type LogoutFormProps = {
  endpoint: string,
};

type LogoutFormState = {
  loading: boolean,
  successful: boolean,
  error?: string,
};

type LogoutAPIResponse = {
  successful: boolean,
  error: string,
}

export default class LogoutForm extends React.Component<LogoutFormProps, LogoutFormState> {
  constructor(props: LogoutFormProps) {
    super(props);

    this.state = {
      loading: false,
      successful: false,
    };
  }

  render() {
    const { successful, loading, error } = this.state;

    if (loading) {
      status = 'Logging you out...';
    } else {
      if (successful) {
        status = 'You are now logged out.';
      } else if (error !== undefined) {
        status = `Error: ${error}`;
      }
    }

    return (
      <>
        <button onClick={this.doLogout}>Log out</button>
        <small>{status}</small>
      </>
    );
  }

  doLogout = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('lexiconEditorToken');

    try {
      const data: LogoutAPIResponse = await (await fetch(this.props.endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })).json();
      if (data.successful) {
        this.setState({ loading: false, successful: true });
        localStorage.removeItem('lexiconEditorToken');
      } else {
        this.setState({
          loading: false,
          successful: false,
          error: data.error,
        });
      }
    } catch (e) {
      this.setState({
        loading: false,
        successful: false,
        error: e,
      });
    }
  }
}
