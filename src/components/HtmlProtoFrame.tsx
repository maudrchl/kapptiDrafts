import { type CSSProperties } from 'react'
import ProtoFrame from './ProtoFrame'

/**
 * Héberge une archive HTML legacy (servie depuis `/public/folder/…`) dans une
 * iframe plein écran, enveloppée par `ProtoFrame`. On récupère ainsi TOUTE la
 * couche collab (présence, commentaires épinglés, historique, partage) sans la
 * réimplémenter : elle vit dans la page React parente, au-dessus de l'iframe.
 *
 * Ancrage des commentaires : l'iframe porte `data-anchor="html:<slug>"`. Le
 * `captureAnchor` de la couche pins ancre alors les marqueurs à la boîte de
 * l'iframe (position relative 0..1) → ils suivent resize / repositionnement.
 * Limite connue : le scroll INTERNE de l'iframe n'est pas suivi (les mockups
 * HTML sont plein écran), acceptable pour ces archives.
 */
const HtmlProtoFrame = ({
  slug,
  title,
  href,
  scoped = false,
}: {
  slug: string
  title: string
  /** Chemin du fichier HTML (ex. `/folder/Exploration UI.html`). */
  href: string
  scoped?: boolean
}) => (
  <ProtoFrame title={title} slug={slug} scoped={scoped} noCode noShare>
    <iframe
      src={encodeURI(href)}
      title={title}
      data-anchor={`html:${slug}`}
      style={styles.frame}
    />
  </ProtoFrame>
)

const styles: Record<string, CSSProperties> = {
  frame: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#fff',
  },
}

export default HtmlProtoFrame
