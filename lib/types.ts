import type { BigQueryCredentials } from "./bigquery";
import type { PostgresCredentials } from "./postgres";
import type { RedshiftCredentials } from "./redshift";
import type { SnowflakeCredentials } from "./snowflake";

export type Credentials = SnowflakeCredentials | BigQueryCredentials | RedshiftCredentials | PostgresCredentials;