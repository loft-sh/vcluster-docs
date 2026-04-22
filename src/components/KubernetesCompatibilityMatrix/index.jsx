import styles from './styles.module.css';
import compatibilityData from '@site/static/api/k8s-compatibility.json';

function renderText(text) {
  const parts = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<a key={match.index} href={match[2]}>{match[1]}</a>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function parseCell(cell) {
  if (typeof cell === 'object' && cell !== null) {
    return { status: cell.status, noteId: cell.note };
  }
  return { status: cell, noteId: null };
}

const KubernetesCompatibilityMatrix = () => {
  const { kubernetesVersions, matrix, statuses, notes = [] } = compatibilityData;

  return (
    <>
      <table className={styles.matrixTable}>
        <thead>
          <tr>
            <th rowSpan="2">Host Cluster Kubernetes Version</th>
            <th colSpan={kubernetesVersions.length}>vCluster Kubernetes Version</th>
          </tr>
          <tr>
            {kubernetesVersions.map((version) => (
              <th key={version}>v{version}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.host}>
              <td><b>v{row.host}</b></td>
              {kubernetesVersions.map((vclusterVersion) => {
                const { status, noteId } = parseCell(row.vcluster[vclusterVersion]);
                const config = statuses[status] || statuses.compatible;
                return (
                  <td key={vclusterVersion} className={styles.statusCell} title={config.label}>
                    {config.emoji}
                    {noteId && <sup className={styles.noteRef}>{noteId}</sup>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className={styles.legend}>
        {Object.entries(statuses).map(([key, { emoji, label, description }]) => (
          <li key={key}>
            {emoji} <b>{label}</b> &ndash; {description}
          </li>
        ))}
      </ul>

      {notes.length > 0 && (
        <ol className={styles.notes}>
          {notes.map((note) => (
            <li key={note.id} value={note.id}>{renderText(note.text)}</li>
          ))}
        </ol>
      )}
    </>
  );
};

export default KubernetesCompatibilityMatrix;
