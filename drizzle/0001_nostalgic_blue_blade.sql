CREATE TABLE `alert_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` varchar(32) NOT NULL,
	`severity` varchar(32) NOT NULL,
	`stationId` varchar(32),
	`stationName` varchar(64),
	`triggerValue` float,
	`threshold` float,
	`message` text NOT NULL,
	`isActive` boolean DEFAULT true,
	`triggeredAt` timestamp NOT NULL,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` varchar(32) NOT NULL,
	`warningThreshold` float NOT NULL,
	`dangerThreshold` float NOT NULL,
	`criticalThreshold` float,
	`unit` varchar(16) NOT NULL,
	`description` text,
	`isEnabled` boolean DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_thresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(128) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `water_level_observations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`stationName` varchar(64) NOT NULL,
	`observationTime` timestamp NOT NULL,
	`innerLevel` float,
	`outerLevel` float,
	`pumpCount` int,
	`gateStatus` varchar(64),
	`warningStatus` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `water_level_observations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weather_observations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`stationName` varchar(64) NOT NULL,
	`townName` varchar(64),
	`observationTime` timestamp NOT NULL,
	`temperature` float,
	`humidity` float,
	`windSpeed` float,
	`windDirection` float,
	`gustSpeed` float,
	`airPressure` float,
	`rain1hr` float,
	`rain24hr` float,
	`weather` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weather_observations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `alert_active_idx` ON `alert_logs` (`isActive`);--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `alert_logs` (`alertType`);--> statement-breakpoint
CREATE INDEX `water_station_time_idx` ON `water_level_observations` (`stationId`,`observationTime`);--> statement-breakpoint
CREATE INDEX `water_time_idx` ON `water_level_observations` (`observationTime`);--> statement-breakpoint
CREATE INDEX `weather_station_time_idx` ON `weather_observations` (`stationId`,`observationTime`);--> statement-breakpoint
CREATE INDEX `weather_time_idx` ON `weather_observations` (`observationTime`);