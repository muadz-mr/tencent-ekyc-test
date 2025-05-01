export type TEnum = {
  value: string | number;
  description: string;
  key: string;
};

export type TApiResponse<T> = {
  data: T;
  message: string;
};

export type TApiError = {
  code: number;
  message: string;
  errors?: object;
};

export type TError = {
  data: {
    data?: unknown | undefined;
    message: string;
    error: boolean;
    statusCode: string;
    statusMessage: string;
  } & Error;
};

export type TIdData = {
  request_id: string;
  head_portrait: string;
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  surname?: string;
  given_name?: string;
  address?: string;
  date_of_birth?: string;
  sex?: string;
  nationality?: string;
  license_number?: string;
  license_no?: string;
  expires_date?: string;
  agency_code?: string;
  issue_date?: string;
  vin?: string;
  civil_status?: string;
  citizenship?: string;
  precinct_no?: string;
  crn?: string;
};

export type TVerifySelfieData = {
  request_id: string;
  result: string;
  description: string;
  similarity: number;
  best_frame_base64: string;
};
