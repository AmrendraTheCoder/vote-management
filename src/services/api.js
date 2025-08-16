const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Student API methods
  async getStudents() {
    return this.makeRequest("/students");
  }

  async createStudent(studentData) {
    return this.makeRequest("/students", {
      method: "POST",
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, studentData) {
    return this.makeRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.makeRequest(`/students/${id}`, {
      method: "DELETE",
    });
  }

  async createBulkStudents(students) {
    return this.makeRequest("/students/bulk", {
      method: "POST",
      body: JSON.stringify({ students }),
    });
  }

  async getStats() {
    return this.makeRequest("/students/stats");
  }

  async healthCheck() {
    return this.makeRequest("/health");
  }
}

export default new ApiService();
