export const buildFilters = (
  allowedFilters: string[],
  query: any
): Record<string, any> => {
  const filters: Record<string, any> = {};
  allowedFilters.forEach((key) => {
    if (query[key]) {
      if (query[key] === "true") filters[key] = true;
      else if (query[key] === "false") filters[key] = false;
      else filters[key] = query[key];
    }
  });

  return filters;
};
