import type { TFunction } from 'i18next';

const REQUEST_TIMEOUT_MESSAGE = 'Request timed out. Please try again.';
const NETWORK_FAILURE_MESSAGE = 'Unable to reach the server. Please check the backend and try again.';
const INVALID_RESPONSE_MESSAGE = 'Received invalid server response.';

export const getDisplayErrorMessage = (error: unknown, t: TFunction) => {
  if (!(error instanceof Error)) {
    return t('error.requestFailed');
  }

  switch (error.message) {
    case REQUEST_TIMEOUT_MESSAGE:
      return t('error.timeout');
    case NETWORK_FAILURE_MESSAGE:
      return t('error.network');
    case INVALID_RESPONSE_MESSAGE:
      return t('error.invalidResponse');
    default:
      return error.message.trim().length > 0 ? error.message : t('error.requestFailed');
  }
};
