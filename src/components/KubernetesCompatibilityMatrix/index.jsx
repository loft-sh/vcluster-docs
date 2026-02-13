import styles from './styles.module.css';
import compatibilityData from '@site/static/api/k8s-compatibility.json';

const statusConfig = {
  tested: { emoji: '\u2705', label: 'Tested and verified' },
  compatible: { emoji: '\uD83C\uDD97', label: 'Likely compatible' },
};

const KubernetesCompatibilityMatrix = () => {
  const { kubernetesVersions, matrix, statuses } = compatibilityData;

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
                const status = row.vcluster[vclusterVersion];
                const config = statusConfig[status] || statusConfig.compatible;
                return (
                  <td key={vclusterVersion} className={styles.statusCell} title={config.label}>
                    {config.emoji}
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
    </>
  );
};

export default KubernetesCompatibilityMatrix;
