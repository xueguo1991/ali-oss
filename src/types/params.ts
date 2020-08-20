/* eslint-disable max-len */

export type ACLType = 'public-read-write' | 'public-read' | 'private';

export type SSEAlgorithm = 'KMS' | 'AES256';

export type RuleStatusType = 'Enabled' | 'Disabled';

export interface Tag {
  [propsName: string]: string
}

export interface RequestOptions {
  timeout?: number;
  headers?: object;
  subres?: object;
}

interface UserMeta {
  uid: number;
  pid: number;
}

interface Checkpoint {
  file: any; // The file object selected by the user, if the browser is restarted, it needs the user to manually trigger the settings
  name: string; //  object key
  fileSize: number;
  partSize: number;
  uploadId: string;
  doneParts: Array<{ number: number; etag: string }>;
}

interface ObjectCallback {
  url: string; // After a file is uploaded successfully, the OSS sends a callback request to this URL.
  host?: string; // The host header value for initiating callback requests.
  body: string; // The value of the request body when a callback is initiated, for example, key=$(key)&etag=$(etag)&my_var=$(x:my_var).
  contentType?: string; // The Content-Type of the callback requests initiatiated, It supports application/x-www-form-urlencoded and application/json, and the former is the default value.
  customValue?: object;
  headers?: object; //  extra headers, detail see RFC 2616
}

export interface MultipartUploadOptions extends RequestOptions {
  parallel?: number; // the number of parts to be uploaded in parallel
  partSize?: number; // the suggested size for each part
  progress?: (...args: any[]) => any; // the progress callback called after each successful upload of one part
  checkpoint?: Checkpoint; // the checkpoint to resume upload, if this is provided, it will continue the upload from where interrupted, otherwise a new multipart upload will be created.
  meta?: UserMeta;
  mime?: string;
  callback?: ObjectCallback;
  copyheaders?: object; //  {Object} only uploadPartCopy api used, detail
  contentLength?: number;
}

export interface GetStreamOptions extends RequestOptions {
  process?: string; // image process params, will send with x-oss-process e.g.: {process: 'image/resize,w_200'}
}

export interface PutObjectOptions extends RequestOptions {
  mime?: string; // custom mime, will send with Content-Type entity header
  meta?: UserMeta; // user meta, will send with x-oss-meta- prefix string e.g.: { uid: 123, pid: 110 }
  callback?: ObjectCallback;
  contentLength?: number;
  method?: string; // append object need
}

export interface PutBucketOptions extends RequestOptions {
  storageClass?: string;
  StorageClass?: string;
  DataRedundancyType?: string;
  dataRedundancyType?: string;
  acl?: ACLType;
}

export interface CORSRuleConfig {
  allowedOrigin: string | string[]; // configure for Access-Control-Allow-Origin header
  allowedMethod: string | string[]; // configure for Access-Control-Allow-Methods header
  allowedHeader?: string | string[]; // configure for Access-Control-Allow-Headers header
  exposeHeader?: string | string[]; // configure for Access-Control-Expose-Headers header
  maxAgeSeconds?: string | string[]; // configure for Access-Control-Max-Age header
}

export interface PutBucketEncryptionOptions extends RequestOptions{
  SSEAlgorithm: SSEAlgorithm;
  KMSMasterKeyID?: string;
}

export interface LifecycleRule {
  id?: string; // rule id, if not set, OSS will auto create it with random string.
  prefix: string; // store prefix
  status: RuleStatusType; // rule status, allow values: Enabled or Disabled
  days?: number | string; // expire after the days
  createdBeforeDate?: string; //  expire date, equivalent date. e.g: 2020-02-18T00:00:00.000Z
  date?: string; // expire date, e.g.: 2022-10-11T00:00:00.000Z date and days only set one.
  tag?: Tag | Tag[]; // filter object
  abortMultipartUpload: string
}
