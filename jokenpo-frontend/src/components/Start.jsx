import {NavLink, Link} from 'react-router-dom';
export default function Start({ onCreateGame, onJoinGame }) {
    return (
        <>
            <h2 className="text-3xl font-bold bg-slate-900 rounded p-4 m-4">Joken Po Online</h2>
            <div className="flex flex-col items-center justify-center gap-4">
                <button className="text-2xl" onClick={onCreateGame}>Create Game</button>
                <button className="text-2xl" onClick={onJoinGame}>Join Game</button>
                <Link to="/admin" >
                    <button className="text-2xl">Admin Panel</button>
                </Link>
            </div>
        </>
    )
}
