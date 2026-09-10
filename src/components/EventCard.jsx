import { Heart, MapPin } from 'lucide-react'

export default function EventCard({ event, featured, favorites, onFavorite, onOpen }) {
  const saved = favorites.includes(event.id)
  return <article className={featured ? 'event-card featured-card' : 'event-card'} onClick={() => onOpen(event)}><div className="card-image"><img src={event.image} alt="" /><span className="card-tag">{event.category}</span><button className={saved ? 'save-button saved' : 'save-button'} aria-label="Guardar favorito" onClick={(click) => { click.stopPropagation(); onFavorite(event.id) }}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="card-body"><div className="card-date">{event.dateLabel} <span>·</span> {event.time}</div><h3>{event.title}</h3><div className="card-location"><MapPin size={14} /> {event.venue}, {event.location}</div><div className="card-footer"><strong>{event.price}</strong><span>Ver detalle <b>↗</b></span></div></div></article>
}