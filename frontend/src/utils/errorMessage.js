export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  return error?.response?.data?.message || fallback;
}
