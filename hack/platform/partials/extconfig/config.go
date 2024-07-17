package extconfig

import "github.com/loft-sh/vcluster-config/config"

// External holds external tool configuration
type External struct {
	Platform Platform `json:"platform"`
}

// Platform holds configuration for vCluster platform
type Platform struct {
	// APIKey defines where to find the platform access key and host. By default, vCluster will search in the following locations in this precedence:
	// * platform.api.accessKey
	// * environment variable called LICENSE
	// * secret specified under external.platform.apiKey.secretName
	// * secret called "vcluster-platform-api-key" in the vCluster namespace
	APIKey config.PlatformAPIKey `json:"apiKey,omitempty"`

	// AutoSleep holds configuration for automatic sleep and wakeup
	// +optional
	AutoSleep *AutoSleep `json:"autoSleep,omitempty"`

	// AutoDelete holds configuration for automatic delete
	// +optional
	AutoDelete *AutoDelete `json:"autoDelete,omitempty"`
}

// Config represents the external config for vcluster.yaml to generate associated partials
type Config struct {
	External External `json:"external"`
}

type AutoSleep struct {
	// AfterInactivity specifies after how many seconds of inactivity the virtual cluster should sleep
	// +optional
	AfterInactivity int64 `json:"afterInactivity,omitempty"`

	// Schedule specifies scheduled virtual cluster sleep in Cron format, see https://en.wikipedia.org/wiki/Cron.
	// Note: timezone defined in the schedule string will be ignored. Use ".Timezone" field instead.
	// +optional
	Schedule string `json:"schedule,omitempty"`

	// Timezone specifies time zone used for scheduled virtual cluster operations. Defaults to UTC.
	// Accepts the same format as time.LoadLocation() in Go (https://pkg.go.dev/time#LoadLocation).
	// The value should be a location name corresponding to a file in the IANA Time Zone database, such as "America/New_York".
	// +optional
	Timezone string `json:"timezone,omitempty"`

	// AutoSleep holds configuration for automatic wakeup
	// +optional
	AutoWakeup *AutoWakeup `json:"autoWakeup,omitempty"`
}

type AutoWakeup struct {
	// Schedule specifies scheduled wakeup from sleep in Cron format, see https://en.wikipedia.org/wiki/Cron.
	// Note: timezone defined in the schedule string will be ignored. The timezone for the autoSleep schedule will be
	// used
	// +optional
	Schedule string `json:"schedule,omitempty"`
}

type AutoDelete struct {
	// AfterInactivity specifies after how many seconds of inactivity the virtual cluster be deleted
	// +optional
	AfterInactivity int64 `json:"afterInactivity,omitempty"`
}
