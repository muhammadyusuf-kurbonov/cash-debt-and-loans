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

export interface AuthResponseDto {
  token: string;
  user: {
    id: number;
    email?: string;
    telegram_id?: string;
    name?: string;
  };
}

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
  /** @format date-time */
  updatedAt: string;
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
  contact_id?: number;
  currency_id: number;
  user_id: number;
  amount: number;
  note?: string;
  draftId?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
  currency: Currency;
}

export interface CreateTransactionDto {
  contact_id?: number;
  currency_id: number;
  amount: number;
  note?: string;
}

export interface TransactionResponseDto {
  id: number;
  contact_id?: number;
  currency_id: number;
  user_id: number;
  amount: number;
  note?: string;
  draftId?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
}

export interface UpdateTransactionDto {
  note?: string;
}

export interface ProfileDto {
  /** User ID */
  id: number;
  /**
   * User display name
   * @example "John Doe"
   */
  name: string | null;
  /**
   * User email address
   * @example "john@example.com"
   */
  email: string | null;
  /**
   * Telegram ID
   * @example "123456789"
   */
  telegram_id: string | null;
  /** Account verification status */
  is_verified: boolean;
  /**
   * Account creation date
   * @format date-time
   */
  createdAt: string;
}

export interface UpdateProfileDto {
  /** User display name */
  name?: string;
  /**
   * User email address
   * @format email
   * @example "user@example.com"
   */
  email?: string;
}

export interface UpdatePasswordDto {
  /** Current password */
  currentPassword: string;
  /**
   * New password
   * @minLength 6
   * @example "newpassword123"
   */
  newPassword: string;
}

export interface SummaryDto {
  owedToMe: number;
  iOwe: number;
  netBalance: number;
}

export interface TrendItemDto {
  date: string;
  receivables: number;
  payables: number;
}

export interface DebtorCreditorDto {
  contactId: number;
  contactName: string;
  amount: number;
  currencySymbol: string;
}

export interface CurrencyBreakdownDto {
  currencyId: number;
  symbol: string;
  owed: number;
  iOwe: number;
  net: number;
}

export interface Transaction {
  id: number;
  contact_id?: number;
  currency_id: number;
  user_id: number;
  amount: number;
  note?: string;
  draftId?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
}

export interface UserRelations {
  contacts: Contact[];
  transactions: Transaction[];
  isContactFor: Contact[];
}

export interface Balance {
  currency_id: number;
  amount: number;
  contact_id: number;
  /** @format date-time */
  updatedAt: string;
}

export interface CurrencyRelations {
  balances: Balance[];
  transactions: Transaction[];
}

export interface BalanceRelations {
  currency: Currency;
  contact: Contact;
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

export interface TransactionRelations {
  contact?: Contact;
  currency: Currency;
  user: User;
}

export interface ContactRelations {
  user: User;
  ref_user?: User;
  Transaction: Transaction[];
  Balance: Balance[];
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
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
    this.request<string, any>({
      path: `/`,
      method: "GET",
      format: "json",
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
     * @request POST:/auth/telegram_auth
     */
    authControllerTelegramSignUp: (
      data: TelegramAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<AuthResponseDto, void>({
        path: `/auth/telegram_auth`,
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
     * @name ContactsControllerPrepareInvite
     * @summary Prepare an invite message with inline button for Telegram
     * @request GET:/contacts/{id}/prepare-invite
     * @secure
     */
    contactsControllerPrepareInvite: (id: string, params: RequestParams = {}) =>
      this.request<string, void>({
        path: `/contacts/${id}/prepare-invite`,
        method: "GET",
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
        /** Set to true to include cancelled (soft-deleted) transactions */
        includeDeleted?: string;
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

    /**
     * No description
     *
     * @tags contacts
     * @name ContactsControllerRecalculateBalance
     * @summary Recalculate balances for a contact
     * @request POST:/contacts/{id}/recalculate-balance
     * @secure
     */
    contactsControllerRecalculateBalance: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/contacts/${id}/recalculate-balance`,
        method: "POST",
        secure: true,
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

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerUpdate
     * @summary Update a transaction (e.g., edit note)
     * @request PUT:/transactions/{id}
     * @secure
     */
    transactionsControllerUpdate: (
      id: string,
      data: UpdateTransactionDto,
      params: RequestParams = {},
    ) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersControllerGetProfile
     * @summary Get current user profile
     * @request GET:/users/profile
     * @secure
     */
    usersControllerGetProfile: (params: RequestParams = {}) =>
      this.request<ProfileDto, void>({
        path: `/users/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerUpdateProfile
     * @summary Update current user profile
     * @request PUT:/users/profile
     * @secure
     */
    usersControllerUpdateProfile: (
      data: UpdateProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<ProfileDto, void>({
        path: `/users/profile`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerUpdatePassword
     * @summary Update current user password
     * @request PUT:/users/password
     * @secure
     */
    usersControllerUpdatePassword: (
      data: UpdatePasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<ProfileDto, void>({
        path: `/users/password`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  reports = {
    /**
     * No description
     *
     * @tags reports
     * @name ReportsControllerGetSummary
     * @summary Get financial summary
     * @request GET:/reports/summary
     * @secure
     */
    reportsControllerGetSummary: (
      query?: {
        from?: string;
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SummaryDto, any>({
        path: `/reports/summary`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags reports
     * @name ReportsControllerGetTrends
     * @summary Get transaction trends over time
     * @request GET:/reports/trends
     * @secure
     */
    reportsControllerGetTrends: (
      query?: {
        period?: "day" | "week" | "month" | "year";
        from?: string;
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<TrendItemDto[], any>({
        path: `/reports/trends`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags reports
     * @name ReportsControllerGetTopDebtors
     * @summary Get contacts who owe you the most
     * @request GET:/reports/top-debtors
     * @secure
     */
    reportsControllerGetTopDebtors: (
      query?: {
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DebtorCreditorDto[], any>({
        path: `/reports/top-debtors`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags reports
     * @name ReportsControllerGetTopCreditors
     * @summary Get contacts you owe the most
     * @request GET:/reports/top-creditors
     * @secure
     */
    reportsControllerGetTopCreditors: (
      query?: {
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DebtorCreditorDto[], any>({
        path: `/reports/top-creditors`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags reports
     * @name ReportsControllerGetCurrencyBreakdown
     * @summary Get balance breakdown by currency
     * @request GET:/reports/currency-breakdown
     * @secure
     */
    reportsControllerGetCurrencyBreakdown: (params: RequestParams = {}) =>
      this.request<CurrencyBreakdownDto[], any>({
        path: `/reports/currency-breakdown`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
