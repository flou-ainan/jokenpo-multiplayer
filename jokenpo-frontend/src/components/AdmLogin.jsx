export default function AdmLogin({ handleLogin, password, setPassword, error, setError, apiResponse, setApiResponse }) {
    return (
        <div>
            <h3>Login</h3>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de administrador"
                className="p-2 border rounded-md mr-2"
            />
            <button
                onClick={handleLogin}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
            >Login</button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {apiResponse && <>
                <h4 className="font-bold mt-4">Resposta da API:</h4>
                <pre className="bg-gray-600 p-2 rounded-md mt-2 text-left">
                    {JSON.stringify(apiResponse.error, null, 2)}
                </pre></>}
        </div>
    )
} 