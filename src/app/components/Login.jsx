import React, { useState } from 'react';
import pb from '../lib/pocketbase';

export default function Login({ onLoginSuccess }) {  // Alterado para onLoginSuccess
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');

        try {
            const authData = await pb.collection('users').authWithPassword(email, senha);
            onLoginSuccess(authData.record);  // Chama a função passada como prop
        } catch (error) {
            console.error("Erro de login:", error);
            setErro(error.message || "Credenciais inválidas");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '2rem auto',
            padding: '2rem',
            border: '1px solid #ddd',
            borderRadius: '8px'
        }}>
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            {erro && <div style={{ color: 'red', marginBottom: '1rem' }}>{erro}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={carregando}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: carregando ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: carregando ? 'not-allowed' : 'pointer'
                    }}
                >
                    {carregando ? 'Carregando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}