import { Title, Text, Button, Banner, IconSparkle } from 'ui-kit'

/**
 * Point de départ d'un proto. Copie le dossier `_template`, renomme-le
 * (le nom du dossier = le slug de l'URL : /p/<slug>), adapte `meta.ts`,
 * et construis ta maquette ici avec les composants de `ui-kit`.
 *
 * Astuce : ouvre /gallery pour voir tous les composants disponibles.
 */
const Proto = () => {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <Title size="h2" prefixIcon={IconSparkle}>
        Nouveau proto
      </Title>
      <div style={{ margin: '4px 0 24px' }}>
        <Text color="secondary">
          Remplace ce contenu par ta maquette.
        </Text>
      </div>

      <Banner
        variant="primary"
        description="Tout ui-kit est dispo — voir /gallery pour la liste."
      />

      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        <Button color="primary">Action principale</Button>
        <Button color="secondary">Action secondaire</Button>
      </div>
    </div>
  )
}

export default Proto
