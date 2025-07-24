import {Link} from 'react-router-dom';
import {useState} from 'react';
import AdminLogin from '../components/AdmLogin.jsx';
import AdminPanel from '../components/AdminPanel.jsx';

// A URL do seu servidor Express
// IMPORTANTE: Para deploy na VM, você precisa configurar VITE_SERVER_URL
// no seu arquivo .env.production (ou .env) do Vite.
// Ex: VITE_SERVER_URL=http://SEU_IP_EXTERNO_DA_VM:3000
const serverUrl = import.meta.env.VITE_SERVER_URL || "" || 'http://localhost:3000';

export default function Admin() {
    console.log(serverUrl)
    const [password, setPassword] = useState('');
    const [pageState, setPageState] = useState('login');
    const [apiResponse, setApiResponse] = useState(null); // Para armazenar a resposta da API
    const [error, setError] = useState(null); // Para armazenar erros

    function stateHandler(){
        switch(pageState){
            case 'login':
                return (<AdminLogin handleLogin={handleLogin}
                                    password={password}
                                    setPassword={setPassword}
                                    error={error}
                                    setError={setError}  
                                    setApiResponse={setApiResponse}
                                    apiResponse={apiResponse}
                                    />);
            case 'admin':
                return (<AdminPanel apiResponse={apiResponse}
                                    setApiResponse={setApiResponse}
                                    error={error}
                                    handleLogin={handleLogin}
                                    password={password}
                                    serverUrl={serverUrl}
                                    />);
            default:
                return null;
        }
    }

    async function handleLogin() {
        setError(null); // Limpa erros anteriores
        setApiResponse(null); // Limpa respostas anteriores

        try {
            const response = await fetch(serverUrl+'/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userPassword: password }),
            });

            const data = await response.json(); // Tenta parsear a resposta JSON de qualquer forma
            setApiResponse(data); // Armazena a resposta para exibição

            if (response.ok) {
                setPageState('admin');
            } else {
                // Se a resposta não for OK (ex: 401, 404, 500)
                setError(data.error || `Erro do servidor: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Erro de conexão ou resposta inválida do servidor. Verifique o console para detalhes.');
            // alert("Erro de rede ou resposta inválida do servidor.\n" + err.message); // Remova alerts em produção
        }
    }

    return (
        <div className="admin-panel p-10 bg-gray-800 rounded-lg shadow-lg max-w-lg mx-auto mt-10">
            <h2 className="text-3xl font-bold bg-slate-900 text-white rounded-md p-4 mb-6">Painel de Administração</h2>
            {stateHandler()}
            <br />
            <Link to="/">
                <button className="bg-red-700 text-white p-2 rounded-md text-lg hover:bg-red-800">Voltar para a Página Inicial</button>
            </Link>
        </div>
    );
}
