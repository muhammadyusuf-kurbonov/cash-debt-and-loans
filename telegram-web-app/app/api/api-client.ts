/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type SignUpDto = object;

export type AuthResponseDto = object;

export type SignInDto = object;

export interface TelegramAuthDto {
  /** Telegram Web App init data string */
  initData: string;
}

export interface CreateCurrencyDto {
  name: string;
  symbol: string;
}

export interface CurrencyResponseDto {
  id: number;
  name: string;
  symbol: string;
  /** @format date-time */
  createdAt: string;
}

export interface UpdateCurrencyDto {
  name?: string;
  symbol?: string;
}

export interface CreateContactDto {
  name?: string;
  ref_user_id?: number;
}

export interface Contact {
  id: number;
  user_id: number;
  name?: string;
  ref_user_id?: number;
}

export interface Currency {
  id: number;
  name: string;
  symbol: string;
  /** @format date-time */
  createdAt: string;
}

export interface IntersectionBalancePickTypeClass {
  currency_id: number;
  amount: number;
  contact_id: number;
  currency: Currency;
}

export interface ContactResponseDto {
  id: number;
  user_id: number;
  name?: string;
  ref_user_id?: number;
  Balance: IntersectionBalancePickTypeClass[];
}

export interface UpdateContactDto {
  name?: string;
  ref_user_id?: number;
}

export interface IntersectionTransactionPickTypeClass {
  id: number;
  contact_id: number;
  currency_id: number;
  amount: number;
  note?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
  currency: Currency;
}

export interface CreateTransactionDto {
  contact_id: number;
  currency_id: number;
  amount: number;
  note?: string;
}

export interface TransactionResponseDto {
  id: number;
  contact_id: number;
  currency_id: number;
  amount: number;
  note?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
}

export interface UserRelations {
  contacts: Contact[];
  isContactFor: Contact[];
}

export interface Balance {
  currency_id: number;
  amount: number;
  contact_id: number;
}

export interface Transaction {
  id: number;
  contact_id: number;
  currency_id: number;
  amount: number;
  note?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
}

export interface CurrencyRelations {
  balances: Balance[];
  transactions: Transaction[];
}

export interface BalanceRelations {
  currency: Currency;
  contact: Contact;
}

export interface TransactionRelations {
  contact: Contact;
  currency: Currency;
}

export interface User {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  telegram_id?: string;
  verification_code?: string;
  is_verified: boolean;
}

export interface ContactRelations {
  user: User;
  ref_user?: User;
  Transaction: Transaction[];
  Balance: Balance[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Qarz.uz backend
 * @version 1.0
 * @contact
 *
 * API for managing debts and loans
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  auth = {
    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSignUp
     * @summary Sign up a new user with email and password
     * @request POST:/auth/signup
     */
    authControllerSignUp: (data: SignUpDto, params: RequestParams = {}) =>
      this.request<AuthResponseDto, any>({
        path: `/auth/signup`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSignIn
     * @summary Sign in with email and password
     * @request POST:/auth/signin
     */
    authControllerSignIn: (data: SignInDto, params: RequestParams = {}) =>
      this.request<AuthResponseDto, void>({
        path: `/auth/signin`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerTelegramSignUp
     * @summary Sign up a new user through Telegram
     * @request POST:/auth/telegram_sigin
     */
    authControllerTelegramSignUp: (
      data: TelegramAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<AuthResponseDto, void>({
        path: `/auth/telegram_sigin`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  currencies = {
    /**
     * No description
     *
     * @tags currencies
     * @name CurrencyControllerCreate
     * @summary Create a new currency
     * @request POST:/currencies
     * @secure
     */
    currencyControllerCreate: (
      data: CreateCurrencyDto,
      params: RequestParams = {},
    ) =>
      this.request<CurrencyResponseDto, any>({
        path: `/currencies`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags currencies
     * @name CurrencyControllerFindAll
     * @summary Get all currencies for current user
     * @request GET:/currencies
     * @secure
     */
    currencyControllerFindAll: (params: RequestParams = {}) =>
      this.request<CurrencyResponseDto[], any>({
        path: `/currencies`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags currencies
     * @name CurrencyControllerFindOne
     * @summary Get a specific currency
     * @request GET:/currencies/{id}
     * @secure
     */
    currencyControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<CurrencyResponseDto, void>({
        path: `/currencies/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags currencies
     * @name CurrencyControllerUpdate
     * @summary Update a currency
     * @request PATCH:/currencies/{id}
     * @secure
     */
    currencyControllerUpdate: (
      id: string,
      data: UpdateCurrencyDto,
      params: RequestParams = {},
    ) =>
      this.request<CurrencyResponseDto, void>({
        path: `/currencies/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags currencies
     * @name CurrencyControllerRemove
     * @summary Delete a currency
     * @request DELETE:/currencies/{id}
     * @secure
     */
    currencyControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<CurrencyResponseDto, void>({
        path: `/currencies/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  contacts = {
    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerCreate
     * @summary Create a new contact
     * @request POST:/contacts
     * @secure
     */
    contactsControllerCreate: (
      data: CreateContactDto,
      params: RequestParams = {},
    ) =>
      this.request<Contact, any>({
        path: `/contacts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerFindAll
     * @summary Get all contacts for current user
     * @request GET:/contacts
     * @secure
     */
    contactsControllerFindAll: (params: RequestParams = {}) =>
      this.request<ContactResponseDto[], any>({
        path: `/contacts`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerFindOne
     * @summary Get a specific contact
     * @request GET:/contacts/{id}
     * @secure
     */
    contactsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<ContactResponseDto, void>({
        path: `/contacts/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerUpdate
     * @summary Update a contact
     * @request PATCH:/contacts/{id}
     * @secure
     */
    contactsControllerUpdate: (
      id: string,
      data: UpdateContactDto,
      params: RequestParams = {},
    ) =>
      this.request<Contact, void>({
        path: `/contacts/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerRemove
     * @summary Delete a contact
     * @request DELETE:/contacts/{id}
     * @secure
     */
    contactsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/contacts/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerGetBalance
     * @summary Get balances for a specific contact
     * @request GET:/contacts/{id}/balance
     * @secure
     */
    contactsControllerGetBalance: (
      id: string,
      query?: {
        /** Optional currency ID to filter balances */
        currencyId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<IntersectionBalancePickTypeClass[], void>({
        path: `/contacts/${id}/balance`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerGetTransactions
     * @summary Get transactions for a specific contact
     * @request GET:/contacts/{id}/transactions
     * @secure
     */
    contactsControllerGetTransactions: (
      id: string,
      query?: {
        /** Optional currency ID to filter balances */
        currencyId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<IntersectionTransactionPickTypeClass[], void>({
        path: `/contacts/${id}/transactions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  transactions = {
    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerTopup
     * @summary Top up balance for a contact
     * @request POST:/transactions/topup
     * @secure
     */
    transactionsControllerTopup: (
      data: CreateTransactionDto,
      params: RequestParams = {},
    ) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/topup`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerWithdraw
     * @summary Withdraw balance from a contact
     * @request POST:/transactions/withdraw
     * @secure
     */
    transactionsControllerWithdraw: (
      data: CreateTransactionDto,
      params: RequestParams = {},
    ) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/withdraw`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerCancel
     * @summary Cancel a transaction
     * @request POST:/transactions/{id}/cancel
     * @secure
     */
    transactionsControllerCancel: (id: string, params: RequestParams = {}) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/${id}/cancel`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
