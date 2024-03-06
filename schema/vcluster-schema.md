# Schema Docs

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Config                                          |

<details>
<summary>
<strong> <a name="exportKubeConfig"></a>1. [Optional] Property root > exportKubeConfig</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExportKubeConfig                                |

<details>
<summary>
<strong> <a name="exportKubeConfig_context"></a>1.1. [Optional] Property root > exportKubeConfig > context</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="exportKubeConfig_server"></a>1.2. [Optional] Property root > exportKubeConfig > server</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="exportKubeConfig_secret"></a>1.3. [Optional] Property root > exportKubeConfig > secret</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SecretReference                                 |

**Description:** SecretReference represents a Secret Reference.

<details>
<summary>
<strong> <a name="exportKubeConfig_secret_name"></a>1.3.1. [Optional] Property root > exportKubeConfig > secret > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** name is unique within a namespace to reference a secret resource.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="exportKubeConfig_secret_namespace"></a>1.3.2. [Optional] Property root > exportKubeConfig > secret > namespace</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** namespace defines the space within which the secret name must be unique.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync"></a>2. [Optional] Property root > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Sync                                            |

<details>
<summary>
<strong> <a name="sync_ToHost"></a>2.1. [Optional] Property root > sync > ToHost</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncToHost                                      |

<details>
<summary>
<strong> <a name="sync_ToHost_services"></a>2.1.1. [Optional] Property root > sync > ToHost > services</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_services_enabled"></a>2.1.1.1. [Optional] Property root > sync > ToHost > services > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_endpoints"></a>2.1.2. [Optional] Property root > sync > ToHost > endpoints</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_endpoints_enabled"></a>2.1.2.1. [Optional] Property root > sync > ToHost > endpoints > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_ingresses"></a>2.1.3. [Optional] Property root > sync > ToHost > ingresses</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_ingresses_enabled"></a>2.1.3.1. [Optional] Property root > sync > ToHost > ingresses > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_priorityClasses"></a>2.1.4. [Optional] Property root > sync > ToHost > priorityClasses</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_priorityClasses_enabled"></a>2.1.4.1. [Optional] Property root > sync > ToHost > priorityClasses > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_networkPolicies"></a>2.1.5. [Optional] Property root > sync > ToHost > networkPolicies</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_networkPolicies_enabled"></a>2.1.5.1. [Optional] Property root > sync > ToHost > networkPolicies > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_volumeSnapshots"></a>2.1.6. [Optional] Property root > sync > ToHost > volumeSnapshots</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_volumeSnapshots_enabled"></a>2.1.6.1. [Optional] Property root > sync > ToHost > volumeSnapshots > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_podDisruptionBudgets"></a>2.1.7. [Optional] Property root > sync > ToHost > podDisruptionBudgets</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_podDisruptionBudgets_enabled"></a>2.1.7.1. [Optional] Property root > sync > ToHost > podDisruptionBudgets > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_serviceAccounts"></a>2.1.8. [Optional] Property root > sync > ToHost > serviceAccounts</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_serviceAccounts_enabled"></a>2.1.8.1. [Optional] Property root > sync > ToHost > serviceAccounts > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_storageClasses"></a>2.1.9. [Optional] Property root > sync > ToHost > storageClasses</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_storageClasses_enabled"></a>2.1.9.1. [Optional] Property root > sync > ToHost > storageClasses > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_persistentVolumes"></a>2.1.10. [Optional] Property root > sync > ToHost > persistentVolumes</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_persistentVolumes_enabled"></a>2.1.10.1. [Optional] Property root > sync > ToHost > persistentVolumes > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_persistentVolumeClaims"></a>2.1.11. [Optional] Property root > sync > ToHost > persistentVolumeClaims</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_ToHost_persistentVolumeClaims_enabled"></a>2.1.11.1. [Optional] Property root > sync > ToHost > persistentVolumeClaims > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_configMaps"></a>2.1.12. [Optional] Property root > sync > ToHost > configMaps</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncAllResource                                 |

<details>
<summary>
<strong> <a name="sync_ToHost_configMaps_enabled"></a>2.1.12.1. [Optional] Property root > sync > ToHost > configMaps > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_secrets"></a>2.1.13. [Optional] Property root > sync > ToHost > secrets</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncAllResource                                 |

<details>
<summary>
<strong> <a name="sync_ToHost_secrets_enabled"></a>2.1.13.1. [Optional] Property root > sync > ToHost > secrets > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods"></a>2.1.14. [Optional] Property root > sync > ToHost > pods</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncPods                                        |

