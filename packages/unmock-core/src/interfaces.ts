import { OpenAPIObject, ServiceStoreType } from "./service/interfaces";
import { AllowedHosts } from "./settings/allowedHosts";

export { ServiceStoreType };

// tslint:disable-next-line:max-line-length
export type CodeAsInt =
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127
  | 128
  | 129
  | 130
  | 131
  | 132
  | 133
  | 134
  | 135
  | 136
  | 137
  | 138
  | 139
  | 140
  | 141
  | 142
  | 143
  | 144
  | 145
  | 146
  | 147
  | 148
  | 149
  | 150
  | 151
  | 152
  | 153
  | 154
  | 155
  | 156
  | 157
  | 158
  | 159
  | 160
  | 161
  | 162
  | 163
  | 164
  | 165
  | 166
  | 167
  | 168
  | 169
  | 170
  | 171
  | 172
  | 173
  | 174
  | 175
  | 176
  | 177
  | 178
  | 179
  | 180
  | 181
  | 182
  | 183
  | 184
  | 185
  | 186
  | 187
  | 188
  | 189
  | 190
  | 191
  | 192
  | 193
  | 194
  | 195
  | 196
  | 197
  | 198
  | 199
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 209
  | 210
  | 211
  | 212
  | 213
  | 214
  | 215
  | 216
  | 217
  | 218
  | 219
  | 220
  | 221
  | 222
  | 223
  | 224
  | 225
  | 226
  | 227
  | 228
  | 229
  | 230
  | 231
  | 232
  | 233
  | 234
  | 235
  | 236
  | 237
  | 238
  | 239
  | 240
  | 241
  | 242
  | 243
  | 244
  | 245
  | 246
  | 247
  | 248
  | 249
  | 250
  | 251
  | 252
  | 253
  | 254
  | 255
  | 256
  | 257
  | 258
  | 259
  | 260
  | 261
  | 262
  | 263
  | 264
  | 265
  | 266
  | 267
  | 268
  | 269
  | 270
  | 271
  | 272
  | 273
  | 274
  | 275
  | 276
  | 277
  | 278
  | 279
  | 280
  | 281
  | 282
  | 283
  | 284
  | 285
  | 286
  | 287
  | 288
  | 289
  | 290
  | 291
  | 292
  | 293
  | 294
  | 295
  | 296
  | 297
  | 298
  | 299
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308
  | 309
  | 310
  | 311
  | 312
  | 313
  | 314
  | 315
  | 316
  | 317
  | 318
  | 319
  | 320
  | 321
  | 322
  | 323
  | 324
  | 325
  | 326
  | 327
  | 328
  | 329
  | 330
  | 331
  | 332
  | 333
  | 334
  | 335
  | 336
  | 337
  | 338
  | 339
  | 340
  | 341
  | 342
  | 343
  | 344
  | 345
  | 346
  | 347
  | 348
  | 349
  | 350
  | 351
  | 352
  | 353
  | 354
  | 355
  | 356
  | 357
  | 358
  | 359
  | 360
  | 361
  | 362
  | 363
  | 364
  | 365
  | 366
  | 367
  | 368
  | 369
  | 370
  | 371
  | 372
  | 373
  | 374
  | 375
  | 376
  | 377
  | 378
  | 379
  | 380
  | 381
  | 382
  | 383
  | 384
  | 385
  | 386
  | 387
  | 388
  | 389
  | 390
  | 391
  | 392
  | 393
  | 394
  | 395
  | 396
  | 397
  | 398
  | 399
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 419
  | 420
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 427
  | 428
  | 429
  | 430
  | 431
  | 432
  | 433
  | 434
  | 435
  | 436
  | 437
  | 438
  | 439
  | 440
  | 441
  | 442
  | 443
  | 444
  | 445
  | 446
  | 447
  | 448
  | 449
  | 450
  | 451
  | 452
  | 453
  | 454
  | 455
  | 456
  | 457
  | 458
  | 459
  | 460
  | 461
  | 462
  | 463
  | 464
  | 465
  | 466
  | 467
  | 468
  | 469
  | 470
  | 471
  | 472
  | 473
  | 474
  | 475
  | 476
  | 477
  | 478
  | 479
  | 480
  | 481
  | 482
  | 483
  | 484
  | 485
  | 486
  | 487
  | 488
  | 489
  | 490
  | 491
  | 492
  | 493
  | 494
  | 495
  | 496
  | 497
  | 498
  | 499
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 509
  | 510
  | 511
  | 512
  | 513
  | 514
  | 515
  | 516
  | 517
  | 518
  | 519
  | 520
  | 521
  | 522
  | 523
  | 524
  | 525
  | 526
  | 527
  | 528
  | 529
  | 530
  | 531
  | 532
  | 533
  | 534
  | 535
  | 536
  | 537
  | 538
  | 539
  | 540
  | 541
  | 542
  | 543
  | 544
  | 545
  | 546
  | 547
  | 548
  | 549
  | 550
  | 551
  | 552
  | 553
  | 554
  | 555
  | 556
  | 557
  | 558
  | 559
  | 560
  | 561
  | 562
  | 563
  | 564
  | 565
  | 566
  | 567
  | 568
  | 569
  | 570
  | 571
  | 572
  | 573
  | 574
  | 575
  | 576
  | 577
  | 578
  | 579
  | 580
  | 581
  | 582
  | 583
  | 584
  | 585
  | 586
  | 587
  | 588
  | 589
  | 590
  | 591
  | 592
  | 593
  | 594
  | 595
  | 596
  | 597
  | 598
  | 599;

