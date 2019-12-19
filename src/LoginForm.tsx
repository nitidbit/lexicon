import React, { FormEvent } from 'react';

type LoginFormProps = {
  endpoint: string,
};

type LoginFormState = {
  loading: boolean,
  successful: boolean,
  error?: string,
  password: string,
};

type LoginAPIResponse = {
  successful: boolean,
  token?: string,
  error?: string,
}

export default class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);

    this.state = {
      loading: false,
      successful: false,
      password: '',
    };
  }

  render() {
    const { successful, password, loading, error } = this.state;

    let status = '';

    if (loading) {
      status = 'Logging you in...';
    } else {
      if (successful) {
        status = 'You are now logged in.';
      } else if (error !== undefined) {
        status = `Error: ${error}`;
      }
    }

    return (
      <form onSubmit={this.handleSubmission}>
        <label htmlFor="password">
          Password:
        </label>
        <br />
        <input type="password" id="password" name="password" value={password} onChange={this.handleChange} disabled={successful || loading} />
        <br />
        <input type="submit" value="Log in" disabled={successful || loading} />
        <br />
        <small>{status}</small>
      </form>
    );
  }

  handleSubmission = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true });

    try {
      const data: LoginAPIResponse = await (await fetch(this.props.endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: this.state.password }),
      })).json();
      if (data.successful) {
        sessionStorage.setItem('lexiconServerToken', data.token);
        this.setState({ loading: false, successful: true });
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

  handleChange = (e: FormEvent<HTMLInputElement>) => {
    this.setState({ password: e.currentTarget.value });
  }
}
