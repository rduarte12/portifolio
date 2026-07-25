import { useState } from 'react';

export default function Auth() {

    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'username') {
            setUsername(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const handleEnter = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        
    };

    return (

        <form onSubmit={handleEnter} className="flex-col gap-md" style={{ maxWidth: '400px', margin: 'auto', marginTop: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div className="gap-sm flex-col">
            <label htmlFor="username" className="text-muted" >
                Username:
            </label>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={handleInputChange}
            />
            </div>

            <div className="gap-sm flex-col">
            <label htmlFor="password" className="text-muted">Password:</label>
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleInputChange}
            />
            </div>
            
            <button type="submit" className="btn btn-primary">Enter</button>
        </form>
    )

}