<details>
<summary>
<strong> <a name="sync_ToHost_pods_enabled"></a>2.1.14.1. [Optional] Property root > sync > ToHost > pods > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_workloadServiceAccount"></a>2.1.14.2. [Optional] Property root > sync > ToHost > pods > workloadServiceAccount</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_translateImage"></a>2.1.14.3. [Optional] Property root > sync > ToHost > pods > translateImage</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                  |
| **Required**              | No                                                                                                                                        |
| **Additional properties** | [[Should-conform]](#sync_ToHost_pods_translateImage_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="sync_ToHost_pods_translateImage_additionalProperties"></a>2.1.14.3.1. Property root > sync > ToHost > pods > translateImage > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_enforceTolerations"></a>2.1.14.4. [Optional] Property root > sync > ToHost > pods > enforceTolerations</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** validate format

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                        | Description |
| ---------------------------------------------------------------------- | ----------- |
| [enforceTolerations items](#sync_ToHost_pods_enforceTolerations_items) | -           |

##### <a name="autogenerated_heading_2"></a>2.1.14.4.1. root > sync > ToHost > pods > enforceTolerations > enforceTolerations items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_useSecretsForSATokens"></a>2.1.14.5. [Optional] Property root > sync > ToHost > pods > useSecretsForSATokens</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_rewriteHosts"></a>2.1.14.6. [Optional] Property root > sync > ToHost > pods > rewriteHosts</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncRewriteHosts                                |

<details>
<summary>
<strong> <a name="sync_ToHost_pods_rewriteHosts_enabled"></a>2.1.14.6.1. [Optional] Property root > sync > ToHost > pods > rewriteHosts > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_ToHost_pods_rewriteHosts_initContainerImage"></a>2.1.14.6.2. [Optional] Property root > sync > ToHost > pods > rewriteHosts > initContainerImage</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost"></a>2.2. [Optional] Property root > sync > FromHost</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncFromHost                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_csiDrivers"></a>2.2.1. [Optional] Property root > sync > FromHost > csiDrivers</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_csiDrivers_enabled"></a>2.2.1.1. [Optional] Property root > sync > FromHost > csiDrivers > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_csiNodes"></a>2.2.2. [Optional] Property root > sync > FromHost > csiNodes</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_csiNodes_enabled"></a>2.2.2.1. [Optional] Property root > sync > FromHost > csiNodes > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_csiStorageCapacities"></a>2.2.3. [Optional] Property root > sync > FromHost > csiStorageCapacities</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_csiStorageCapacities_enabled"></a>2.2.3.1. [Optional] Property root > sync > FromHost > csiStorageCapacities > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_ingressClasses"></a>2.2.4. [Optional] Property root > sync > FromHost > ingressClasses</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_ingressClasses_enabled"></a>2.2.4.1. [Optional] Property root > sync > FromHost > ingressClasses > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_events"></a>2.2.5. [Optional] Property root > sync > FromHost > events</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_events_enabled"></a>2.2.5.1. [Optional] Property root > sync > FromHost > events > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_storageClasses"></a>2.2.6. [Optional] Property root > sync > FromHost > storageClasses</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_storageClasses_enabled"></a>2.2.6.1. [Optional] Property root > sync > FromHost > storageClasses > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_nodes"></a>2.2.7. [Optional] Property root > sync > FromHost > nodes</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncNodes                                       |

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real"></a>2.2.7.1. [Optional] Property root > sync > FromHost > nodes > real</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncRealNodes                                   |

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_enabled"></a>2.2.7.1.1. [Optional] Property root > sync > FromHost > nodes > real > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_syncLabelsTaints"></a>2.2.7.1.2. [Optional] Property root > sync > FromHost > nodes > real > syncLabelsTaints</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_clearImageStatus"></a>2.2.7.1.3. [Optional] Property root > sync > FromHost > nodes > real > clearImageStatus</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_selector"></a>2.2.7.1.4. [Optional] Property root > sync > FromHost > nodes > real > selector</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncNodeSelector                                |

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_selector_label"></a>2.2.7.1.4.1. [Optional] Property root > sync > FromHost > nodes > real > selector > label</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                          |
| **Required**              | No                                                                                                                                                |
| **Additional properties** | [[Should-conform]](#sync_FromHost_nodes_real_selector_label_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_real_selector_label_additionalProperties"></a>2.2.7.1.4.1.1. Property root > sync > FromHost > nodes > real > selector > label > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_pseudo"></a>2.2.7.2. [Optional] Property root > sync > FromHost > nodes > pseudo</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="sync_FromHost_nodes_pseudo_enabled"></a>2.2.7.2.1. [Optional] Property root > sync > FromHost > nodes > pseudo > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="observability"></a>3. [Optional] Property root > observability</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Observability                                   |

<details>
<summary>
<strong> <a name="observability_serviceMonitor"></a>3.1. [Optional] Property root > observability > serviceMonitor</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="observability_serviceMonitor_enabled"></a>3.1.1. [Optional] Property root > observability > serviceMonitor > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="observability_metrics"></a>3.2. [Optional] Property root > observability > metrics</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ObservabilityMetrics                            |

<details>
<summary>
<strong> <a name="observability_metrics_proxy"></a>3.2.1. [Optional] Property root > observability > metrics > proxy</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/MetricsProxy                                    |

<details>
<summary>
<strong> <a name="observability_metrics_proxy_nodes"></a>3.2.1.1. [Optional] Property root > observability > metrics > proxy > nodes</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="observability_metrics_proxy_nodes_enabled"></a>3.2.1.1.1. [Optional] Property root > observability > metrics > proxy > nodes > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="observability_metrics_proxy_pods"></a>3.2.1.2. [Optional] Property root > observability > metrics > proxy > pods</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="observability_metrics_proxy_pods_enabled"></a>3.2.1.2.1. [Optional] Property root > observability > metrics > proxy > pods > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking"></a>4. [Optional] Property root > networking</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Networking                                      |

<details>
<summary>
<strong> <a name="networking_replicateServices"></a>4.1. [Optional] Property root > networking > replicateServices</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ReplicateServices                               |

<details>
<summary>
<strong> <a name="networking_replicateServices_toHost"></a>4.1.1. [Optional] Property root > networking > replicateServices > toHost</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ServiceMapping                                  |

<details>
<summary>
<strong> <a name="networking_replicateServices_toHost_from"></a>4.1.1.1. [Optional] Property root > networking > replicateServices > toHost > from</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_replicateServices_toHost_to"></a>4.1.1.2. [Optional] Property root > networking > replicateServices > toHost > to</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_replicateServices_fromHost"></a>4.1.2. [Optional] Property root > networking > replicateServices > fromHost</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ServiceMapping                                  |

<details>
<summary>
<strong> <a name="networking_replicateServices_fromHost_from"></a>4.1.2.1. [Optional] Property root > networking > replicateServices > fromHost > from</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_replicateServices_fromHost_to"></a>4.1.2.2. [Optional] Property root > networking > replicateServices > fromHost > to</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_resolveServices"></a>4.2. [Optional] Property root > networking > resolveServices</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResolveServices                                 |

<details>
<summary>
<strong> <a name="networking_resolveServices_service"></a>4.2.1. [Optional] Property root > networking > resolveServices > service</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_resolveServices_target"></a>4.2.2. [Optional] Property root > networking > resolveServices > target</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResolveServiceTarget                            |

<details>
<summary>
<strong> <a name="networking_resolveServices_target_vcluster"></a>4.2.2.1. [Optional] Property root > networking > resolveServices > target > vcluster</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResolveServiceService                           |

<details>
<summary>
<strong> <a name="networking_resolveServices_target_vcluster_service"></a>4.2.2.1.1. [Optional] Property root > networking > resolveServices > target > vcluster > service</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_resolveServices_target_host"></a>4.2.2.2. [Optional] Property root > networking > resolveServices > target > host</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResolveServiceService                           |

<details>
<summary>
<strong> <a name="networking_resolveServices_target_host_service"></a>4.2.2.2.1. [Optional] Property root > networking > resolveServices > target > host > service</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_resolveServices_target_external"></a>4.2.2.3. [Optional] Property root > networking > resolveServices > target > external</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResolveServiceHostname                          |

<details>
<summary>
<strong> <a name="networking_resolveServices_target_external_hostname"></a>4.2.2.3.1. [Optional] Property root > networking > resolveServices > target > external > hostname</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_advanced"></a>4.3. [Optional] Property root > networking > advanced</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/NetworkingAdvanced                              |

<details>
<summary>
<strong> <a name="networking_advanced_clusterDomain"></a>4.3.1. [Optional] Property root > networking > advanced > clusterDomain</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_advanced_fallback"></a>4.3.2. [Optional] Property root > networking > advanced > fallback</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                           | Description |
| --------------------------------------------------------- | ----------- |
| [NetworkDNSFallback](#networking_advanced_fallback_items) | -           |

##### <a name="autogenerated_heading_3"></a>4.3.2.1. root > networking > advanced > fallback > NetworkDNSFallback

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/NetworkDNSFallback                              |

<details>
<summary>
<strong> <a name="networking_advanced_fallback_items_ip"></a>4.3.2.1.1. [Optional] Property root > networking > advanced > fallback > fallback items > ip</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_advanced_fallback_items_hostCluster"></a>4.3.2.1.2. [Optional] Property root > networking > advanced > fallback > fallback items > hostCluster</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_advanced_proxyKubelets"></a>4.3.3. [Optional] Property root > networking > advanced > proxyKubelets</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/NetworkProxyKubelets                            |

<details>
<summary>
<strong> <a name="networking_advanced_proxyKubelets_byHostname"></a>4.3.3.1. [Optional] Property root > networking > advanced > proxyKubelets > byHostname</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="networking_advanced_proxyKubelets_byIP"></a>4.3.3.2. [Optional] Property root > networking > advanced > proxyKubelets > byIP</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin"></a>5. [Optional] Property root > plugin</strong>  

</summary>
<blockquote>

|                           |                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                         |
| **Required**              | No                                                                                                               |
| **Additional properties** | [[Should-conform]](#plugin_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="plugin_additionalProperties"></a>5.1. Property root > plugin > Plugin</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Plugin                                          |

<details>
<summary>
<strong> <a name="plugin_additionalProperties_image"></a>5.1.1. [Optional] Property root > plugin > additionalProperties > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_config"></a>5.1.2. [Optional] Property root > plugin > additionalProperties > config</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac"></a>5.1.3. [Optional] Property root > plugin > additionalProperties > rbac</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PluginsRBAC                                     |

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role"></a>5.1.3.1. [Optional] Property root > plugin > additionalProperties > rbac > role</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                | Description |
| -------------------------------------------------------------- | ----------- |
| [RBACPolicyRule](#plugin_additionalProperties_rbac_role_items) | -           |

##### <a name="autogenerated_heading_4"></a>5.1.3.1.1. root > plugin > additionalProperties > rbac > role > RBACPolicyRule

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACPolicyRule                                  |

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role_items_verbs"></a>5.1.3.1.1.1. [Optional] Property root > plugin > additionalProperties > rbac > role > role items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs is a list of Verbs that apply to ALL the ResourceKinds contained in this rule. '*' represents all verbs.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                         | Description |
| ----------------------------------------------------------------------- | ----------- |
| [verbs items](#plugin_additionalProperties_rbac_role_items_verbs_items) | -           |

##### <a name="autogenerated_heading_5"></a>5.1.3.1.1.1.1. root > plugin > additionalProperties > rbac > role > role items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role_items_apiGroups"></a>5.1.3.1.1.2. [Optional] Property root > plugin > additionalProperties > rbac > role > role items > apiGroups</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
the enumerated resources in any API group will be allowed. "" represents the core API group and "*" represents all API groups.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                 | Description |
| ------------------------------------------------------------------------------- | ----------- |
| [apiGroups items](#plugin_additionalProperties_rbac_role_items_apiGroups_items) | -           |

##### <a name="autogenerated_heading_6"></a>5.1.3.1.1.2.1. root > plugin > additionalProperties > rbac > role > role items > apiGroups > apiGroups items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role_items_resources"></a>5.1.3.1.1.3. [Optional] Property root > plugin > additionalProperties > rbac > role > role items > resources</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Resources is a list of resources this rule applies to. '*' represents all resources.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                 | Description |
| ------------------------------------------------------------------------------- | ----------- |
| [resources items](#plugin_additionalProperties_rbac_role_items_resources_items) | -           |

##### <a name="autogenerated_heading_7"></a>5.1.3.1.1.3.1. root > plugin > additionalProperties > rbac > role > role items > resources > resources items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role_items_resourceNames"></a>5.1.3.1.1.4. [Optional] Property root > plugin > additionalProperties > rbac > role > role items > resourceNames</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [resourceNames items](#plugin_additionalProperties_rbac_role_items_resourceNames_items) | -           |

##### <a name="autogenerated_heading_8"></a>5.1.3.1.1.4.1. root > plugin > additionalProperties > rbac > role > role items > resourceNames > resourceNames items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_role_items_nonResourceURLs"></a>5.1.3.1.1.5. [Optional] Property root > plugin > additionalProperties > rbac > role > role items > nonResourceURLs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** NonResourceURLs is a set of partial urls that a user should have access to.  *s are allowed, but only as the full, final step in the path
Since non-resource URLs are not namespaced, this field is only applicable for ClusterRoles referenced from a ClusterRoleBinding.
Rules can either apply to API resources (such as "pods" or "secrets") or non-resource URL paths (such as "/api"),  but not both.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                             | Description |
| ------------------------------------------------------------------------------------------- | ----------- |
| [nonResourceURLs items](#plugin_additionalProperties_rbac_role_items_nonResourceURLs_items) | -           |

##### <a name="autogenerated_heading_9"></a>5.1.3.1.1.5.1. root > plugin > additionalProperties > rbac > role > role items > nonResourceURLs > nonResourceURLs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole"></a>5.1.3.2. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                       | Description |
| --------------------------------------------------------------------- | ----------- |
| [RBACPolicyRule](#plugin_additionalProperties_rbac_clusterRole_items) | -           |

##### <a name="autogenerated_heading_10"></a>5.1.3.2.1. root > plugin > additionalProperties > rbac > clusterRole > RBACPolicyRule

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACPolicyRule                                  |

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole_items_verbs"></a>5.1.3.2.1.1. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs is a list of Verbs that apply to ALL the ResourceKinds contained in this rule. '*' represents all verbs.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                | Description |
| ------------------------------------------------------------------------------ | ----------- |
| [verbs items](#plugin_additionalProperties_rbac_clusterRole_items_verbs_items) | -           |

##### <a name="autogenerated_heading_11"></a>5.1.3.2.1.1.1. root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole_items_apiGroups"></a>5.1.3.2.1.2. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > apiGroups</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
the enumerated resources in any API group will be allowed. "" represents the core API group and "*" represents all API groups.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                        | Description |
| -------------------------------------------------------------------------------------- | ----------- |
| [apiGroups items](#plugin_additionalProperties_rbac_clusterRole_items_apiGroups_items) | -           |

##### <a name="autogenerated_heading_12"></a>5.1.3.2.1.2.1. root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > apiGroups > apiGroups items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole_items_resources"></a>5.1.3.2.1.3. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > resources</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Resources is a list of resources this rule applies to. '*' represents all resources.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                        | Description |
| -------------------------------------------------------------------------------------- | ----------- |
| [resources items](#plugin_additionalProperties_rbac_clusterRole_items_resources_items) | -           |

##### <a name="autogenerated_heading_13"></a>5.1.3.2.1.3.1. root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > resources > resources items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole_items_resourceNames"></a>5.1.3.2.1.4. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > resourceNames</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                | Description |
| ---------------------------------------------------------------------------------------------- | ----------- |
| [resourceNames items](#plugin_additionalProperties_rbac_clusterRole_items_resourceNames_items) | -           |

##### <a name="autogenerated_heading_14"></a>5.1.3.2.1.4.1. root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > resourceNames > resourceNames items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_rbac_clusterRole_items_nonResourceURLs"></a>5.1.3.2.1.5. [Optional] Property root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > nonResourceURLs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** NonResourceURLs is a set of partial urls that a user should have access to.  *s are allowed, but only as the full, final step in the path
Since non-resource URLs are not namespaced, this field is only applicable for ClusterRoles referenced from a ClusterRoleBinding.
Rules can either apply to API resources (such as "pods" or "secrets") or non-resource URL paths (such as "/api"),  but not both.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                    | Description |
| -------------------------------------------------------------------------------------------------- | ----------- |
| [nonResourceURLs items](#plugin_additionalProperties_rbac_clusterRole_items_nonResourceURLs_items) | -           |

##### <a name="autogenerated_heading_15"></a>5.1.3.2.1.5.1. root > plugin > additionalProperties > rbac > clusterRole > clusterRole items > nonResourceURLs > nonResourceURLs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugin_additionalProperties_version"></a>5.1.4. [Optional] Property root > plugin > additionalProperties > version</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins"></a>6. [Optional] Property root > plugins</strong>  

</summary>
<blockquote>

|                           |                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                          |
| **Required**              | No                                                                                                                |
| **Additional properties** | [[Should-conform]](#plugins_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="plugins_additionalProperties"></a>6.1. Property root > plugins > Plugins</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Plugins                                         |

<details>
<summary>
<strong> <a name="plugins_additionalProperties_image"></a>6.1.1. [Optional] Property root > plugins > additionalProperties > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_config"></a>6.1.2. [Optional] Property root > plugins > additionalProperties > config</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac"></a>6.1.3. [Optional] Property root > plugins > additionalProperties > rbac</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PluginsRBAC                                     |

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role"></a>6.1.3.1. [Optional] Property root > plugins > additionalProperties > rbac > role</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                 | Description |
| --------------------------------------------------------------- | ----------- |
| [RBACPolicyRule](#plugins_additionalProperties_rbac_role_items) | -           |

##### <a name="autogenerated_heading_16"></a>6.1.3.1.1. root > plugins > additionalProperties > rbac > role > RBACPolicyRule

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACPolicyRule                                  |

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role_items_verbs"></a>6.1.3.1.1.1. [Optional] Property root > plugins > additionalProperties > rbac > role > role items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs is a list of Verbs that apply to ALL the ResourceKinds contained in this rule. '*' represents all verbs.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                          | Description |
| ------------------------------------------------------------------------ | ----------- |
| [verbs items](#plugins_additionalProperties_rbac_role_items_verbs_items) | -           |

##### <a name="autogenerated_heading_17"></a>6.1.3.1.1.1.1. root > plugins > additionalProperties > rbac > role > role items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role_items_apiGroups"></a>6.1.3.1.1.2. [Optional] Property root > plugins > additionalProperties > rbac > role > role items > apiGroups</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
the enumerated resources in any API group will be allowed. "" represents the core API group and "*" represents all API groups.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                  | Description |
| -------------------------------------------------------------------------------- | ----------- |
| [apiGroups items](#plugins_additionalProperties_rbac_role_items_apiGroups_items) | -           |

##### <a name="autogenerated_heading_18"></a>6.1.3.1.1.2.1. root > plugins > additionalProperties > rbac > role > role items > apiGroups > apiGroups items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role_items_resources"></a>6.1.3.1.1.3. [Optional] Property root > plugins > additionalProperties > rbac > role > role items > resources</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Resources is a list of resources this rule applies to. '*' represents all resources.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                  | Description |
| -------------------------------------------------------------------------------- | ----------- |
| [resources items](#plugins_additionalProperties_rbac_role_items_resources_items) | -           |

##### <a name="autogenerated_heading_19"></a>6.1.3.1.1.3.1. root > plugins > additionalProperties > rbac > role > role items > resources > resources items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role_items_resourceNames"></a>6.1.3.1.1.4. [Optional] Property root > plugins > additionalProperties > rbac > role > role items > resourceNames</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                          | Description |
| ---------------------------------------------------------------------------------------- | ----------- |
| [resourceNames items](#plugins_additionalProperties_rbac_role_items_resourceNames_items) | -           |

##### <a name="autogenerated_heading_20"></a>6.1.3.1.1.4.1. root > plugins > additionalProperties > rbac > role > role items > resourceNames > resourceNames items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_role_items_nonResourceURLs"></a>6.1.3.1.1.5. [Optional] Property root > plugins > additionalProperties > rbac > role > role items > nonResourceURLs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** NonResourceURLs is a set of partial urls that a user should have access to.  *s are allowed, but only as the full, final step in the path
Since non-resource URLs are not namespaced, this field is only applicable for ClusterRoles referenced from a ClusterRoleBinding.
Rules can either apply to API resources (such as "pods" or "secrets") or non-resource URL paths (such as "/api"),  but not both.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                              | Description |
| -------------------------------------------------------------------------------------------- | ----------- |
| [nonResourceURLs items](#plugins_additionalProperties_rbac_role_items_nonResourceURLs_items) | -           |

##### <a name="autogenerated_heading_21"></a>6.1.3.1.1.5.1. root > plugins > additionalProperties > rbac > role > role items > nonResourceURLs > nonResourceURLs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole"></a>6.1.3.2. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                        | Description |
| ---------------------------------------------------------------------- | ----------- |
| [RBACPolicyRule](#plugins_additionalProperties_rbac_clusterRole_items) | -           |

##### <a name="autogenerated_heading_22"></a>6.1.3.2.1. root > plugins > additionalProperties > rbac > clusterRole > RBACPolicyRule

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACPolicyRule                                  |

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole_items_verbs"></a>6.1.3.2.1.1. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs is a list of Verbs that apply to ALL the ResourceKinds contained in this rule. '*' represents all verbs.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                 | Description |
| ------------------------------------------------------------------------------- | ----------- |
| [verbs items](#plugins_additionalProperties_rbac_clusterRole_items_verbs_items) | -           |

##### <a name="autogenerated_heading_23"></a>6.1.3.2.1.1.1. root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole_items_apiGroups"></a>6.1.3.2.1.2. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > apiGroups</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
the enumerated resources in any API group will be allowed. "" represents the core API group and "*" represents all API groups.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [apiGroups items](#plugins_additionalProperties_rbac_clusterRole_items_apiGroups_items) | -           |

##### <a name="autogenerated_heading_24"></a>6.1.3.2.1.2.1. root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > apiGroups > apiGroups items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole_items_resources"></a>6.1.3.2.1.3. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > resources</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Resources is a list of resources this rule applies to. '*' represents all resources.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [resources items](#plugins_additionalProperties_rbac_clusterRole_items_resources_items) | -           |

##### <a name="autogenerated_heading_25"></a>6.1.3.2.1.3.1. root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > resources > resources items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole_items_resourceNames"></a>6.1.3.2.1.4. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > resourceNames</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                 | Description |
| ----------------------------------------------------------------------------------------------- | ----------- |
| [resourceNames items](#plugins_additionalProperties_rbac_clusterRole_items_resourceNames_items) | -           |

##### <a name="autogenerated_heading_26"></a>6.1.3.2.1.4.1. root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > resourceNames > resourceNames items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="plugins_additionalProperties_rbac_clusterRole_items_nonResourceURLs"></a>6.1.3.2.1.5. [Optional] Property root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > nonResourceURLs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** NonResourceURLs is a set of partial urls that a user should have access to.  *s are allowed, but only as the full, final step in the path
Since non-resource URLs are not namespaced, this field is only applicable for ClusterRoles referenced from a ClusterRoleBinding.
Rules can either apply to API resources (such as "pods" or "secrets") or non-resource URL paths (such as "/api"),  but not both.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                     | Description |
| --------------------------------------------------------------------------------------------------- | ----------- |
| [nonResourceURLs items](#plugins_additionalProperties_rbac_clusterRole_items_nonResourceURLs_items) | -           |

##### <a name="autogenerated_heading_27"></a>6.1.3.2.1.5.1. root > plugins > additionalProperties > rbac > clusterRole > clusterRole items > nonResourceURLs > nonResourceURLs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane"></a>7. [Optional] Property root > controlPlane</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlane                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro"></a>7.1. [Optional] Property root > controlPlane > distro</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Distro                                          |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s"></a>7.1.1. [Optional] Property root > controlPlane > distro > k3s</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroK3s                                       |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_enabled"></a>7.1.1.1. [Optional] Property root > controlPlane > distro > k3s > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_spec"></a>7.1.1.2. [Optional] Property root > controlPlane > distro > k3s > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_image"></a>7.1.1.3. [Optional] Property root > controlPlane > distro > k3s > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_imagePullPolicy"></a>7.1.1.4. [Optional] Property root > controlPlane > distro > k3s > imagePullPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_command"></a>7.1.1.5. [Optional] Property root > controlPlane > distro > k3s > command</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                         | Description |
| ------------------------------------------------------- | ----------- |
| [command items](#controlPlane_distro_k3s_command_items) | -           |

##### <a name="autogenerated_heading_28"></a>7.1.1.5.1. root > controlPlane > distro > k3s > command > command items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_args"></a>7.1.1.6. [Optional] Property root > controlPlane > distro > k3s > args</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                   | Description |
| ------------------------------------------------- | ----------- |
| [args items](#controlPlane_distro_k3s_args_items) | -           |

##### <a name="autogenerated_heading_29"></a>7.1.1.6.1. root > controlPlane > distro > k3s > args > args items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_extraArgs"></a>7.1.1.7. [Optional] Property root > controlPlane > distro > k3s > extraArgs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [extraArgs items](#controlPlane_distro_k3s_extraArgs_items) | -           |

##### <a name="autogenerated_heading_30"></a>7.1.1.7.1. root > controlPlane > distro > k3s > extraArgs > extraArgs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_env"></a>7.1.1.8. [Optional] Property root > controlPlane > distro > k3s > env</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of object` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                 | Description |
| ----------------------------------------------- | ----------- |
| [env items](#controlPlane_distro_k3s_env_items) | -           |

##### <a name="autogenerated_heading_31"></a>7.1.1.8.1. root > controlPlane > distro > k3s > env > env items

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_token"></a>7.1.1.9. [Optional] Property root > controlPlane > distro > k3s > token</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore"></a>7.1.1.10. [Optional] Property root > controlPlane > distro > k3s > backingStore</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/BackingStore                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_embeddedEtcd"></a>7.1.1.10.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > embeddedEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EmbeddedEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_embeddedEtcd_enabled"></a>7.1.1.10.1.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > embeddedEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_embeddedEtcd_migrateFromSqlite"></a>7.1.1.10.1.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > embeddedEtcd > migrateFromSqlite</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd"></a>7.1.1.10.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_enabled"></a>7.1.1.10.2.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_image"></a>7.1.1.10.2.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_replicas"></a>7.1.1.10.2.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > replicas</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security"></a>7.1.1.10.2.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneSecurity                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_podSecurityContext"></a>7.1.1.10.2.4.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > podSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_containerSecurityContext"></a>7.1.1.10.2.4.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > containerSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneContainerSecurityContext            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_containerSecurityContext_allowPrivilegeEscalation"></a>7.1.1.10.2.4.2.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > containerSecurityContext > allowPrivilegeEscalation</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_containerSecurityContext_capabilities"></a>7.1.1.10.2.4.2.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > containerSecurityContext > capabilities</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_containerSecurityContext_runAsUser"></a>7.1.1.10.2.4.2.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > containerSecurityContext > runAsUser</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_security_containerSecurityContext_runAsGroup"></a>7.1.1.10.2.4.2.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > security > containerSecurityContext > runAsGroup</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_scheduling"></a>7.1.1.10.2.5. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > scheduling</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneScheduling                          |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_scheduling_nodeSelector"></a>7.1.1.10.2.5.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > scheduling > nodeSelector</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_scheduling_affinity"></a>7.1.1.10.2.5.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > scheduling > affinity</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_scheduling_tolerations"></a>7.1.1.10.2.5.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > scheduling > tolerations</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_scheduling_priorityClassName"></a>7.1.1.10.2.5.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > scheduling > priorityClassName</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence"></a>7.1.1.10.2.6. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlanePersistence                         |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_enabled"></a>7.1.1.10.2.6.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_retentionPolicy"></a>7.1.1.10.2.6.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > retentionPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_size"></a>7.1.1.10.2.6.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > size</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_storageClass"></a>7.1.1.10.2.6.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > storageClass</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts"></a>7.1.1.10.2.6.5. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                     | Description                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_32"></a>7.1.1.10.2.6.5.1. root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_name"></a>7.1.1.10.2.6.5.1.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_readOnly"></a>7.1.1.10.2.6.5.1.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPath"></a>7.1.1.10.2.6.5.1.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPath"></a>7.1.1.10.2.6.5.1.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPropagation"></a>7.1.1.10.2.6.5.1.5. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPathExpr"></a>7.1.1.10.2.6.5.1.6. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts"></a>7.1.1.10.2.6.6. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                           | Description                                                      |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_33"></a>7.1.1.10.2.6.6.1. root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_name"></a>7.1.1.10.2.6.6.1.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_readOnly"></a>7.1.1.10.2.6.6.1.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPath"></a>7.1.1.10.2.6.6.1.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPath"></a>7.1.1.10.2.6.6.1.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPropagation"></a>7.1.1.10.2.6.6.1.5. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPathExpr"></a>7.1.1.10.2.6.6.1.6. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata"></a>7.1.1.10.2.7. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcdMetadata                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_labels"></a>7.1.1.10.2.7.1. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                    |
| **Required**              | No                                                                                                                                                                          |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k3s_backingStore_externalEtcd_metadata_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_labels_additionalProperties"></a>7.1.1.10.2.7.1.1. Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_annotations"></a>7.1.1.10.2.7.2. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                         |
| **Required**              | No                                                                                                                                                                               |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k3s_backingStore_externalEtcd_metadata_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_annotations_additionalProperties"></a>7.1.1.10.2.7.2.1. Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podLabels"></a>7.1.1.10.2.7.3. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > podLabels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                                                       |
| **Required**              | No                                                                                                                                                                             |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podLabels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podLabels_additionalProperties"></a>7.1.1.10.2.7.3.1. Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > podLabels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podAnnotations"></a>7.1.1.10.2.7.4. [Optional] Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > podAnnotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                            |
| **Required**              | No                                                                                                                                                                                  |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k3s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties"></a>7.1.1.10.2.7.4.1. Property root > controlPlane > distro > k3s > backingStore > externalEtcd > metadata > podAnnotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s"></a>7.1.2. [Optional] Property root > controlPlane > distro > k8s</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroK8s                                       |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_enabled"></a>7.1.2.1. [Optional] Property root > controlPlane > distro > k8s > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer"></a>7.1.2.2. [Optional] Property root > controlPlane > distro > k8s > apiServer</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroContainer                                 |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_spec"></a>7.1.2.2.1. [Optional] Property root > controlPlane > distro > k8s > apiServer > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_image"></a>7.1.2.2.2. [Optional] Property root > controlPlane > distro > k8s > apiServer > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_imagePullPolicy"></a>7.1.2.2.3. [Optional] Property root > controlPlane > distro > k8s > apiServer > imagePullPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_command"></a>7.1.2.2.4. [Optional] Property root > controlPlane > distro > k8s > apiServer > command</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                   | Description |
| ----------------------------------------------------------------- | ----------- |
| [command items](#controlPlane_distro_k8s_apiServer_command_items) | -           |

##### <a name="autogenerated_heading_34"></a>7.1.2.2.4.1. root > controlPlane > distro > k8s > apiServer > command > command items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_args"></a>7.1.2.2.5. [Optional] Property root > controlPlane > distro > k8s > apiServer > args</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [args items](#controlPlane_distro_k8s_apiServer_args_items) | -           |

##### <a name="autogenerated_heading_35"></a>7.1.2.2.5.1. root > controlPlane > distro > k8s > apiServer > args > args items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_extraArgs"></a>7.1.2.2.6. [Optional] Property root > controlPlane > distro > k8s > apiServer > extraArgs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                       | Description |
| --------------------------------------------------------------------- | ----------- |
| [extraArgs items](#controlPlane_distro_k8s_apiServer_extraArgs_items) | -           |

##### <a name="autogenerated_heading_36"></a>7.1.2.2.6.1. root > controlPlane > distro > k8s > apiServer > extraArgs > extraArgs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_apiServer_env"></a>7.1.2.2.7. [Optional] Property root > controlPlane > distro > k8s > apiServer > env</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of object` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                           | Description |
| --------------------------------------------------------- | ----------- |
| [env items](#controlPlane_distro_k8s_apiServer_env_items) | -           |

##### <a name="autogenerated_heading_37"></a>7.1.2.2.7.1. root > controlPlane > distro > k8s > apiServer > env > env items

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager"></a>7.1.2.3. [Optional] Property root > controlPlane > distro > k8s > controllerManager</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroContainer                                 |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_spec"></a>7.1.2.3.1. [Optional] Property root > controlPlane > distro > k8s > controllerManager > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_image"></a>7.1.2.3.2. [Optional] Property root > controlPlane > distro > k8s > controllerManager > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_imagePullPolicy"></a>7.1.2.3.3. [Optional] Property root > controlPlane > distro > k8s > controllerManager > imagePullPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_command"></a>7.1.2.3.4. [Optional] Property root > controlPlane > distro > k8s > controllerManager > command</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                           | Description |
| ------------------------------------------------------------------------- | ----------- |
| [command items](#controlPlane_distro_k8s_controllerManager_command_items) | -           |

##### <a name="autogenerated_heading_38"></a>7.1.2.3.4.1. root > controlPlane > distro > k8s > controllerManager > command > command items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_args"></a>7.1.2.3.5. [Optional] Property root > controlPlane > distro > k8s > controllerManager > args</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                     | Description |
| ------------------------------------------------------------------- | ----------- |
| [args items](#controlPlane_distro_k8s_controllerManager_args_items) | -           |

##### <a name="autogenerated_heading_39"></a>7.1.2.3.5.1. root > controlPlane > distro > k8s > controllerManager > args > args items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_extraArgs"></a>7.1.2.3.6. [Optional] Property root > controlPlane > distro > k8s > controllerManager > extraArgs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                               | Description |
| ----------------------------------------------------------------------------- | ----------- |
| [extraArgs items](#controlPlane_distro_k8s_controllerManager_extraArgs_items) | -           |

##### <a name="autogenerated_heading_40"></a>7.1.2.3.6.1. root > controlPlane > distro > k8s > controllerManager > extraArgs > extraArgs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_controllerManager_env"></a>7.1.2.3.7. [Optional] Property root > controlPlane > distro > k8s > controllerManager > env</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of object` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                   | Description |
| ----------------------------------------------------------------- | ----------- |
| [env items](#controlPlane_distro_k8s_controllerManager_env_items) | -           |

##### <a name="autogenerated_heading_41"></a>7.1.2.3.7.1. root > controlPlane > distro > k8s > controllerManager > env > env items

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler"></a>7.1.2.4. [Optional] Property root > controlPlane > distro > k8s > scheduler</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroContainer                                 |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_spec"></a>7.1.2.4.1. [Optional] Property root > controlPlane > distro > k8s > scheduler > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_image"></a>7.1.2.4.2. [Optional] Property root > controlPlane > distro > k8s > scheduler > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_imagePullPolicy"></a>7.1.2.4.3. [Optional] Property root > controlPlane > distro > k8s > scheduler > imagePullPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_command"></a>7.1.2.4.4. [Optional] Property root > controlPlane > distro > k8s > scheduler > command</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                   | Description |
| ----------------------------------------------------------------- | ----------- |
| [command items](#controlPlane_distro_k8s_scheduler_command_items) | -           |

##### <a name="autogenerated_heading_42"></a>7.1.2.4.4.1. root > controlPlane > distro > k8s > scheduler > command > command items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_args"></a>7.1.2.4.5. [Optional] Property root > controlPlane > distro > k8s > scheduler > args</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [args items](#controlPlane_distro_k8s_scheduler_args_items) | -           |

##### <a name="autogenerated_heading_43"></a>7.1.2.4.5.1. root > controlPlane > distro > k8s > scheduler > args > args items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_extraArgs"></a>7.1.2.4.6. [Optional] Property root > controlPlane > distro > k8s > scheduler > extraArgs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                       | Description |
| --------------------------------------------------------------------- | ----------- |
| [extraArgs items](#controlPlane_distro_k8s_scheduler_extraArgs_items) | -           |

##### <a name="autogenerated_heading_44"></a>7.1.2.4.6.1. root > controlPlane > distro > k8s > scheduler > extraArgs > extraArgs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_scheduler_env"></a>7.1.2.4.7. [Optional] Property root > controlPlane > distro > k8s > scheduler > env</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of object` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                           | Description |
| --------------------------------------------------------- | ----------- |
| [env items](#controlPlane_distro_k8s_scheduler_env_items) | -           |

##### <a name="autogenerated_heading_45"></a>7.1.2.4.7.1. root > controlPlane > distro > k8s > scheduler > env > env items

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore"></a>7.1.2.5. [Optional] Property root > controlPlane > distro > k8s > backingStore</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/BackingStore                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_embeddedEtcd"></a>7.1.2.5.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > embeddedEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EmbeddedEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_embeddedEtcd_enabled"></a>7.1.2.5.1.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > embeddedEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_embeddedEtcd_migrateFromSqlite"></a>7.1.2.5.1.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > embeddedEtcd > migrateFromSqlite</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd"></a>7.1.2.5.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_enabled"></a>7.1.2.5.2.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_image"></a>7.1.2.5.2.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_replicas"></a>7.1.2.5.2.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > replicas</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security"></a>7.1.2.5.2.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneSecurity                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_podSecurityContext"></a>7.1.2.5.2.4.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > podSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_containerSecurityContext"></a>7.1.2.5.2.4.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > containerSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneContainerSecurityContext            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_containerSecurityContext_allowPrivilegeEscalation"></a>7.1.2.5.2.4.2.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > containerSecurityContext > allowPrivilegeEscalation</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_containerSecurityContext_capabilities"></a>7.1.2.5.2.4.2.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > containerSecurityContext > capabilities</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_containerSecurityContext_runAsUser"></a>7.1.2.5.2.4.2.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > containerSecurityContext > runAsUser</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_security_containerSecurityContext_runAsGroup"></a>7.1.2.5.2.4.2.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > security > containerSecurityContext > runAsGroup</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_scheduling"></a>7.1.2.5.2.5. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > scheduling</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneScheduling                          |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_scheduling_nodeSelector"></a>7.1.2.5.2.5.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > scheduling > nodeSelector</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_scheduling_affinity"></a>7.1.2.5.2.5.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > scheduling > affinity</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_scheduling_tolerations"></a>7.1.2.5.2.5.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > scheduling > tolerations</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_scheduling_priorityClassName"></a>7.1.2.5.2.5.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > scheduling > priorityClassName</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence"></a>7.1.2.5.2.6. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlanePersistence                         |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_enabled"></a>7.1.2.5.2.6.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_retentionPolicy"></a>7.1.2.5.2.6.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > retentionPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_size"></a>7.1.2.5.2.6.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > size</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_storageClass"></a>7.1.2.5.2.6.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > storageClass</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts"></a>7.1.2.5.2.6.5. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                     | Description                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_46"></a>7.1.2.5.2.6.5.1. root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_name"></a>7.1.2.5.2.6.5.1.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_readOnly"></a>7.1.2.5.2.6.5.1.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPath"></a>7.1.2.5.2.6.5.1.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPath"></a>7.1.2.5.2.6.5.1.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPropagation"></a>7.1.2.5.2.6.5.1.5. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPathExpr"></a>7.1.2.5.2.6.5.1.6. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts"></a>7.1.2.5.2.6.6. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                           | Description                                                      |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_47"></a>7.1.2.5.2.6.6.1. root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_name"></a>7.1.2.5.2.6.6.1.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_readOnly"></a>7.1.2.5.2.6.6.1.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPath"></a>7.1.2.5.2.6.6.1.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPath"></a>7.1.2.5.2.6.6.1.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPropagation"></a>7.1.2.5.2.6.6.1.5. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPathExpr"></a>7.1.2.5.2.6.6.1.6. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata"></a>7.1.2.5.2.7. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcdMetadata                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_labels"></a>7.1.2.5.2.7.1. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                    |
| **Required**              | No                                                                                                                                                                          |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k8s_backingStore_externalEtcd_metadata_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_labels_additionalProperties"></a>7.1.2.5.2.7.1.1. Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_annotations"></a>7.1.2.5.2.7.2. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                         |
| **Required**              | No                                                                                                                                                                               |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k8s_backingStore_externalEtcd_metadata_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_annotations_additionalProperties"></a>7.1.2.5.2.7.2.1. Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podLabels"></a>7.1.2.5.2.7.3. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > podLabels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                                                       |
| **Required**              | No                                                                                                                                                                             |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podLabels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podLabels_additionalProperties"></a>7.1.2.5.2.7.3.1. Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > podLabels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podAnnotations"></a>7.1.2.5.2.7.4. [Optional] Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > podAnnotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                            |
| **Required**              | No                                                                                                                                                                                  |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k8s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties"></a>7.1.2.5.2.7.4.1. Property root > controlPlane > distro > k8s > backingStore > externalEtcd > metadata > podAnnotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s"></a>7.1.3. [Optional] Property root > controlPlane > distro > k0s</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroK0s                                       |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_enabled"></a>7.1.3.1. [Optional] Property root > controlPlane > distro > k0s > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore"></a>7.1.3.2. [Optional] Property root > controlPlane > distro > k0s > backingStore</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/BackingStore                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_embeddedEtcd"></a>7.1.3.2.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > embeddedEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EmbeddedEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_embeddedEtcd_enabled"></a>7.1.3.2.1.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > embeddedEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_embeddedEtcd_migrateFromSqlite"></a>7.1.3.2.1.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > embeddedEtcd > migrateFromSqlite</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd"></a>7.1.3.2.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcd                                    |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_enabled"></a>7.1.3.2.2.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_image"></a>7.1.3.2.2.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > image</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_replicas"></a>7.1.3.2.2.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > replicas</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security"></a>7.1.3.2.2.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneSecurity                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_podSecurityContext"></a>7.1.3.2.2.4.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > podSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_containerSecurityContext"></a>7.1.3.2.2.4.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > containerSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneContainerSecurityContext            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_containerSecurityContext_allowPrivilegeEscalation"></a>7.1.3.2.2.4.2.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > containerSecurityContext > allowPrivilegeEscalation</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_containerSecurityContext_capabilities"></a>7.1.3.2.2.4.2.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > containerSecurityContext > capabilities</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_containerSecurityContext_runAsUser"></a>7.1.3.2.2.4.2.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > containerSecurityContext > runAsUser</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_security_containerSecurityContext_runAsGroup"></a>7.1.3.2.2.4.2.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > security > containerSecurityContext > runAsGroup</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_scheduling"></a>7.1.3.2.2.5. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > scheduling</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneScheduling                          |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_scheduling_nodeSelector"></a>7.1.3.2.2.5.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > scheduling > nodeSelector</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_scheduling_affinity"></a>7.1.3.2.2.5.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > scheduling > affinity</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_scheduling_tolerations"></a>7.1.3.2.2.5.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > scheduling > tolerations</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_scheduling_priorityClassName"></a>7.1.3.2.2.5.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > scheduling > priorityClassName</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence"></a>7.1.3.2.2.6. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlanePersistence                         |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_enabled"></a>7.1.3.2.2.6.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_retentionPolicy"></a>7.1.3.2.2.6.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > retentionPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_size"></a>7.1.3.2.2.6.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > size</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_storageClass"></a>7.1.3.2.2.6.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > storageClass</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts"></a>7.1.3.2.2.6.5. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                     | Description                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_48"></a>7.1.3.2.2.6.5.1. root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_name"></a>7.1.3.2.2.6.5.1.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_readOnly"></a>7.1.3.2.2.6.5.1.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPath"></a>7.1.3.2.2.6.5.1.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPath"></a>7.1.3.2.2.6.5.1.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_mountPropagation"></a>7.1.3.2.2.6.5.1.5. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_addVolumeMounts_items_subPathExpr"></a>7.1.3.2.2.6.5.1.6. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > addVolumeMounts > addVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts"></a>7.1.3.2.2.6.6. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                           | Description                                                      |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_49"></a>7.1.3.2.2.6.6.1. root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_name"></a>7.1.3.2.2.6.6.1.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_readOnly"></a>7.1.3.2.2.6.6.1.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPath"></a>7.1.3.2.2.6.6.1.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPath"></a>7.1.3.2.2.6.6.1.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_mountPropagation"></a>7.1.3.2.2.6.6.1.5. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_persistence_overwriteVolumeMounts_items_subPathExpr"></a>7.1.3.2.2.6.6.1.6. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata"></a>7.1.3.2.2.7. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExternalEtcdMetadata                            |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_labels"></a>7.1.3.2.2.7.1. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                    |
| **Required**              | No                                                                                                                                                                          |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k0s_backingStore_externalEtcd_metadata_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_labels_additionalProperties"></a>7.1.3.2.2.7.1.1. Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_annotations"></a>7.1.3.2.2.7.2. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                         |
| **Required**              | No                                                                                                                                                                               |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k0s_backingStore_externalEtcd_metadata_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_annotations_additionalProperties"></a>7.1.3.2.2.7.2.1. Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podLabels"></a>7.1.3.2.2.7.3. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > podLabels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                                                       |
| **Required**              | No                                                                                                                                                                             |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podLabels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podLabels_additionalProperties"></a>7.1.3.2.2.7.3.1. Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > podLabels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podAnnotations"></a>7.1.3.2.2.7.4. [Optional] Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > podAnnotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                                            |
| **Required**              | No                                                                                                                                                                                  |
| **Additional properties** | [[Should-conform]](#controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_distro_k0s_backingStore_externalEtcd_metadata_podAnnotations_additionalProperties"></a>7.1.3.2.2.7.4.1. Property root > controlPlane > distro > k0s > backingStore > externalEtcd > metadata > podAnnotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced"></a>7.1.4. [Optional] Property root > controlPlane > distro > advanced</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroAdvanced                                  |

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths"></a>7.1.4.1. [Optional] Property root > controlPlane > distro > advanced > paths</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/DistroPaths                                     |

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths_kubeConfig"></a>7.1.4.1.1. [Optional] Property root > controlPlane > distro > advanced > paths > kubeConfig</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths_serverCAKey"></a>7.1.4.1.2. [Optional] Property root > controlPlane > distro > advanced > paths > serverCAKey</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths_serverCACert"></a>7.1.4.1.3. [Optional] Property root > controlPlane > distro > advanced > paths > serverCACert</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths_clientCACert"></a>7.1.4.1.4. [Optional] Property root > controlPlane > distro > advanced > paths > clientCACert</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_distro_advanced_paths_requestHeaderCACert"></a>7.1.4.1.5. [Optional] Property root > controlPlane > distro > advanced > paths > requestHeaderCACert</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_hostPathMapper"></a>7.2. [Optional] Property root > controlPlane > hostPathMapper</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/HostPathMapper                                  |

<details>
<summary>
<strong> <a name="controlPlane_hostPathMapper_enabled"></a>7.2.1. [Optional] Property root > controlPlane > hostPathMapper > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_hostPathMapper_central"></a>7.2.2. [Optional] Property root > controlPlane > hostPathMapper > central</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns"></a>7.3. [Optional] Property root > controlPlane > coredns</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/CoreDNS                                         |

<details>
<summary>
<strong> <a name="controlPlane_coredns_enabled"></a>7.3.1. [Optional] Property root > controlPlane > coredns > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_embedded"></a>7.3.2. [Optional] Property root > controlPlane > coredns > embedded</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_service"></a>7.3.3. [Optional] Property root > controlPlane > coredns > service</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/CoreDNSService                                  |

<details>
<summary>
<strong> <a name="controlPlane_coredns_service_labels"></a>7.3.3.1. [Optional] Property root > controlPlane > coredns > service > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                      |
| **Required**              | No                                                                                                                                            |
| **Additional properties** | [[Should-conform]](#controlPlane_coredns_service_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_coredns_service_labels_additionalProperties"></a>7.3.3.1.1. Property root > controlPlane > coredns > service > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_service_annotations"></a>7.3.3.2. [Optional] Property root > controlPlane > coredns > service > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                           |
| **Required**              | No                                                                                                                                                 |
| **Additional properties** | [[Should-conform]](#controlPlane_coredns_service_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_coredns_service_annotations_additionalProperties"></a>7.3.3.2.1. Property root > controlPlane > coredns > service > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_service_spec"></a>7.3.3.3. [Optional] Property root > controlPlane > coredns > service > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment"></a>7.3.4. [Optional] Property root > controlPlane > coredns > deployment</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/CoreDNSDeployment                               |

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment_labels"></a>7.3.4.1. [Optional] Property root > controlPlane > coredns > deployment > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                         |
| **Required**              | No                                                                                                                                               |
| **Additional properties** | [[Should-conform]](#controlPlane_coredns_deployment_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment_labels_additionalProperties"></a>7.3.4.1.1. Property root > controlPlane > coredns > deployment > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment_annotations"></a>7.3.4.2. [Optional] Property root > controlPlane > coredns > deployment > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                              |
| **Required**              | No                                                                                                                                                    |
| **Additional properties** | [[Should-conform]](#controlPlane_coredns_deployment_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment_annotations_additionalProperties"></a>7.3.4.2.1. Property root > controlPlane > coredns > deployment > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_coredns_deployment_spec"></a>7.3.4.3. [Optional] Property root > controlPlane > coredns > deployment > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_virtualScheduler"></a>7.4. [Optional] Property root > controlPlane > virtualScheduler</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="controlPlane_virtualScheduler_enabled"></a>7.4.1. [Optional] Property root > controlPlane > virtualScheduler > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_proxy"></a>7.5. [Optional] Property root > controlPlane > proxy</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneProxy                               |

<details>
<summary>
<strong> <a name="controlPlane_proxy_bindAddress"></a>7.5.1. [Optional] Property root > controlPlane > proxy > bindAddress</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_proxy_port"></a>7.5.2. [Optional] Property root > controlPlane > proxy > port</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_proxy_tls"></a>7.5.3. [Optional] Property root > controlPlane > proxy > tls</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneProxyTLS                            |

<details>
<summary>
<strong> <a name="controlPlane_proxy_tls_extraSANs"></a>7.5.3.1. [Optional] Property root > controlPlane > proxy > tls > extraSANs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                            | Description |
| ---------------------------------------------------------- | ----------- |
| [extraSANs items](#controlPlane_proxy_tls_extraSANs_items) | -           |

##### <a name="autogenerated_heading_50"></a>7.5.3.1.1. root > controlPlane > proxy > tls > extraSANs > extraSANs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_service"></a>7.6. [Optional] Property root > controlPlane > service</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneService                             |

<details>
<summary>
<strong> <a name="controlPlane_service_labels"></a>7.6.1. [Optional] Property root > controlPlane > service > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                              |
| **Required**              | No                                                                                                                                    |
| **Additional properties** | [[Should-conform]](#controlPlane_service_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_service_labels_additionalProperties"></a>7.6.1.1. Property root > controlPlane > service > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_service_annotations"></a>7.6.2. [Optional] Property root > controlPlane > service > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                   |
| **Required**              | No                                                                                                                                         |
| **Additional properties** | [[Should-conform]](#controlPlane_service_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_service_annotations_additionalProperties"></a>7.6.2.1. Property root > controlPlane > service > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_service_name"></a>7.6.3. [Optional] Property root > controlPlane > service > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_service_spec"></a>7.6.4. [Optional] Property root > controlPlane > service > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_ingress"></a>7.7. [Optional] Property root > controlPlane > ingress</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneIngress                             |

<details>
<summary>
<strong> <a name="controlPlane_ingress_enabled"></a>7.7.1. [Optional] Property root > controlPlane > ingress > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_ingress_labels"></a>7.7.2. [Optional] Property root > controlPlane > ingress > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                              |
| **Required**              | No                                                                                                                                    |
| **Additional properties** | [[Should-conform]](#controlPlane_ingress_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_ingress_labels_additionalProperties"></a>7.7.2.1. Property root > controlPlane > ingress > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_ingress_annotations"></a>7.7.3. [Optional] Property root > controlPlane > ingress > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                   |
| **Required**              | No                                                                                                                                         |
| **Additional properties** | [[Should-conform]](#controlPlane_ingress_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_ingress_annotations_additionalProperties"></a>7.7.3.1. Property root > controlPlane > ingress > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_ingress_name"></a>7.7.4. [Optional] Property root > controlPlane > ingress > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_ingress_spec"></a>7.7.5. [Optional] Property root > controlPlane > ingress > spec</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_highAvailability"></a>7.8. [Optional] Property root > controlPlane > highAvailability</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneHighAvailability                    |

<details>
<summary>
<strong> <a name="controlPlane_highAvailability_replicas"></a>7.8.1. [Optional] Property root > controlPlane > highAvailability > replicas</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced"></a>7.9. [Optional] Property root > controlPlane > advanced</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneAdvanced                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_defaultImageRegistry"></a>7.9.1. [Optional] Property root > controlPlane > advanced > defaultImageRegistry</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_image"></a>7.9.2. [Optional] Property root > controlPlane > advanced > image</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ImageRef                                        |

<details>
<summary>
<strong> <a name="controlPlane_advanced_image_repository"></a>7.9.2.1. [Optional] Property root > controlPlane > advanced > image > repository</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_image_tag"></a>7.9.2.2. [Optional] Property root > controlPlane > advanced > image > tag</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_headless"></a>7.9.3. [Optional] Property root > controlPlane > advanced > headless</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence"></a>7.9.4. [Optional] Property root > controlPlane > advanced > persistence</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlanePersistence                         |

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_enabled"></a>7.9.4.1. [Optional] Property root > controlPlane > advanced > persistence > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_retentionPolicy"></a>7.9.4.2. [Optional] Property root > controlPlane > advanced > persistence > retentionPolicy</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_size"></a>7.9.4.3. [Optional] Property root > controlPlane > advanced > persistence > size</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_storageClass"></a>7.9.4.4. [Optional] Property root > controlPlane > advanced > persistence > storageClass</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts"></a>7.9.4.5. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                         | Description                                                      |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_advanced_persistence_addVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_51"></a>7.9.4.5.1. root > controlPlane > advanced > persistence > addVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_name"></a>7.9.4.5.1.1. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_readOnly"></a>7.9.4.5.1.2. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_mountPath"></a>7.9.4.5.1.3. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_subPath"></a>7.9.4.5.1.4. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_mountPropagation"></a>7.9.4.5.1.5. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_addVolumeMounts_items_subPathExpr"></a>7.9.4.5.1.6. [Optional] Property root > controlPlane > advanced > persistence > addVolumeMounts > addVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts"></a>7.9.4.6. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                               | Description                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [VolumeMount](#controlPlane_advanced_persistence_overwriteVolumeMounts_items) | VolumeMount describes a mounting of a Volume within a container. |

##### <a name="autogenerated_heading_52"></a>7.9.4.6.1. root > controlPlane > advanced > persistence > overwriteVolumeMounts > VolumeMount

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/VolumeMount                                     |

**Description:** VolumeMount describes a mounting of a Volume within a container.

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_name"></a>7.9.4.6.1.1. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** This must match the Name of a Volume.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_readOnly"></a>7.9.4.6.1.2. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > readOnly</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Mounted read-only if true, read-write otherwise (false or unspecified).
Defaults to false.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_mountPath"></a>7.9.4.6.1.3. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the container at which the volume should be mounted.  Must
not contain ':'.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_subPath"></a>7.9.4.6.1.4. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path within the volume from which the container's volume should be mounted.
Defaults to "" (volume's root).

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_mountPropagation"></a>7.9.4.6.1.5. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > mountPropagation</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** mountPropagation determines how mounts are propagated from the host
to container and the other way around.
When not set, MountPropagationNone is used.
This field is beta in 1.10.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_persistence_overwriteVolumeMounts_items_subPathExpr"></a>7.9.4.6.1.6. [Optional] Property root > controlPlane > advanced > persistence > overwriteVolumeMounts > overwriteVolumeMounts items > subPathExpr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Expanded path within the volume from which the container's volume should be mounted.
Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment.
Defaults to "" (volume's root).
SubPathExpr and SubPath are mutually exclusive.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_scheduling"></a>7.9.5. [Optional] Property root > controlPlane > advanced > scheduling</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneScheduling                          |

<details>
<summary>
<strong> <a name="controlPlane_advanced_scheduling_nodeSelector"></a>7.9.5.1. [Optional] Property root > controlPlane > advanced > scheduling > nodeSelector</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_scheduling_affinity"></a>7.9.5.2. [Optional] Property root > controlPlane > advanced > scheduling > affinity</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_scheduling_tolerations"></a>7.9.5.3. [Optional] Property root > controlPlane > advanced > scheduling > tolerations</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_scheduling_priorityClassName"></a>7.9.5.4. [Optional] Property root > controlPlane > advanced > scheduling > priorityClassName</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_serviceAccounts"></a>7.9.6. [Optional] Property root > controlPlane > advanced > serviceAccounts</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneServiceAccounts                     |

<details>
<summary>
<strong> <a name="controlPlane_advanced_serviceAccounts_enabled"></a>7.9.6.1. [Optional] Property root > controlPlane > advanced > serviceAccounts > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_serviceAccounts_name"></a>7.9.6.2. [Optional] Property root > controlPlane > advanced > serviceAccounts > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_serviceAccounts_imagePullSecrets"></a>7.9.6.3. [Optional] Property root > controlPlane > advanced > serviceAccounts > imagePullSecrets</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                       | Description                                                                                                         |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [LocalObjectReference](#controlPlane_advanced_serviceAccounts_imagePullSecrets_items) | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |

##### <a name="autogenerated_heading_53"></a>7.9.6.3.1. root > controlPlane > advanced > serviceAccounts > imagePullSecrets > LocalObjectReference

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LocalObjectReference                            |

**Description:** LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.

<details>
<summary>
<strong> <a name="controlPlane_advanced_serviceAccounts_imagePullSecrets_items_name"></a>7.9.6.3.1.1. [Optional] Property root > controlPlane > advanced > serviceAccounts > imagePullSecrets > imagePullSecrets items > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Name of the referent.
More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_workloadServiceAccount"></a>7.9.7. [Optional] Property root > controlPlane > advanced > workloadServiceAccount</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneWorkloadServiceAccount              |

<details>
<summary>
<strong> <a name="controlPlane_advanced_workloadServiceAccount_enabled"></a>7.9.7.1. [Optional] Property root > controlPlane > advanced > workloadServiceAccount > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_workloadServiceAccount_name"></a>7.9.7.2. [Optional] Property root > controlPlane > advanced > workloadServiceAccount > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_workloadServiceAccount_annotations"></a>7.9.7.3. [Optional] Property root > controlPlane > advanced > workloadServiceAccount > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                                           |
| **Required**              | No                                                                                                                                                                 |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_workloadServiceAccount_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_workloadServiceAccount_annotations_additionalProperties"></a>7.9.7.3.1. Property root > controlPlane > advanced > workloadServiceAccount > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_probes"></a>7.9.8. [Optional] Property root > controlPlane > advanced > probes</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneProbes                              |

<details>
<summary>
<strong> <a name="controlPlane_advanced_probes_livenessProbe"></a>7.9.8.1. [Optional] Property root > controlPlane > advanced > probes > livenessProbe</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="controlPlane_advanced_probes_livenessProbe_enabled"></a>7.9.8.1.1. [Optional] Property root > controlPlane > advanced > probes > livenessProbe > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_probes_readinessProbe"></a>7.9.8.2. [Optional] Property root > controlPlane > advanced > probes > readinessProbe</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/EnableSwitch                                    |

<details>
<summary>
<strong> <a name="controlPlane_advanced_probes_readinessProbe_enabled"></a>7.9.8.2.1. [Optional] Property root > controlPlane > advanced > probes > readinessProbe > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_security"></a>7.9.9. [Optional] Property root > controlPlane > advanced > security</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneSecurity                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_podSecurityContext"></a>7.9.9.1. [Optional] Property root > controlPlane > advanced > security > podSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_containerSecurityContext"></a>7.9.9.2. [Optional] Property root > controlPlane > advanced > security > containerSecurityContext</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneContainerSecurityContext            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_containerSecurityContext_allowPrivilegeEscalation"></a>7.9.9.2.1. [Optional] Property root > controlPlane > advanced > security > containerSecurityContext > allowPrivilegeEscalation</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_containerSecurityContext_capabilities"></a>7.9.9.2.2. [Optional] Property root > controlPlane > advanced > security > containerSecurityContext > capabilities</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_containerSecurityContext_runAsUser"></a>7.9.9.2.3. [Optional] Property root > controlPlane > advanced > security > containerSecurityContext > runAsUser</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_security_containerSecurityContext_runAsGroup"></a>7.9.9.2.4. [Optional] Property root > controlPlane > advanced > security > containerSecurityContext > runAsGroup</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata"></a>7.9.10. [Optional] Property root > controlPlane > advanced > metadata</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ControlPlaneMetadata                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_statefulSet"></a>7.9.10.1. [Optional] Property root > controlPlane > advanced > metadata > statefulSet</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LabelsAndAnnotations                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_statefulSet_labels"></a>7.9.10.1.1. [Optional] Property root > controlPlane > advanced > metadata > statefulSet > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                    |
| **Required**              | No                                                                                                                                                          |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_statefulSet_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_statefulSet_labels_additionalProperties"></a>7.9.10.1.1.1. Property root > controlPlane > advanced > metadata > statefulSet > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_statefulSet_annotations"></a>7.9.10.1.2. [Optional] Property root > controlPlane > advanced > metadata > statefulSet > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                         |
| **Required**              | No                                                                                                                                                               |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_statefulSet_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_statefulSet_annotations_additionalProperties"></a>7.9.10.1.2.1. Property root > controlPlane > advanced > metadata > statefulSet > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_pods"></a>7.9.10.2. [Optional] Property root > controlPlane > advanced > metadata > pods</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LabelsAndAnnotations                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_pods_labels"></a>7.9.10.2.1. [Optional] Property root > controlPlane > advanced > metadata > pods > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                             |
| **Required**              | No                                                                                                                                                   |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_pods_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_pods_labels_additionalProperties"></a>7.9.10.2.1.1. Property root > controlPlane > advanced > metadata > pods > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_pods_annotations"></a>7.9.10.2.2. [Optional] Property root > controlPlane > advanced > metadata > pods > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                  |
| **Required**              | No                                                                                                                                                        |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_pods_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_pods_annotations_additionalProperties"></a>7.9.10.2.2.1. Property root > controlPlane > advanced > metadata > pods > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_allResources"></a>7.9.10.3. [Optional] Property root > controlPlane > advanced > metadata > allResources</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LabelsAndAnnotations                            |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_allResources_labels"></a>7.9.10.3.1. [Optional] Property root > controlPlane > advanced > metadata > allResources > labels</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Type**                  | `object`                                                                                                                                                     |
| **Required**              | No                                                                                                                                                           |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_allResources_labels_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_allResources_labels_additionalProperties"></a>7.9.10.3.1.1. Property root > controlPlane > advanced > metadata > allResources > labels > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_allResources_annotations"></a>7.9.10.3.2. [Optional] Property root > controlPlane > advanced > metadata > allResources > annotations</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                          |
| **Required**              | No                                                                                                                                                                |
| **Additional properties** | [[Should-conform]](#controlPlane_advanced_metadata_allResources_annotations_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="controlPlane_advanced_metadata_allResources_annotations_additionalProperties"></a>7.9.10.3.2.1. Property root > controlPlane > advanced > metadata > allResources > annotations > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies"></a>8. [Optional] Property root > policies</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Policies                                        |

<details>
<summary>
<strong> <a name="policies_podSecurityStandard"></a>8.1. [Optional] Property root > policies > podSecurityStandard</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota"></a>8.2. [Optional] Property root > policies > resourceQuota</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ResourceQuota                                   |

<details>
<summary>
<strong> <a name="policies_resourceQuota_enabled"></a>8.2.1. [Optional] Property root > policies > resourceQuota > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota_quota"></a>8.2.2. [Optional] Property root > policies > resourceQuota > quota</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                               |
| **Required**              | No                                                                                                                                     |
| **Additional properties** | [[Should-conform]](#policies_resourceQuota_quota_additionalProperties "Each additional property must conform to the following schema") |

<details>
<summary>
<strong> <a name="policies_resourceQuota_quota_additionalProperties"></a>8.2.2.1. Property root > policies > resourceQuota > quota > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopeSelector"></a>8.2.3. [Optional] Property root > policies > resourceQuota > scopeSelector</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ScopeSelector                                   |

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopeSelector_matchExpressions"></a>8.2.3.1. [Optional] Property root > policies > resourceQuota > scopeSelector > matchExpressions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                          | Description |
| ---------------------------------------------------------------------------------------- | ----------- |
| [LabelSelectorRequirement](#policies_resourceQuota_scopeSelector_matchExpressions_items) | -           |

##### <a name="autogenerated_heading_54"></a>8.2.3.1.1. root > policies > resourceQuota > scopeSelector > matchExpressions > LabelSelectorRequirement

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LabelSelectorRequirement                        |

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopeSelector_matchExpressions_items_key"></a>8.2.3.1.1.1. [Optional] Property root > policies > resourceQuota > scopeSelector > matchExpressions > matchExpressions items > key</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** key is the label key that the selector applies to.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopeSelector_matchExpressions_items_operator"></a>8.2.3.1.1.2. [Optional] Property root > policies > resourceQuota > scopeSelector > matchExpressions > matchExpressions items > operator</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** operator represents a key's relationship to a set of values.
Valid operators are In, NotIn, Exists and DoesNotExist.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopeSelector_matchExpressions_items_values"></a>8.2.3.1.1.3. [Optional] Property root > policies > resourceQuota > scopeSelector > matchExpressions > matchExpressions items > values</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** values is an array of string values. If the operator is In or NotIn,
the values array must be non-empty. If the operator is Exists or DoesNotExist,
the values array must be empty. This array is replaced during a strategic
merge patch.

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                           | Description |
| ----------------------------------------------------------------------------------------- | ----------- |
| [values items](#policies_resourceQuota_scopeSelector_matchExpressions_items_values_items) | -           |

##### <a name="autogenerated_heading_55"></a>8.2.3.1.1.3.1. root > policies > resourceQuota > scopeSelector > matchExpressions > matchExpressions items > values > values items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_resourceQuota_scopes"></a>8.2.4. [Optional] Property root > policies > resourceQuota > scopes</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                      | Description |
| ---------------------------------------------------- | ----------- |
| [scopes items](#policies_resourceQuota_scopes_items) | -           |

##### <a name="autogenerated_heading_56"></a>8.2.4.1. root > policies > resourceQuota > scopes > scopes items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange"></a>8.3. [Optional] Property root > policies > limitRange</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LimitRange                                      |

<details>
<summary>
<strong> <a name="policies_limitRange_enabled"></a>8.3.1. [Optional] Property root > policies > limitRange > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_default"></a>8.3.2. [Optional] Property root > policies > limitRange > default</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LimitRangeLimits                                |

<details>
<summary>
<strong> <a name="policies_limitRange_default_ephemeral-storage"></a>8.3.2.1. [Optional] Property root > policies > limitRange > default > ephemeral-storage</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_default_memory"></a>8.3.2.2. [Optional] Property root > policies > limitRange > default > memory</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_default_cpu"></a>8.3.2.3. [Optional] Property root > policies > limitRange > default > cpu</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_defaultRequest"></a>8.3.3. [Optional] Property root > policies > limitRange > defaultRequest</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/LimitRangeLimits                                |

<details>
<summary>
<strong> <a name="policies_limitRange_defaultRequest_ephemeral-storage"></a>8.3.3.1. [Optional] Property root > policies > limitRange > defaultRequest > ephemeral-storage</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_defaultRequest_memory"></a>8.3.3.2. [Optional] Property root > policies > limitRange > defaultRequest > memory</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_limitRange_defaultRequest_cpu"></a>8.3.3.3. [Optional] Property root > policies > limitRange > defaultRequest > cpu</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_networkPolicy"></a>8.4. [Optional] Property root > policies > networkPolicy</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/NetworkPolicy                                   |

<details>
<summary>
<strong> <a name="policies_networkPolicy_enabled"></a>8.4.1. [Optional] Property root > policies > networkPolicy > enabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_networkPolicy_outgoingConnections"></a>8.4.2. [Optional] Property root > policies > networkPolicy > outgoingConnections</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/OutgoingConnections                             |

<details>
<summary>
<strong> <a name="policies_networkPolicy_outgoingConnections_ipBlock"></a>8.4.2.1. [Optional] Property root > policies > networkPolicy > outgoingConnections > ipBlock</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/IPBlock                                         |

**Description:** IPBlock describes a particular CIDR (Ex.

<details>
<summary>
<strong> <a name="policies_networkPolicy_outgoingConnections_ipBlock_cidr"></a>8.4.2.1.1. [Optional] Property root > policies > networkPolicy > outgoingConnections > ipBlock > cidr</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** cidr is a string representing the IPBlock
Valid examples are "192.168.1.0/24" or "2001:db8::/64"

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_networkPolicy_outgoingConnections_ipBlock_except"></a>8.4.2.1.2. [Optional] Property root > policies > networkPolicy > outgoingConnections > ipBlock > except</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** except is a slice of CIDRs that should not be included within an IPBlock
Valid examples are "192.168.1.0/24" or "2001:db8::/64"
Except values will be rejected if they are outside the cidr range
+optional

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                  | Description |
| -------------------------------------------------------------------------------- | ----------- |
| [except items](#policies_networkPolicy_outgoingConnections_ipBlock_except_items) | -           |

##### <a name="autogenerated_heading_57"></a>8.4.2.1.2.1. root > policies > networkPolicy > outgoingConnections > ipBlock > except > except items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_admissionControl"></a>8.5. [Optional] Property root > policies > admissionControl</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/AdmissionControl                                |

<details>
<summary>
<strong> <a name="policies_admissionControl_validatingWebhooks"></a>8.5.1. [Optional] Property root > policies > admissionControl > validatingWebhooks</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | True               |
| **Tuple validation** | N/A                |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="policies_admissionControl_mutatingWebhooks"></a>8.5.2. [Optional] Property root > policies > admissionControl > mutatingWebhooks</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | True               |
| **Tuple validation** | N/A                |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="rbac"></a>9. [Optional] Property root > rbac</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBAC                                            |

<details>
<summary>
<strong> <a name="rbac_clusterRole"></a>9.1. [Optional] Property root > rbac > clusterRole</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACClusterRole                                 |

<details>
<summary>
<strong> <a name="rbac_clusterRole_create"></a>9.1.1. [Optional] Property root > rbac > clusterRole > create</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="rbac_clusterRole_extraRules"></a>9.1.2. [Optional] Property root > rbac > clusterRole > extraRules</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="rbac_role"></a>9.2. [Optional] Property root > rbac > role</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/RBACRole                                        |

<details>
<summary>
<strong> <a name="rbac_role_create"></a>9.2.1. [Optional] Property root > rbac > role > create</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="rbac_role_extraRules"></a>9.2.2. [Optional] Property root > rbac > role > extraRules</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="rbac_role_excludedApiResources"></a>9.2.3. [Optional] Property root > rbac > role > excludedApiResources</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                     | Description |
| ------------------------------------------------------------------- | ----------- |
| [excludedApiResources items](#rbac_role_excludedApiResources_items) | -           |

##### <a name="autogenerated_heading_58"></a>9.2.3.1. root > rbac > role > excludedApiResources > excludedApiResources items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="telemetry"></a>10. [Optional] Property root > telemetry</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Telemetry                                       |

**Description:** Telemetry is the configuration related to telemetry gathered about vcluster usage.

<details>
<summary>
<strong> <a name="telemetry_disabled"></a>10.1. [Optional] Property root > telemetry > disabled</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="telemetry_instanceCreators"></a>10.2. [Optional] Property root > telemetry > instanceCreators</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="telemetry_platformUserID"></a>10.3. [Optional] Property root > telemetry > platformUserID</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="telemetry_platformInstanceID"></a>10.4. [Optional] Property root > telemetry > platformInstanceID</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="telemetry_machineID"></a>10.5. [Optional] Property root > telemetry > machineID</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental"></a>11. [Optional] Property root > experimental</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Experimental                                    |

<details>
<summary>
<strong> <a name="experimental_Extended"></a>11.1. [Optional] Property root > experimental > Extended</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_controlPlaneSettings"></a>11.2. [Optional] Property root > experimental > controlPlaneSettings</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExperimentalControlPlaneSettings                |

<details>
<summary>
<strong> <a name="experimental_controlPlaneSettings_rewriteKubernetesService"></a>11.2.1. [Optional] Property root > experimental > controlPlaneSettings > rewriteKubernetesService</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncSettings"></a>11.3. [Optional] Property root > experimental > syncSettings</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExperimentalSyncSettings                        |

<details>
<summary>
<strong> <a name="experimental_syncSettings_disableSync"></a>11.3.1. [Optional] Property root > experimental > syncSettings > disableSync</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncSettings_target"></a>11.3.2. [Optional] Property root > experimental > syncSettings > target</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExperimentalSyncSettingsTarget                  |

<details>
<summary>
<strong> <a name="experimental_syncSettings_target_namespace"></a>11.3.2.1. [Optional] Property root > experimental > syncSettings > target > namespace</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches"></a>11.4. [Optional] Property root > experimental > syncPatches</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncPatches                                     |

<details>
<summary>
<strong> <a name="experimental_syncPatches_version"></a>11.4.1. [Optional] Property root > experimental > syncPatches > version</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Version is the config version

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export"></a>11.4.2. [Optional] Property root > experimental > syncPatches > export</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Exports syncs a resource from the virtual cluster to the host

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                  | Description |
| ------------------------------------------------ | ----------- |
| [Export](#experimental_syncPatches_export_items) | -           |

##### <a name="autogenerated_heading_59"></a>11.4.2.1. root > experimental > syncPatches > export > Export

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Export                                          |

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_apiVersion"></a>11.4.2.1.1. [Optional] Property root > experimental > syncPatches > export > export items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_kind"></a>11.4.2.1.2. [Optional] Property root > experimental > syncPatches > export > export items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_optional"></a>11.4.2.1.3. [Optional] Property root > experimental > syncPatches > export > export items > optional</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_replaceOnConflict"></a>11.4.2.1.4. [Optional] Property root > experimental > syncPatches > export > export items > replaceOnConflict</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** ReplaceWhenInvalid determines if the controller should try to recreate the object
if there is a problem applying

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches"></a>11.4.2.1.5. [Optional] Property root > experimental > syncPatches > export > export items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the virtual cluster objects
when syncing them from the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                               | Description |
| ------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_export_items_patches_items) | -           |

##### <a name="autogenerated_heading_60"></a>11.4.2.1.5.1. root > experimental > syncPatches > export > export items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_op"></a>11.4.2.1.5.1.1. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_fromPath"></a>11.4.2.1.5.1.2. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_path"></a>11.4.2.1.5.1.3. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_namePath"></a>11.4.2.1.5.1.4. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_namespacePath"></a>11.4.2.1.5.1.5. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_value"></a>11.4.2.1.5.1.6. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_regex"></a>11.4.2.1.5.1.7. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions"></a>11.4.2.1.5.1.8. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_export_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_61"></a>11.4.2.1.5.1.8.1. root > experimental > syncPatches > export > export items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions_items_path"></a>11.4.2.1.5.1.8.1.1. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions_items_subPath"></a>11.4.2.1.5.1.8.1.2. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions_items_equal"></a>11.4.2.1.5.1.8.1.3. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions_items_notEqual"></a>11.4.2.1.5.1.8.1.4. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_conditions_items_empty"></a>11.4.2.1.5.1.8.1.5. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_ignore"></a>11.4.2.1.5.1.9. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_sync"></a>11.4.2.1.5.1.10. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_sync_secret"></a>11.4.2.1.5.1.10.1. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_patches_items_sync_configmap"></a>11.4.2.1.5.1.10.2. [Optional] Property root > experimental > syncPatches > export > export items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches"></a>11.4.2.1.6. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** ReversePatches are the patches to apply to host cluster objects
after it has been synced to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                      | Description |
| -------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_export_items_reversePatches_items) | -           |

##### <a name="autogenerated_heading_62"></a>11.4.2.1.6.1. root > experimental > syncPatches > export > export items > reversePatches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_op"></a>11.4.2.1.6.1.1. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_fromPath"></a>11.4.2.1.6.1.2. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_path"></a>11.4.2.1.6.1.3. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_namePath"></a>11.4.2.1.6.1.4. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_namespacePath"></a>11.4.2.1.6.1.5. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_value"></a>11.4.2.1.6.1.6. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_regex"></a>11.4.2.1.6.1.7. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions"></a>11.4.2.1.6.1.8. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                | Description |
| ---------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_export_items_reversePatches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_63"></a>11.4.2.1.6.1.8.1. root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions_items_path"></a>11.4.2.1.6.1.8.1.1. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions_items_subPath"></a>11.4.2.1.6.1.8.1.2. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions_items_equal"></a>11.4.2.1.6.1.8.1.3. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions_items_notEqual"></a>11.4.2.1.6.1.8.1.4. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_conditions_items_empty"></a>11.4.2.1.6.1.8.1.5. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_ignore"></a>11.4.2.1.6.1.9. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_sync"></a>11.4.2.1.6.1.10. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_sync_secret"></a>11.4.2.1.6.1.10.1. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_reversePatches_items_sync_configmap"></a>11.4.2.1.6.1.10.2. [Optional] Property root > experimental > syncPatches > export > export items > reversePatches > reversePatches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_selector"></a>11.4.2.1.7. [Optional] Property root > experimental > syncPatches > export > export items > selector</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Selector                                        |

**Description:** Selector is a label selector to select the synced objects in the virtual cluster.
If empty, all objects will be synced.

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_selector_labelSelector"></a>11.4.2.1.7.1. [Optional] Property root > experimental > syncPatches > export > export items > selector > labelSelector</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                               |
| **Required**              | No                                                                                                                                                                     |
| **Additional properties** | [[Should-conform]](#experimental_syncPatches_export_items_selector_labelSelector_additionalProperties "Each additional property must conform to the following schema") |

**Description:** LabelSelector are the labels to select the object from

<details>
<summary>
<strong> <a name="experimental_syncPatches_export_items_selector_labelSelector_additionalProperties"></a>11.4.2.1.7.1.1. Property root > experimental > syncPatches > export > export items > selector > labelSelector > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import"></a>11.4.3. [Optional] Property root > experimental > syncPatches > import</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Imports syncs a resource from the host cluster to virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                  | Description |
| ------------------------------------------------ | ----------- |
| [Import](#experimental_syncPatches_import_items) | -           |

##### <a name="autogenerated_heading_64"></a>11.4.3.1. root > experimental > syncPatches > import > Import

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Import                                          |

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_apiVersion"></a>11.4.3.1.1. [Optional] Property root > experimental > syncPatches > import > import items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_kind"></a>11.4.3.1.2. [Optional] Property root > experimental > syncPatches > import > import items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_optional"></a>11.4.3.1.3. [Optional] Property root > experimental > syncPatches > import > import items > optional</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_replaceOnConflict"></a>11.4.3.1.4. [Optional] Property root > experimental > syncPatches > import > import items > replaceOnConflict</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** ReplaceWhenInvalid determines if the controller should try to recreate the object
if there is a problem applying

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches"></a>11.4.3.1.5. [Optional] Property root > experimental > syncPatches > import > import items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the virtual cluster objects
when syncing them from the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                               | Description |
| ------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_import_items_patches_items) | -           |

##### <a name="autogenerated_heading_65"></a>11.4.3.1.5.1. root > experimental > syncPatches > import > import items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_op"></a>11.4.3.1.5.1.1. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_fromPath"></a>11.4.3.1.5.1.2. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_path"></a>11.4.3.1.5.1.3. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_namePath"></a>11.4.3.1.5.1.4. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_namespacePath"></a>11.4.3.1.5.1.5. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_value"></a>11.4.3.1.5.1.6. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_regex"></a>11.4.3.1.5.1.7. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions"></a>11.4.3.1.5.1.8. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_import_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_66"></a>11.4.3.1.5.1.8.1. root > experimental > syncPatches > import > import items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions_items_path"></a>11.4.3.1.5.1.8.1.1. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions_items_subPath"></a>11.4.3.1.5.1.8.1.2. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions_items_equal"></a>11.4.3.1.5.1.8.1.3. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions_items_notEqual"></a>11.4.3.1.5.1.8.1.4. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_conditions_items_empty"></a>11.4.3.1.5.1.8.1.5. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_ignore"></a>11.4.3.1.5.1.9. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_sync"></a>11.4.3.1.5.1.10. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_sync_secret"></a>11.4.3.1.5.1.10.1. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_patches_items_sync_configmap"></a>11.4.3.1.5.1.10.2. [Optional] Property root > experimental > syncPatches > import > import items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches"></a>11.4.3.1.6. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** ReversePatches are the patches to apply to host cluster objects
after it has been synced to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                      | Description |
| -------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_import_items_reversePatches_items) | -           |

##### <a name="autogenerated_heading_67"></a>11.4.3.1.6.1. root > experimental > syncPatches > import > import items > reversePatches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_op"></a>11.4.3.1.6.1.1. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_fromPath"></a>11.4.3.1.6.1.2. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_path"></a>11.4.3.1.6.1.3. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_namePath"></a>11.4.3.1.6.1.4. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_namespacePath"></a>11.4.3.1.6.1.5. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_value"></a>11.4.3.1.6.1.6. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_regex"></a>11.4.3.1.6.1.7. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions"></a>11.4.3.1.6.1.8. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                | Description |
| ---------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_import_items_reversePatches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_68"></a>11.4.3.1.6.1.8.1. root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions_items_path"></a>11.4.3.1.6.1.8.1.1. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions_items_subPath"></a>11.4.3.1.6.1.8.1.2. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions_items_equal"></a>11.4.3.1.6.1.8.1.3. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions_items_notEqual"></a>11.4.3.1.6.1.8.1.4. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_conditions_items_empty"></a>11.4.3.1.6.1.8.1.5. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_ignore"></a>11.4.3.1.6.1.9. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_sync"></a>11.4.3.1.6.1.10. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_sync_secret"></a>11.4.3.1.6.1.10.1. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_import_items_reversePatches_items_sync_configmap"></a>11.4.3.1.6.1.10.2. [Optional] Property root > experimental > syncPatches > import > import items > reversePatches > reversePatches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks"></a>11.4.4. [Optional] Property root > experimental > syncPatches > hooks</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hooks                                           |

**Description:** Hooks are hooks that can be used to inject custom patches before syncing

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual"></a>11.4.4.1. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** HostToVirtual is a hook that is executed before syncing from the host to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [Hook](#experimental_syncPatches_hooks_hostToVirtual_items) | -           |

##### <a name="autogenerated_heading_69"></a>11.4.4.1.1. root > experimental > syncPatches > hooks > hostToVirtual > Hook

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hook                                            |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_apiVersion"></a>11.4.4.1.1.1. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_kind"></a>11.4.4.1.1.2. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_verbs"></a>11.4.4.1.1.3. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs are the verbs that the hook should mutate

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                | Description |
| ------------------------------------------------------------------------------ | ----------- |
| [verbs items](#experimental_syncPatches_hooks_hostToVirtual_items_verbs_items) | -           |

##### <a name="autogenerated_heading_70"></a>11.4.4.1.1.3.1. root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches"></a>11.4.4.1.1.4. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the object to be synced

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                            | Description |
| -------------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_hooks_hostToVirtual_items_patches_items) | -           |

##### <a name="autogenerated_heading_71"></a>11.4.4.1.1.4.1. root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_op"></a>11.4.4.1.1.4.1.1. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_fromPath"></a>11.4.4.1.1.4.1.2. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_path"></a>11.4.4.1.1.4.1.3. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_namePath"></a>11.4.4.1.1.4.1.4. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_namespacePath"></a>11.4.4.1.1.4.1.5. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_value"></a>11.4.4.1.1.4.1.6. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_regex"></a>11.4.4.1.1.4.1.7. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions"></a>11.4.4.1.1.4.1.8. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                      | Description |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_72"></a>11.4.4.1.1.4.1.8.1. root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items_path"></a>11.4.4.1.1.4.1.8.1.1. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items_subPath"></a>11.4.4.1.1.4.1.8.1.2. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items_equal"></a>11.4.4.1.1.4.1.8.1.3. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items_notEqual"></a>11.4.4.1.1.4.1.8.1.4. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_conditions_items_empty"></a>11.4.4.1.1.4.1.8.1.5. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_ignore"></a>11.4.4.1.1.4.1.9. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_sync"></a>11.4.4.1.1.4.1.10. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_sync_secret"></a>11.4.4.1.1.4.1.10.1. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_hostToVirtual_items_patches_items_sync_configmap"></a>11.4.4.1.1.4.1.10.2. [Optional] Property root > experimental > syncPatches > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost"></a>11.4.4.2. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** VirtualToHost is a hook that is executed before syncing from the virtual to the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [Hook](#experimental_syncPatches_hooks_virtualToHost_items) | -           |

##### <a name="autogenerated_heading_73"></a>11.4.4.2.1. root > experimental > syncPatches > hooks > virtualToHost > Hook

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hook                                            |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_apiVersion"></a>11.4.4.2.1.1. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_kind"></a>11.4.4.2.1.2. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_verbs"></a>11.4.4.2.1.3. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs are the verbs that the hook should mutate

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                | Description |
| ------------------------------------------------------------------------------ | ----------- |
| [verbs items](#experimental_syncPatches_hooks_virtualToHost_items_verbs_items) | -           |

##### <a name="autogenerated_heading_74"></a>11.4.4.2.1.3.1. root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches"></a>11.4.4.2.1.4. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the object to be synced

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                            | Description |
| -------------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_syncPatches_hooks_virtualToHost_items_patches_items) | -           |

##### <a name="autogenerated_heading_75"></a>11.4.4.2.1.4.1. root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_op"></a>11.4.4.2.1.4.1.1. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_fromPath"></a>11.4.4.2.1.4.1.2. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_path"></a>11.4.4.2.1.4.1.3. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_namePath"></a>11.4.4.2.1.4.1.4. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_namespacePath"></a>11.4.4.2.1.4.1.5. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_value"></a>11.4.4.2.1.4.1.6. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_regex"></a>11.4.4.2.1.4.1.7. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions"></a>11.4.4.2.1.4.1.8. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                      | Description |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_76"></a>11.4.4.2.1.4.1.8.1. root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items_path"></a>11.4.4.2.1.4.1.8.1.1. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items_subPath"></a>11.4.4.2.1.4.1.8.1.2. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items_equal"></a>11.4.4.2.1.4.1.8.1.3. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items_notEqual"></a>11.4.4.2.1.4.1.8.1.4. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_conditions_items_empty"></a>11.4.4.2.1.4.1.8.1.5. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_ignore"></a>11.4.4.2.1.4.1.9. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_sync"></a>11.4.4.2.1.4.1.10. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_sync_secret"></a>11.4.4.2.1.4.1.10.1. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_syncPatches_hooks_virtualToHost_items_patches_items_sync_configmap"></a>11.4.4.2.1.4.1.10.2. [Optional] Property root > experimental > syncPatches > hooks > virtualToHost > virtualToHost items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync"></a>11.5. [Optional] Property root > experimental > genericSync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SyncPatches                                     |

<details>
<summary>
<strong> <a name="experimental_genericSync_version"></a>11.5.1. [Optional] Property root > experimental > genericSync > version</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Version is the config version

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export"></a>11.5.2. [Optional] Property root > experimental > genericSync > export</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Exports syncs a resource from the virtual cluster to the host

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                  | Description |
| ------------------------------------------------ | ----------- |
| [Export](#experimental_genericSync_export_items) | -           |

##### <a name="autogenerated_heading_77"></a>11.5.2.1. root > experimental > genericSync > export > Export

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Export                                          |

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_apiVersion"></a>11.5.2.1.1. [Optional] Property root > experimental > genericSync > export > export items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_kind"></a>11.5.2.1.2. [Optional] Property root > experimental > genericSync > export > export items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_optional"></a>11.5.2.1.3. [Optional] Property root > experimental > genericSync > export > export items > optional</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_replaceOnConflict"></a>11.5.2.1.4. [Optional] Property root > experimental > genericSync > export > export items > replaceOnConflict</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** ReplaceWhenInvalid determines if the controller should try to recreate the object
if there is a problem applying

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches"></a>11.5.2.1.5. [Optional] Property root > experimental > genericSync > export > export items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the virtual cluster objects
when syncing them from the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                               | Description |
| ------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_export_items_patches_items) | -           |

##### <a name="autogenerated_heading_78"></a>11.5.2.1.5.1. root > experimental > genericSync > export > export items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_op"></a>11.5.2.1.5.1.1. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_fromPath"></a>11.5.2.1.5.1.2. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_path"></a>11.5.2.1.5.1.3. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_namePath"></a>11.5.2.1.5.1.4. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_namespacePath"></a>11.5.2.1.5.1.5. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_value"></a>11.5.2.1.5.1.6. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_regex"></a>11.5.2.1.5.1.7. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions"></a>11.5.2.1.5.1.8. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_export_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_79"></a>11.5.2.1.5.1.8.1. root > experimental > genericSync > export > export items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions_items_path"></a>11.5.2.1.5.1.8.1.1. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions_items_subPath"></a>11.5.2.1.5.1.8.1.2. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions_items_equal"></a>11.5.2.1.5.1.8.1.3. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions_items_notEqual"></a>11.5.2.1.5.1.8.1.4. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_conditions_items_empty"></a>11.5.2.1.5.1.8.1.5. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_ignore"></a>11.5.2.1.5.1.9. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_sync"></a>11.5.2.1.5.1.10. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_sync_secret"></a>11.5.2.1.5.1.10.1. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_patches_items_sync_configmap"></a>11.5.2.1.5.1.10.2. [Optional] Property root > experimental > genericSync > export > export items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches"></a>11.5.2.1.6. [Optional] Property root > experimental > genericSync > export > export items > reversePatches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** ReversePatches are the patches to apply to host cluster objects
after it has been synced to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                      | Description |
| -------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_export_items_reversePatches_items) | -           |

##### <a name="autogenerated_heading_80"></a>11.5.2.1.6.1. root > experimental > genericSync > export > export items > reversePatches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_op"></a>11.5.2.1.6.1.1. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_fromPath"></a>11.5.2.1.6.1.2. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_path"></a>11.5.2.1.6.1.3. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_namePath"></a>11.5.2.1.6.1.4. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_namespacePath"></a>11.5.2.1.6.1.5. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_value"></a>11.5.2.1.6.1.6. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_regex"></a>11.5.2.1.6.1.7. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions"></a>11.5.2.1.6.1.8. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                | Description |
| ---------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_export_items_reversePatches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_81"></a>11.5.2.1.6.1.8.1. root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions_items_path"></a>11.5.2.1.6.1.8.1.1. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions_items_subPath"></a>11.5.2.1.6.1.8.1.2. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions_items_equal"></a>11.5.2.1.6.1.8.1.3. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions_items_notEqual"></a>11.5.2.1.6.1.8.1.4. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_conditions_items_empty"></a>11.5.2.1.6.1.8.1.5. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_ignore"></a>11.5.2.1.6.1.9. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_sync"></a>11.5.2.1.6.1.10. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_sync_secret"></a>11.5.2.1.6.1.10.1. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_reversePatches_items_sync_configmap"></a>11.5.2.1.6.1.10.2. [Optional] Property root > experimental > genericSync > export > export items > reversePatches > reversePatches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_selector"></a>11.5.2.1.7. [Optional] Property root > experimental > genericSync > export > export items > selector</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Selector                                        |

**Description:** Selector is a label selector to select the synced objects in the virtual cluster.
If empty, all objects will be synced.

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_selector_labelSelector"></a>11.5.2.1.7.1. [Optional] Property root > experimental > genericSync > export > export items > selector > labelSelector</strong>  

</summary>
<blockquote>

|                           |                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                                                               |
| **Required**              | No                                                                                                                                                                     |
| **Additional properties** | [[Should-conform]](#experimental_genericSync_export_items_selector_labelSelector_additionalProperties "Each additional property must conform to the following schema") |

**Description:** LabelSelector are the labels to select the object from

<details>
<summary>
<strong> <a name="experimental_genericSync_export_items_selector_labelSelector_additionalProperties"></a>11.5.2.1.7.1.1. Property root > experimental > genericSync > export > export items > selector > labelSelector > additionalProperties</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import"></a>11.5.3. [Optional] Property root > experimental > genericSync > import</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Imports syncs a resource from the host cluster to virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                  | Description |
| ------------------------------------------------ | ----------- |
| [Import](#experimental_genericSync_import_items) | -           |

##### <a name="autogenerated_heading_82"></a>11.5.3.1. root > experimental > genericSync > import > Import

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Import                                          |

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_apiVersion"></a>11.5.3.1.1. [Optional] Property root > experimental > genericSync > import > import items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_kind"></a>11.5.3.1.2. [Optional] Property root > experimental > genericSync > import > import items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_optional"></a>11.5.3.1.3. [Optional] Property root > experimental > genericSync > import > import items > optional</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_replaceOnConflict"></a>11.5.3.1.4. [Optional] Property root > experimental > genericSync > import > import items > replaceOnConflict</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** ReplaceWhenInvalid determines if the controller should try to recreate the object
if there is a problem applying

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches"></a>11.5.3.1.5. [Optional] Property root > experimental > genericSync > import > import items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the virtual cluster objects
when syncing them from the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                               | Description |
| ------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_import_items_patches_items) | -           |

##### <a name="autogenerated_heading_83"></a>11.5.3.1.5.1. root > experimental > genericSync > import > import items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_op"></a>11.5.3.1.5.1.1. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_fromPath"></a>11.5.3.1.5.1.2. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_path"></a>11.5.3.1.5.1.3. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_namePath"></a>11.5.3.1.5.1.4. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_namespacePath"></a>11.5.3.1.5.1.5. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_value"></a>11.5.3.1.5.1.6. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_regex"></a>11.5.3.1.5.1.7. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions"></a>11.5.3.1.5.1.8. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                         | Description |
| --------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_import_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_84"></a>11.5.3.1.5.1.8.1. root > experimental > genericSync > import > import items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions_items_path"></a>11.5.3.1.5.1.8.1.1. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions_items_subPath"></a>11.5.3.1.5.1.8.1.2. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions_items_equal"></a>11.5.3.1.5.1.8.1.3. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions_items_notEqual"></a>11.5.3.1.5.1.8.1.4. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_conditions_items_empty"></a>11.5.3.1.5.1.8.1.5. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_ignore"></a>11.5.3.1.5.1.9. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_sync"></a>11.5.3.1.5.1.10. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_sync_secret"></a>11.5.3.1.5.1.10.1. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_patches_items_sync_configmap"></a>11.5.3.1.5.1.10.2. [Optional] Property root > experimental > genericSync > import > import items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches"></a>11.5.3.1.6. [Optional] Property root > experimental > genericSync > import > import items > reversePatches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** ReversePatches are the patches to apply to host cluster objects
after it has been synced to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                      | Description |
| -------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_import_items_reversePatches_items) | -           |

##### <a name="autogenerated_heading_85"></a>11.5.3.1.6.1. root > experimental > genericSync > import > import items > reversePatches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_op"></a>11.5.3.1.6.1.1. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_fromPath"></a>11.5.3.1.6.1.2. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_path"></a>11.5.3.1.6.1.3. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_namePath"></a>11.5.3.1.6.1.4. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_namespacePath"></a>11.5.3.1.6.1.5. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_value"></a>11.5.3.1.6.1.6. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_regex"></a>11.5.3.1.6.1.7. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions"></a>11.5.3.1.6.1.8. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                | Description |
| ---------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_import_items_reversePatches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_86"></a>11.5.3.1.6.1.8.1. root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions_items_path"></a>11.5.3.1.6.1.8.1.1. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions_items_subPath"></a>11.5.3.1.6.1.8.1.2. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions_items_equal"></a>11.5.3.1.6.1.8.1.3. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions_items_notEqual"></a>11.5.3.1.6.1.8.1.4. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_conditions_items_empty"></a>11.5.3.1.6.1.8.1.5. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_ignore"></a>11.5.3.1.6.1.9. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_sync"></a>11.5.3.1.6.1.10. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_sync_secret"></a>11.5.3.1.6.1.10.1. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_import_items_reversePatches_items_sync_configmap"></a>11.5.3.1.6.1.10.2. [Optional] Property root > experimental > genericSync > import > import items > reversePatches > reversePatches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks"></a>11.5.4. [Optional] Property root > experimental > genericSync > hooks</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hooks                                           |

**Description:** Hooks are hooks that can be used to inject custom patches before syncing

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual"></a>11.5.4.1. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** HostToVirtual is a hook that is executed before syncing from the host to the virtual cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [Hook](#experimental_genericSync_hooks_hostToVirtual_items) | -           |

##### <a name="autogenerated_heading_87"></a>11.5.4.1.1. root > experimental > genericSync > hooks > hostToVirtual > Hook

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hook                                            |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_apiVersion"></a>11.5.4.1.1.1. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_kind"></a>11.5.4.1.1.2. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_verbs"></a>11.5.4.1.1.3. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs are the verbs that the hook should mutate

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                | Description |
| ------------------------------------------------------------------------------ | ----------- |
| [verbs items](#experimental_genericSync_hooks_hostToVirtual_items_verbs_items) | -           |

##### <a name="autogenerated_heading_88"></a>11.5.4.1.1.3.1. root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches"></a>11.5.4.1.1.4. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the object to be synced

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                            | Description |
| -------------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_hooks_hostToVirtual_items_patches_items) | -           |

##### <a name="autogenerated_heading_89"></a>11.5.4.1.1.4.1. root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_op"></a>11.5.4.1.1.4.1.1. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_fromPath"></a>11.5.4.1.1.4.1.2. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_path"></a>11.5.4.1.1.4.1.3. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_namePath"></a>11.5.4.1.1.4.1.4. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_namespacePath"></a>11.5.4.1.1.4.1.5. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_value"></a>11.5.4.1.1.4.1.6. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_regex"></a>11.5.4.1.1.4.1.7. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions"></a>11.5.4.1.1.4.1.8. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                      | Description |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_90"></a>11.5.4.1.1.4.1.8.1. root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items_path"></a>11.5.4.1.1.4.1.8.1.1. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items_subPath"></a>11.5.4.1.1.4.1.8.1.2. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items_equal"></a>11.5.4.1.1.4.1.8.1.3. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items_notEqual"></a>11.5.4.1.1.4.1.8.1.4. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_conditions_items_empty"></a>11.5.4.1.1.4.1.8.1.5. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_ignore"></a>11.5.4.1.1.4.1.9. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_sync"></a>11.5.4.1.1.4.1.10. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_sync_secret"></a>11.5.4.1.1.4.1.10.1. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_hostToVirtual_items_patches_items_sync_configmap"></a>11.5.4.1.1.4.1.10.2. [Optional] Property root > experimental > genericSync > hooks > hostToVirtual > hostToVirtual items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost"></a>11.5.4.2. [Optional] Property root > experimental > genericSync > hooks > virtualToHost</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** VirtualToHost is a hook that is executed before syncing from the virtual to the host cluster

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [Hook](#experimental_genericSync_hooks_virtualToHost_items) | -           |

##### <a name="autogenerated_heading_91"></a>11.5.4.2.1. root > experimental > genericSync > hooks > virtualToHost > Hook

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Hook                                            |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_apiVersion"></a>11.5.4.2.1.1. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > apiVersion</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** APIVersion of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_kind"></a>11.5.4.2.1.2. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > kind</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Kind of the object to sync

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_verbs"></a>11.5.4.2.1.3. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > verbs</strong>  

</summary>
<blockquote>

|              |                   |
| ------------ | ----------------- |
| **Type**     | `array of string` |
| **Required** | No                |

**Description:** Verbs are the verbs that the hook should mutate

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                | Description |
| ------------------------------------------------------------------------------ | ----------- |
| [verbs items](#experimental_genericSync_hooks_virtualToHost_items_verbs_items) | -           |

##### <a name="autogenerated_heading_92"></a>11.5.4.2.1.3.1. root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > verbs > verbs items

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches"></a>11.5.4.2.1.4. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Patches are the patches to apply on the object to be synced

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                            | Description |
| -------------------------------------------------------------------------- | ----------- |
| [Patch](#experimental_genericSync_hooks_virtualToHost_items_patches_items) | -           |

##### <a name="autogenerated_heading_93"></a>11.5.4.2.1.4.1. root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > Patch

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Patch                                           |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_op"></a>11.5.4.2.1.4.1.1. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > op</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Operation is the type of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_fromPath"></a>11.5.4.2.1.4.1.2. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > fromPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** FromPath is the path from the other object

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_path"></a>11.5.4.2.1.4.1.3. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path of the patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_namePath"></a>11.5.4.2.1.4.1.4. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > namePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamePath is the path to the name of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_namespacePath"></a>11.5.4.2.1.4.1.5. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > namespacePath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** NamespacePath is path to the namespace of a child resource within Path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_value"></a>11.5.4.2.1.4.1.6. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > value</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Value is the new value to be set to the path

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_regex"></a>11.5.4.2.1.4.1.7. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > regex</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Regex - is regular expresion used to identify the Name,
and optionally Namespace, parts of the field value that
will be replaced with the rewritten Name and/or Namespace

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions"></a>11.5.4.2.1.4.1.8. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

**Description:** Conditions are conditions that must be true for
the patch to get executed

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                                                      | Description |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| [PatchCondition](#experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items) | -           |

##### <a name="autogenerated_heading_94"></a>11.5.4.2.1.4.1.8.1. root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > PatchCondition

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchCondition                                  |

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items_path"></a>11.5.4.2.1.4.1.8.1.1. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > path</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** Path is the path within the object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items_subPath"></a>11.5.4.2.1.4.1.8.1.2. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > subPath</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** SubPath is the path below the selected object to select

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items_equal"></a>11.5.4.2.1.4.1.8.1.3. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > equal</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** Equal is the value the path should be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items_notEqual"></a>11.5.4.2.1.4.1.8.1.4. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > notEqual</strong>  

</summary>
<blockquote>

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |

**Description:** NotEqual is the value the path should not be equal to

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_conditions_items_empty"></a>11.5.4.2.1.4.1.8.1.5. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > conditions > conditions items > empty</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Empty means that the path value should be empty or unset

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_ignore"></a>11.5.4.2.1.4.1.9. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > ignore</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

**Description:** Ignore determines if the path should be ignored if handled as a reverse patch

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_sync"></a>11.5.4.2.1.4.1.10. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > sync</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/PatchSync                                       |

**Description:** Sync defines if a specialized syncer should be initialized using values
from the rewriteName operation as Secret/Configmap names to be synced

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_sync_secret"></a>11.5.4.2.1.4.1.10.1. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > sync > secret</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_genericSync_hooks_virtualToHost_items_patches_items_sync_configmap"></a>11.5.4.2.1.4.1.10.2. [Optional] Property root > experimental > genericSync > hooks > virtualToHost > virtualToHost items > patches > patches items > sync > configmap</strong>  

</summary>
<blockquote>

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | No        |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_deploy"></a>11.6. [Optional] Property root > experimental > deploy</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/ExperimentalDeploy                              |

<details>
<summary>
<strong> <a name="experimental_deploy_manifests"></a>11.6.1. [Optional] Property root > experimental > deploy > manifests</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_deploy_manifestsTemplate"></a>11.6.2. [Optional] Property root > experimental > deploy > manifestsTemplate</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="experimental_deploy_helm"></a>11.6.3. [Optional] Property root > experimental > deploy > helm</strong>  

</summary>
<blockquote>

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | True               |
| **Tuple validation** | N/A                |

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="license"></a>12. [Optional] Property root > license</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SecretKeyReference                              |

<details>
<summary>
<strong> <a name="license_key"></a>12.1. [Optional] Property root > license > key</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="license_keySecretRef"></a>12.2. [Optional] Property root > license > keySecretRef</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SecretReference                                 |

**Description:** SecretReference represents a Secret Reference.

<details>
<summary>
<strong> <a name="license_keySecretRef_name"></a>12.2.1. [Optional] Property root > license > keySecretRef > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** name is unique within a namespace to reference a secret resource.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="license_keySecretRef_namespace"></a>12.2.2. [Optional] Property root > license > keySecretRef > namespace</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** namespace defines the space within which the secret name must be unique.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform"></a>13. [Optional] Property root > platform</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/Platform                                        |

<details>
<summary>
<strong> <a name="platform_name"></a>13.1. [Optional] Property root > platform > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform_owner"></a>13.2. [Optional] Property root > platform > owner</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform_project"></a>13.3. [Optional] Property root > platform > project</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform_apiKey"></a>13.4. [Optional] Property root > platform > apiKey</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SecretKeyReference                              |

<details>
<summary>
<strong> <a name="platform_apiKey_key"></a>13.4.1. [Optional] Property root > platform > apiKey > key</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform_apiKey_keySecretRef"></a>13.4.2. [Optional] Property root > platform > apiKey > keySecretRef</strong>  

</summary>
<blockquote>

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/$defs/SecretReference                                 |

**Description:** SecretReference represents a Secret Reference.

<details>
<summary>
<strong> <a name="platform_apiKey_keySecretRef_name"></a>13.4.2.1. [Optional] Property root > platform > apiKey > keySecretRef > name</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** name is unique within a namespace to reference a secret resource.

</blockquote>
</details>

<details>
<summary>
<strong> <a name="platform_apiKey_keySecretRef_namespace"></a>13.4.2.2. [Optional] Property root > platform > apiKey > keySecretRef > namespace</strong>  

</summary>
<blockquote>

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Description:** namespace defines the space within which the secret name must be unique.

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

</blockquote>
</details>

----------------------------------------------------------------------------------------------------------------------------
Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans) on 2024-03-06 at 10:47:55 +0100