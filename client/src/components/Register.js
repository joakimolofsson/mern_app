import React, { Component } from 'react';
import './css/Register.css';

class Register extends Component {
    state = {
        serverMsg: {
            status: ''
        },
        userInput: {
            firstname: '',
            lastname: '',
            age: '',
            email: '',
            password: ''
        }
    }

    handleChange = (e) => {
        this.setState({
            userInput: {
                ...this.state.userInput,
                [e.target.name]: e.target.value
            }
        });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const registerUser = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    firstname: this.state.userInput.firstname,
                    lastname: this.state.userInput.lastname,
                    age: this.state.userInput.age,
                    email: this.state.userInput.email,
                    password: this.state.userInput.password
                })
            });
            
            const serverResponse = await registerUser.json();
            this.handleResponse(serverResponse);
        } catch(err) {
            console.log(err);
            this.setState({
                serverMsg: {
                    status: 'Something went wrong!'
                }
            });
        }
    }

    handleResponse = (res) => {
        if(res.status === 'success') {
            this.resetInputFields();
            this.setState({
                serverMsg: {
                    status: 'New User Registered!'
                }
            });
        } else {
            this.setState({
                serverMsg: {
                    status: res.status
                }
            });
        }
    }

    resetInputFields = () => {
        let resetInput = {};
        for(let key in this.state.userInput) {
            resetInput = {...resetInput, [key]: ''}
        }
        this.setState({
            userInput: {
                ...resetInput
            }
        });
    }

    render() {
        return (
            <div className="Register">
                <h2>Register</h2>
                <p>{this.state.serverMsg.status}</p>
                <form onSubmit={this.handleSubmit}>
                    <p>Firstname:</p>
                    <input type="text" name="firstname" value={this.state.userInput.firstname} onChange={this.handleChange} />
                    <p>Lastname:</p>
                    <input type="text" name="lastname" value={this.state.userInput.lastname} onChange={this.handleChange} />
                    <p>Age:</p>
                    <input type="text" name="age" value={this.state.userInput.age} onChange={this.handleChange} />
                    <p>E-mail:</p>
                    <input type="text" name="email" value={this.state.userInput.email} onChange={this.handleChange} />
                    <p>Password:</p>
                    <input type="text" name="password" value={this.state.userInput.password} onChange={this.handleChange} />
                    <br/>
                    <input type="submit" value="Register"/>
                </form>
            </div>
        );
    }
}

export default Register;