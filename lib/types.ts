import type { BigQueryCredentials } from "./profile/bigquery";
import type { PostgresCredentials } from "./profile/postgres";
import type { RedshiftCredentials } from "./profile/redshift";
import type { SnowflakeCredentials } from "./profile/snowflake";

export type Credentials = SnowflakeCredentials | BigQueryCredentials | RedshiftCredentials | PostgresCredentials;