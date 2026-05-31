import { DataProvider } from "@refinedev/core";
import { stringify } from "query-string";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/admin";
const TOKEN_KEY = "admin_token";

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `${API_URL}/${resource}`;

    const current = (pagination as any)?.current || 1;
    const pageSize = pagination?.pageSize || 10;

    const query: any = {
      _start: (current - 1) * pageSize,
      _end: current * pageSize,
    };

    if (sorters && sorters.length > 0) {
      query._sort = sorters[0].field;
      query._order = sorters[0].order === "desc" ? "DESC" : "ASC";
    }

    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === "eq" || filter.operator === "contains") {
          query[filter.field] = filter.value;
        }
      });
    }

    const response = await fetch(`${url}?${stringify(query)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error fetching data");
    }

    const data = await response.json();
    const total = parseInt(response.headers.get("x-total-count") || "0", 10);

    return {
      data,
      total,
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error fetching data");
    }

    const data = await response.json();

    return {
      data,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `${API_URL}/${resource}`;

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error creating resource");
    }

    const data = await response.json();

    return {
      data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${API_URL}/${resource}/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error updating resource");
    }

    const data = await response.json();

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error deleting resource");
    }

    const data = await response.json();

    return {
      data,
    };
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, headers, payload }) => {
    const requestUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    const response = await fetch(requestUrl, {
      method: method || "GET",
      headers: {
        ...getAuthHeaders(),
        ...headers,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.statusMessage || "Error in custom request");
    }

    const data = await response.json();

    return {
      data,
    };
  },
};
