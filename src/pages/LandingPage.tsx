import { Link } from "react-router-dom";

import bg from "../assets/images/landing-bg.jpg";
import logo from "../assets/images/logo-alpha.png";

import "../css/LandingPage.css";

export function LandingPage() {
  return (
    <div className="landing">
      <div
        className="landing-bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="landing-overlay" aria-hidden="true" />

      <header className="landing-top">
        <div className="landing-brand">
          <img className="landing-logo" src={logo} alt="Alpha Steel" />
        </div>

        <Link className="landing-enter-btn" to="/auth">
          <span className="landing-enter-text">Iniciar</span>
        </Link>
      </header>

      <main className="landing-content">
        <h1 className="landing-title">
          <span className="landing-title-emph">Controle</span> seu estoque com
          rapidez e segurança
        </h1>

        <p className="landing-subtitle">
          Gestão de estoque para materiais de construção: produtos,
          matérias-primas e sugestões de produção pelo estoque atual.
        </p>

        <div className="landing-actions">
          <Link className="landing-cta" to="/auth">
            Entrar
          </Link>
        </div>
      </main>
    </div>
  );
}
