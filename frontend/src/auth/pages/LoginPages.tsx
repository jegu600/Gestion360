
import './LoginPages.css';

export const LoginPages = () => {

    return (
        <div className="fondo-imagen d-flex align-items-center justify-content-center vh-100">
            <div className="login-container p-5 shadow-lg rounded-4 bg-light">
                <h2 className="text-center mb-5 fw-bold text-dark">Login</h2>
                <form>
                    <div className="form-group fs-4">
                        <label className="form-label fw-semibold">Usuario</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Ingresa tu usuario"
                        />
                    </div>

                    <div className="form-group mb-4 fs-4">
                        <label className="form-label fw-semibold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary btn-lg">
                            Iniciar sesión
                        </button>
                    </div>

                    <div className="d-grid mt-5">
                        <h5>
                            <a href="#">Recuperar Contraseña</a>
                        </h5>
                    </div>
                </form>
            </div>
        </div>
    );
}
