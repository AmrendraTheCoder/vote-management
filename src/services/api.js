const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vote-management-alpha.vercel.app/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      console.log(`Making request to: ${url}`);
      console.log("Request options:", options);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Try to get response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 100)}...`
        );
      }

      console.log("Parsed response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }

      return data; // Return the parsed data directly
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error.message,
        message: error.message,
      };
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
