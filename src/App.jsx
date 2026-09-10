import { useEffect, useState } from "react";
import {
  Bell,
  Edit3,
  Heart,
  LogIn,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { filterEvents } from "./controllers/eventController";
import { events as initialEvents } from "./models/events";
import { mockUsers } from "./models/users";
import EventCard from "./components/EventCard";
import EventsMap from "./components/EventsMap";
import "./App.css";

const today = new Date("2026-09-09");
const emptyForm = {
  title: "",
  category: "Música",
  location: "Lima",
  venue: "",
  date: "2026-10-01",
  time: "7:00 pm",
  price: "Entrada libre",
  priceValue: 0,
  description: "",
  image:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  officialUrl: "#",
};
const eventStorageKey = "qs-events-v2";

function App() {
  const [allEvents, setAllEvents] = useState(
    () =>
      JSON.parse(localStorage.getItem(eventStorageKey) || "null") ||
      initialEvents,
  );
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Lima");
  const [category, setCategory] = useState("Todos");
  const [showPast, setShowPast] = useState(false);
  const [priceFilter, setPriceFilter] = useState("Todos");
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("qs-favorites") || "[]"),
  );
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("qs-user") || "null"),
  );
  const [view, setView] = useState("explore");
  const [activeEvent, setActiveEvent] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente",
  });
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterOpen, setFilterOpen] = useState(false);
  useEffect(() => {
    localStorage.setItem(eventStorageKey, JSON.stringify(allEvents));
  }, [allEvents]);

  const filtered = filterEvents({
    query,
    location,
    category,
    showPast,
    sourceEvents: allEvents,
  }).filter(
    (event) =>
      priceFilter === "Todos" ||
      (priceFilter === "Gratis"
        ? event.priceValue === 0
        : event.priceValue > 0),
  );
  const featured = allEvents.filter(
    (event) => event.featured && (showPast || new Date(event.date) >= today),
  );
  const favoriteEvents = allEvents.filter((event) =>
    favorites.includes(event.id),
  );
  const navigate = (nextView) => {
    setActiveEvent(null);
    setEventModalOpen(false);
    setView(nextView);
  };
  const toggleFavorite = (id) => {
    if (!user) return setAuthMode("login");
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("qs-favorites", JSON.stringify(next));
  };
  const openEvent = (event) => {
    setActiveEvent(event);
    setView("detail");
  };
  const handleAuth = (event) => {
    event.preventDefault();
    const nextUser = {
      id: Date.now(),
      name: authForm.name || authForm.email.split("@")[0],
      email: authForm.email,
      role: authForm.role,
    };
    const users = JSON.parse(
      localStorage.getItem("qs-users") || JSON.stringify(mockUsers),
    );
    localStorage.setItem(
      "qs-users",
      JSON.stringify([
        ...users.filter((item) => item.email !== nextUser.email),
        nextUser,
      ]),
    );
    setUser(nextUser);
    localStorage.setItem("qs-user", JSON.stringify(nextUser));
    setAuthMode(null);
  };
  const openNewEvent = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEventModalOpen(true);
  };
  const editEvent = (event) => {
    setEditingId(event.id);
    setForm(event);
    setEventModalOpen(true);
  };
  const saveEvent = (event) => {
    event.preventDefault();
    const saved = {
      ...form,
      id: editingId || Date.now(),
      keywords: `${form.title} ${form.category} ${form.location}`,
      dateLabel: new Date(`${form.date}T12:00:00`).toLocaleDateString("es-PE", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      lat:
        form.location === "Cusco"
          ? -13.52
          : form.location === "Arequipa"
            ? -16.4
            : -12.08,
      lng:
        form.location === "Cusco"
          ? -71.97
          : form.location === "Arequipa"
            ? -71.54
            : -77.04,
    };
    setAllEvents((current) =>
      editingId
        ? current.map((item) =>
            item.id === editingId ? { ...item, ...saved } : item,
          )
        : [...current, saved],
    );
    setEventModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const deleteEvent = (id) =>
    setAllEvents((current) => current.filter((event) => event.id !== id));

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("explore")}>
          qué<span>sale</span>
          <i>.</i>
        </button>
        <nav>
          <button
            className={view === "explore" ? "active" : ""}
            onClick={() => navigate("explore")}
          >
            Explorar
          </button>
          <button
            className={view === "map" ? "active" : ""}
            onClick={() => navigate("map")}
          >
            Mapa
          </button>
          <button
            className={view === "favorites" ? "active" : ""}
            onClick={() =>
              user ? navigate("favorites") : setAuthMode("login")
            }
          >
            Mis favoritos{" "}
            <span className="nav-count">{favorites.length || ""}</span>
          </button>
        </nav>
        <div className="top-actions">
          <button className="icon-button" aria-label="Notificaciones">
            <Bell size={19} />
          </button>
          {user ? (
            <button className="profile" onClick={() => navigate("profile")}>
              {user.name.slice(0, 2).toUpperCase()}
            </button>
          ) : (
            <button
              className="login-button"
              onClick={() => setAuthMode("login")}
            >
              <LogIn size={15} /> Entrar
            </button>
          )}
        </div>
      </header>
      <main>
        {view === "explore" && (
          <>
            <section className="hero-section" id="inicio">
              <div className="hero-copy">
                <div className="eyebrow">
                  <Sparkles size={14} /> A tu alrededor, siempre algo pasa
                </div>
                <h1>
                  Tu próximo plan
                  <br />
                  <em>empieza aquí.</em>
                </h1>
                <p>
                  Descubre conciertos, ferias, cultura y experiencias únicas en
                  todo el Perú.
                </p>
              </div>
              <div className="hero-art">
                <div className="art-note">
                  Este
                  <br />
                  <strong>finde</strong>
                  <br />
                  salimos <span>↗</span>
                </div>
                <div className="art-ticket">
                  <small>QUÉ SALE / 2026</small>
                  <b>
                    Vive
                    <br />
                    lo local
                  </b>
                  <div className="ticket-line"></div>
                  <span>PERÚ</span>
                </div>
              </div>
            </section>
            <section className="quick-row">
              <div className="filter-search">
                <Search size={17} />
                <input
                  aria-label="Buscar eventos"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar eventos..."
                />
                {query && (
                  <button
                    aria-label="Limpiar búsqueda"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="location-select">
                <MapPin size={18} />
                <div>
                  <small>Explorando en</small>
                  <select
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    <option>Lima</option>
                    <option>Arequipa</option>
                    <option>Cusco</option>
                    <option>La Libertad</option>
                    <option>Todos</option>
                  </select>
                </div>
              </div>
              <div className="category-pills">
                {[
                  "Todos",
                  "Música",
                  "Cultura",
                  "Gastronomía",
                  "Aire libre",
                ].map((item) => (
                  <button
                    className={category === item ? "pill active" : "pill"}
                    key={item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                className="filter-button"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <SlidersHorizontal size={16} /> Filtros{" "}
                <span className="filter-count">
                  {(showPast ? 1 : 0) + (priceFilter !== "Todos" ? 1 : 0) || ""}
                </span>
              </button>
            </section>
            {filterOpen && (
              <div className="filter-panel">
                <div>
                  <span>Precio</span>
                  <select
                    value={priceFilter}
                    onChange={(event) => setPriceFilter(event.target.value)}
                  >
                    <option>Todos</option>
                    <option>Gratis</option>
                    <option>De pago</option>
                  </select>
                </div>
                <label className="past-toggle">
                  <input
                    type="checkbox"
                    checked={showPast}
                    onChange={(event) => setShowPast(event.target.checked)}
                  />{" "}
                  Ver eventos pasados
                </label>
                <button
                  className="clear-filters"
                  onClick={() => {
                    setPriceFilter("Todos");
                    setShowPast(false);
                    setCategory("Todos");
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
            <section className="featured" id="explorar">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">SELECCIÓN QUÉ SALE</span>
                  <h2>Lo que está sonando</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    document
                      .getElementById("todos")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Ver todos <span>→</span>
                </button>
              </div>
              <div className="featured-grid">
                {featured.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    featured
                    favorites={favorites}
                    onFavorite={toggleFavorite}
                    onOpen={openEvent}
                  />
                ))}
              </div>
            </section>
            <section className="all-events" id="todos">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    {filtered.length} RESULTADOS · ACTUALIZADO AHORA
                  </span>
                  <h2>Planes para hoy y después</h2>
                </div>
                <label className="past-toggle">
                  <input
                    type="checkbox"
                    checked={showPast}
                    onChange={(event) => setShowPast(event.target.checked)}
                  />{" "}
                  Ver eventos pasados
                </label>
              </div>
              <div className="events-grid">
                {filtered.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    favorites={favorites}
                    onFavorite={toggleFavorite}
                    onOpen={openEvent}
                  />
                ))}
              </div>
              {!filtered.length && (
                <div className="empty-state">
                  No encontramos planes con esos filtros. Prueba otra búsqueda.
                </div>
              )}
            </section>
          </>
        )}
        {view === "map" && (
          <section className="page-view">
            <div className="section-heading">
              <div>
                <span className="section-kicker">EXPLORA POR UBICACIÓN</span>
                <h2>Eventos en el mapa</h2>
              </div>
              <button
                className="pill active"
                onClick={() => navigate("explore")}
              >
                Volver a lista
              </button>
            </div>
            <EventsMap
              key={location}
              events={filtered}
              location={location}
              onOpen={openEvent}
            />
          </section>
        )}
        {view === "detail" && activeEvent && (
          <section className="detail-view">
            <button className="back-link" onClick={() => navigate("explore")}>
              ← Volver a explorar
            </button>
            <div className="detail-grid">
              <img src={activeEvent.image} alt="" />
              <div className="detail-copy">
                <span className="section-kicker">
                  {activeEvent.category} · {activeEvent.dateLabel}
                </span>
                <h2>{activeEvent.title}</h2>
                <p className="detail-description">{activeEvent.description}</p>
                <div className="detail-facts">
                  <div>
                    <small>CUÁNDO</small>
                    <strong>
                      {activeEvent.dateLabel} · {activeEvent.time}
                    </strong>
                  </div>
                  <div>
                    <small>DÓNDE</small>
                    <strong>
                      {activeEvent.venue}, {activeEvent.location}
                    </strong>
                  </div>
                  <div>
                    <small>INGRESO</small>
                    <strong>{activeEvent.price}</strong>
                  </div>
                </div>
                <button
                  className="primary-cta"
                  onClick={() => toggleFavorite(activeEvent.id)}
                >
                  {favorites.includes(activeEvent.id)
                    ? "Quitar de favoritos"
                    : "Guardar en favoritos"}
                </button>
                <a
                  className="official-link"
                  href={activeEvent.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ir a la fuente oficial ↗
                </a>
              </div>
            </div>
          </section>
        )}
        {view === "favorites" && (
          <section className="page-view">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  TU COLECCIÓN · {favoriteEvents.length} GUARDADOS
                </span>
                <h2>Mis favoritos</h2>
              </div>
            </div>
            <div className="events-grid">
              {favoriteEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onOpen={openEvent}
                />
              ))}
            </div>
            {!favoriteEvents.length && (
              <div className="empty-state">
                <Heart size={22} /> Aún no has guardado eventos.
              </div>
            )}
          </section>
        )}
        {view === "profile" && user && (
          <section className="page-view">
            <div className="profile-panel">
              <div className="profile-avatar">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="section-kicker">MI PERFIL</span>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <div className="profile-data">
                <div>
                  <small>ROL</small>
                  <strong>
                    {user.role === "proveedor"
                      ? "Proveedor de eventos"
                      : "Cliente / explorador"}
                  </strong>
                </div>
                <div>
                  <small>FAVORITOS</small>
                  <strong>{favorites.length} eventos guardados</strong>
                </div>
                <div>
                  <small>CUENTA</small>
                  <strong>Activa desde hoy</strong>
                </div>
              </div>
              {user.role === "proveedor" && (
                <button
                  className="primary-cta"
                  onClick={() => navigate("provider")}
                >
                  Administrar mis eventos
                </button>
              )}
            </div>
          </section>
        )}
        {view === "provider" && user?.role === "proveedor" && (
          <section className="page-view">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  PANEL DE PROVEEDOR · MOCK
                </span>
                <h2>Mis eventos</h2>
              </div>
              <button className="primary-cta" onClick={openNewEvent}>
                <Plus size={16} /> Nuevo evento
              </button>
            </div>
            <div className="provider-list">
              {allEvents.map((event) => (
                <div className="provider-row" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <small>
                      {event.dateLabel} · {event.location}
                    </small>
                  </div>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Editar"
                      onClick={() => editEvent(event)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      aria-label="Eliminar"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      {eventModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setEventModalOpen(false)}
        >
          <form
            className="event-form-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={saveEvent}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setEventModalOpen(false)}
            >
              <X size={17} />
            </button>
            <span className="section-kicker">
              {editingId ? "EDITAR EVENTO" : "NUEVO EVENTO"}
            </span>
            <h2>
              {editingId ? "Actualiza tu plan." : "Publica un nuevo plan."}
            </h2>
            <div className="modal-form-grid">
              <input
                required
                placeholder="Nombre del evento"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
              <input
                required
                placeholder="Lugar / venue"
                value={form.venue}
                onChange={(event) =>
                  setForm({ ...form, venue: event.target.value })
                }
              />
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                <option>Música</option>
                <option>Cultura</option>
                <option>Gastronomía</option>
                <option>Aire libre</option>
              </select>
              <select
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              >
                <option>Lima</option>
                <option>Arequipa</option>
                <option>Cusco</option>
              </select>
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />
              <input
                placeholder="Precio (ej. Entrada libre)"
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price: event.target.value,
                    priceValue: event.target.value
                      .toLowerCase()
                      .includes("libre")
                      ? 0
                      : 20,
                  })
                }
              />
            </div>
            <button className="primary-cta" type="submit">
              {editingId ? "Actualizar evento" : "Publicar evento"}
            </button>
          </form>
        </div>
      )}
      {authMode && (
        <div className="modal-backdrop">
          <form className="auth-modal" onSubmit={handleAuth}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setAuthMode(null)}
            >
              <X size={17} />
            </button>
            <UserRound size={28} color="#f06f55" />
            <h2>
              {authMode === "login"
                ? "Qué bueno verte."
                : "Únete a los planes."}
            </h2>
            <p>
              {authMode === "login"
                ? "Entra para guardar tus eventos favoritos."
                : "Crea tu cuenta y no te pierdas nada."}
            </p>
            {authMode === "register" && (
              <>
                <input
                  required
                  placeholder="Tu nombre"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, name: event.target.value })
                  }
                />
                <select
                  className="role-select"
                  value={authForm.role}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, role: event.target.value })
                  }
                >
                  <option value="cliente">
                    Soy cliente: quiero descubrir eventos
                  </option>
                  <option value="proveedor">
                    Soy proveedor: quiero publicar eventos
                  </option>
                </select>
              </>
            )}
            <input
              required
              type="email"
              placeholder="Correo electrónico"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
            />
            <input
              required
              type="password"
              placeholder="Contraseña"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
            />
            <button className="primary-cta" type="submit">
              {authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
            <button
              type="button"
              className="switch-auth"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "Ya tengo una cuenta"}
            </button>
          </form>
        </div>
      )}
      <footer>
        <span className="brand">
          qué<span>sale</span>
          <i>.</i>
        </span>
        <span>Eventos que se sienten cerca.</span>
        {user ? (
          <button
            className="footer-link"
            onClick={() => {
              setUser(null);
              localStorage.removeItem("qs-user");
              navigate("explore");
            }}
          >
            Cerrar sesión
          </button>
        ) : (
          <span>Perú · 2026</span>
        )}
      </footer>
    </div>
  );
}

export default App;