const RESTMethodTypes = [
  "get",
  "head",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "trace"
] as const;

export type HTTPMethod = typeof RESTMethodTypes[number];

export const isRESTMethod = (maybeMethod: string): maybeMethod is HTTPMethod =>
  RESTMethodTypes.toString().includes(maybeMethod.toLowerCase());

export interface ILogger {
  log(message: string): void;
}

export interface IListenerInput {
  req: ISerializedRequest;
  res?: ISerializedResponse;
}

export interface IListener {
  notify(input: IListenerInput): void;
}

export interface IUnmockOptions extends ILogger {
  useInProduction(): boolean;
  isWhitelisted(url: string): boolean;
  flaky(): boolean;
}

export interface IUnmockPackage {
  /**
   * List of whitelisted hosts/endpoints. These will not be intercepted by unmock.
   * Supports wildcards and regular expressions.
   */
  allowedHosts: AllowedHosts;

  /**
   * A mapping of service name to a service object.
   * Allows you to access a service spy, modify a state, etc.
   */
  services: ServiceStoreType;

  /**
   * Starts intercepting outgoing requests.
   */
  on(): IUnmockPackage;

  /**
   * Alias for on()
   */
  init(): IUnmockPackage;

  /**
   * Alias for on()
   */
  initialize(): IUnmockPackage;

  /**
   * Stops intercepting outgoing requests. Spies and states are reset.
   */
  off(): void;

  /**
   * Reloads all services for unmock.
   * Any dynamically-defined services will be deleted.
   */
  reloadServices(): void;

  /**
   * Resets all services' state, including spies.
   */
  reset(): void;
}

/**
 * Analogous to `IncomingHttpHeaders` in @types/node.
 * Header names are expected to be _lowercased_.
 */
export interface IIncomingHeaders {
  [header: string]: string | string[] | undefined;
}

/**
 * Analogous to `OutgoingHttpHeaders` in @types/node.
 * Allows numbers as they are converted to strings internally.
 */
export interface IOutgoingHeaders {
  [header: string]: string | string[] | number | undefined;
}

export interface IIncomingQuery {
  [key: string]: string | string[] | undefined;
}

export interface ISerializedRequest {
  body?: string | object;
  headers?: IIncomingHeaders;
  host: string;
  method: HTTPMethod;
  /**
   * Full path containing query parameters
   */
  path: string;
  /**
   * Path name not containing query parameters
   */
  pathname: string;
  /**
   * Query parameters
   */
  query: IIncomingQuery;
  protocol: "http" | "https";
}

export interface ISerializedResponse {
  body?: string;
  headers?: IOutgoingHeaders;
  statusCode: number;
}

export type CreateResponse = (
  request: ISerializedRequest
) => ISerializedResponse | undefined;

export type IStateTransformer = (
  req: ISerializedRequest,
  o: OpenAPIObject
) => OpenAPIObject;

export interface IServiceDefFile {
  /**
   * Basename for the service definition file: for example, `index.yaml`.
   */
  basename: string;
  /**
   * Contents of the service definition file
   */
  contents: string | Buffer;
}

/**
 * Input to the service parser. Contains, e.g., the directory name and all available files.
 */
export interface IServiceDef {
  /**
   * Absolute path to the service directory
   */
  absolutePath: string;

  /**
   * Name of the service directory: for example, `petstore`.
   */

  directoryName: string;
  /**
   * All the files defining the service.
   */
  serviceFiles: IServiceDefFile[];
}
