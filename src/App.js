import React, { useState } from "react";
import axios from "axios";
import './App.css';

// Componente de Login
function Login({ onLogin, onSwitchToRegister }) {
    const [ra, setRA] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("https://backend-aula.vercel.app/app/login", {
                usuario: ra,
                senha: senha
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                onLogin(ra);
            } else {
                setError("Erro de login. Verifique suas credenciais.");
            }
        } catch (err) {
            console.log("Erro no login:", err.response?.data || err.message);
            setError("Erro no login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-section">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                placeholder="RA"
                value={ra}
                onChange={(e) => setRA(e.target.value)}
            />
            <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
            />
            <button className="login-button" onClick={handleLogin} disabled={loading}>
                {loading ? "Entrando..." : "Login"}
            </button>
            <p>
                Não tem uma conta? <button className="register-button" onClick={onSwitchToRegister}>Registrar</button>
            </p>
        </div>
    );
}

// Componente de Registro
function Register({ onRegister }) {
    const [ra, setRA] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setLoading(true);
        setError("");

        if (senha !== confirmSenha) {
            setError("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("https://backend-aula.vercel.app/app/registrar", {
                usuario: ra,
                senha: senha,
                confirma: confirmSenha
            });

            if (response.data._id) {
                onRegister();
            } else {
                setError(response.data.error || "Erro no cadastro.");
            }
        } catch (err) {
            console.log("Erro ao cadastrar:", err.response?.data || err.message);
            setError("Erro ao cadastrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-section">
            <h2>Registro</h2>
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                placeholder="RA"
                value={ra}
                onChange={(e) => setRA(e.target.value)}
            />
            <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirmar Senha"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
            />
            <button className="login-button" onClick={handleRegister} disabled={loading}>
                {loading ? "Cadastrando..." : "Registrar"}
            </button>
        </div>
    );
}

// Componente de Produtos
function Products() {
    const [produtos, setProdutos] = useState([]);
    const [view, setView] = useState("");
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [preco, setPreco] = useState("");
    const [descricao, setDescricao] = useState("");
    const [imagem, setImagem] = useState("");
    const [idEditando, setIdEditando] = useState(null);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchProdutos = async () => {
        try {
            const response = await axios.get("https://backend-aula.vercel.app/app/produtos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProdutos(response.data);
            setView("listar");
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setError("Erro ao buscar produtos.");
        }
    };

    const clearForm = () => {
        setNome("");
        setQuantidade("");
        setPreco("");
        setDescricao("");
        setImagem("");
        setIdEditando(null);
        setError("");
    };

    const handleAddClick = () => {
        setView("adicionar");
        clearForm();
    };

    const handleListClick = () => {
        fetchProdutos();
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete("https://backend-aula.vercel.app/app/produtos", {
                data: { id: id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProdutos(produtos.filter((produto) => produto._id !== id));
        } catch (err) {
            console.error("Erro ao deletar produto:", err);
            setError("Erro ao deletar produto.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const produto = {
            id: idEditando,
            nome,
            quantidade,
            preco,
            descricao,
            imagem,
        };

        try {
            if (idEditando) {
                await axios.put("https://backend-aula.vercel.app/app/produtos", produto, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProdutos(produtos.map((p) => (p._id === idEditando ? { ...p, ...produto } : p)));
            } else {
                const response = await axios.post("https://backend-aula.vercel.app/app/produtos", produto, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProdutos([...produtos, response.data]);
            }
            clearForm();
            setView("");
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            setError("Erro ao salvar produto.");
        }
    };

    return (
        <div className="products-section">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="view-selector">
                {view === "" && (
                    <div className="button-container">
                        <div className="button-card">
                            <button onClick={handleAddClick} className="button">Adicionar</button>
                        </div>
                        <div className="button-card">
                            <button onClick={handleListClick} className="button">Listar</button>
                        </div>
                    </div>
                )}
            </div>
            {view === "listar" && produtos.length > 0 && (
                <div className="product-list">
                    <h3>Produtos Cadastrados:</h3>
                    <div className="product-grid">
                        {produtos.map((produto) => (
                            <div key={produto._id} className="product-card">
                                <div className="product-details">
                                    <p className="product-name"><strong>{produto.nome}</strong></p>
                                    <p className="product-quantity">Quantidade: {produto.quantidade}</p>
                                    <p className="product-price">Preço: R$ {produto.preco}</p>
                                    <p className="product-description">{produto.descricao}</p>
                                </div>
                                <div className="button-group">
                                    <button className="action-button edit-button" onClick={() => {
                                        setNome(produto.nome);
                                        setQuantidade(produto.quantidade);
                                        setPreco(produto.preco);
                                        setDescricao(produto.descricao);
                                        setImagem(produto.imagem);
                                        setIdEditando(produto._id);
                                        setView("adicionar");
                                    }}>Editar</button>
                                    <button className="action-button delete-button" onClick={() => handleDelete(produto._id)}>Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="back-button" onClick={() => setView("")}>Voltar</button>
                </div>
            )}
            {view === "adicionar" && (
                <form onSubmit={handleSubmit} className="add-form">
                    <h2>Adicionar Produto</h2>
                    <div className="input-group">
                        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="styled-input" />
                        <input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required className="styled-input" />
                        <input type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} required className="styled-input" />
                        <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="styled-input" />
                        <input type="text" placeholder="URL da Imagem" value={imagem} onChange={(e) => setImagem(e.target.value)} className="styled-input" />
                    </div>
                    <button type="submit" className="add-product-button">{idEditando ? "Salvar Alterações" : "Adicionar Produto"}</button>
                    <button className="back-button" type="button" onClick={() => setView("")}>Voltar</button>
                </form>
            )}
        </div>
    );
}

// Componente principal
function App() {
    const [view, setView] = useState("login");

    const handleLogin = () => {
        setView("produtos");
    };

    const handleRegister = () => {
        setView("login");
    };

    const handleSwitchToRegister = () => {
        setView("register");
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="navbar-options">
                    <button className={view === "login" ? "active" : ""} onClick={() => setView("login")}>Login</button>
                    <button className={view === "register" ? "active" : ""} onClick={() => setView("register")}>Registrar</button>
                    <button className={view === "produtos" ? "active" : ""} onClick={() => setView("produtos")}>Produtos</button>
                </div>
            </nav>
            <div className="content">
                {view === "login" && <Login onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />}
                {view === "register" && <Register onRegister={handleRegister} />}
                {view === "produtos" && <Products />}
            </div>
        </div>
    );
}

export default App;
